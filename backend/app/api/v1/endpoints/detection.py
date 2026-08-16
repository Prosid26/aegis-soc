from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.services.detection_engine import DetectionEngine
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.detection import Detection
from app.models.incident import Incident

router = APIRouter()

def _save_alerts_to_db(db: Session, alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Save detection alerts to the database and create incidents, then return the same alerts."""
    for alert in alerts:
        # Create detection object
        detection = Detection(
            rule_id=alert["rule_id"],
            rule_name=alert["name"],
            description=alert["description"],
            severity=alert["severity"],
            confidence=alert["confidence"],
            risk_score=alert["risk_score"],
            timestamp=alert["timestamp"],
            status="NEW",
            event_ids=alert["event_ids"],
            evidence=alert["evidence"]
        )
        # Set optional fields from evidence if available
        evidence = alert.get("evidence", {})
        detection.source_ip = evidence.get("source_ip")
        detection.destination_ip = evidence.get("destination_ip")
        # For user, asset, and asset_id, we try to get from evidence or from the first sample event if available
        # In our detection engine, we sometimes have user and asset in the evidence directly, or in sample_events.
        # We'll try to get from evidence first, then from sample_events[0] if evidence doesn't have it.
        detection.user = evidence.get("user")
        detection.asset = evidence.get("asset")
        # If we don't have user or asset in evidence, try to get from the first sample event
        if not detection.user or not detection.asset:
            sample_events = evidence.get("sample_events", [])
            if sample_events:
                first_event = sample_events[0]
                if not detection.user:
                    detection.user = first_event.get("user")
                if not detection.asset:
                    detection.asset = first_event.get("asset")
        # Note: asset_id is left as NULL for now; we could set it by looking up the asset by name, but we skip for simplicity.
        db.add(detection)
        # Flush to get the detection ID for the incident relationship? Actually, we can append the detection to incident.detections without flushing because the relationship is set up to use the association table.
        # But to be safe, we can flush the detection to get an ID.
        db.flush()  # This assigns an ID to the detection without committing

        # Create an incident for this detection
        incident = Incident(
            title=f"Incident: {alert['name']}",
            description=alert["description"],
            severity=alert["severity"],
            status="NEW",
            risk_score=alert["risk_score"],
            confidence=alert["confidence"],
            timeline=[{"timestamp": alert["timestamp"].isoformat(), "type": "detection_detected"}],
            raw_data=alert["evidence"]
        )
        # Link the detection to the incident
        incident.detections.append(detection)
        db.add(incident)
    db.commit()
    return alerts

@router.post("/run", response_model=List[Dict[str, Any]])
def run_detection_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run all detection rules and return alerts
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.run_all_detections()
    _save_alerts_to_db(db, alerts)
    return alerts

@router.post("/brute-force", response_model=List[Dict[str, Any]])
def run_brute_force_detection(
    time_window_minutes: int = 5,
    threshold: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run brute force detection rule
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.detect_brute_force(time_window_minutes, threshold)
    _save_alerts_to_db(db, alerts)
    return alerts

@router.post("/port-scan", response_model=List[Dict[str, Any]])
def run_port_scan_detection(
    threshold_ports: int = 20,
    time_window_minutes: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run port scan detection rule
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.detect_port_scan(threshold_ports, time_window_minutes)
    _save_alerts_to_db(db, alerts)
    return alerts

@router.post("/privilege-escalation", response_model=List[Dict[str, Any]])
def run_privilege_escalation_detection(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run privilege escalation detection rule
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.detect_privilege_escalation()
    _save_alerts_to_db(db, alerts)
    return alerts