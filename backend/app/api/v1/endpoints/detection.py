from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.db.session import get_db
from app.services.detection_engine import DetectionEngine
from app.services.correlation_engine import get_correlation_engine, CorrelationEngine
from app.services.mitre_mapping import get_mitre_techniques_for_rule
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.detection import Detection
from app.models.incident import Incident
from app.models.mitre import MITRETechnique
from app.core.rate_limiting import limiter

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

        # Link detection to MITRE techniques if available in the alert
        if "mitre" in alert and alert["mitre"]:
            # We expect alert["mitre"] to be a list of dicts with at least "technique_id"
            # But we need the technique IDs to query the MITRETechnique objects
            # We can get the technique IDs from the alert's mitre list, but note: we don't have the technique ID in the alert's mitre dict? We added it.
            mitre_technique_ids = [m["technique_id"] for m in alert["mitre"] if "technique_id" in m]
            if mitre_technique_ids:
                techniques = db.query(MITRETechnique).filter(MITRETechnique.id.in_(mitre_technique_ids)).all()
                detection.mitre_techniques.extend(techniques)

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
        # Link incident to the same MITRE techniques as the detection
        if "mitre" in alert and alert["mitre"]:
            mitre_technique_ids = [m["technique_id"] for m in alert["mitre"] if "technique_id" in m]
            if mitre_technique_ids:
                techniques = db.query(MITRETechnique).filter(MITRETechnique.id.in_(mitre_technique_ids)).all()
                incident.mitre_techniques.extend(techniques)
        db.add(incident)
    db.commit()
    return alerts


@router.post("/run", response_model=List[Dict[str, Any]])
@limiter.limit("5/minute")
def run_detection_rules(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run all detection rules and return alerts
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.run_all_detections()
    # Augment alerts with MITRE context
    for alert in alerts:
        mitre_techniques = get_mitre_techniques_for_rule(db, alert["rule_id"])
        alert["mitre"] = [
            {
                "technique_id": t.technique_id,
                "technique_name": t.name,
                "tactic": t.tactic,
                "description": t.description,
            }
            for t in mitre_techniques
        ]
    _save_alerts_to_db(db, alerts)
    return alerts


@router.post("/brute-force", response_model=List[Dict[str, Any]])
@limiter.limit("5/minute")
def run_brute_force_detection(
    request: Request,
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
    # Augment alerts with MITRE context
    for alert in alerts:
        mitre_techniques = get_mitre_techniques_for_rule(db, alert["rule_id"])
        alert["mitre"] = [
            {
                "technique_id": t.technique_id,
                "technique_name": t.name,
                "tactic": t.tactic,
                "description": t.description,
            }
            for t in mitre_techniques
        ]
    _save_alerts_to_db(db, alerts)
    return alerts


@router.post("/port-scan", response_model=List[Dict[str, Any]])
@limiter.limit("5/minute")
def run_port_scan_detection(
    request: Request,
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
    # Augment alerts with MITRE context
    for alert in alerts:
        mitre_techniques = get_mitre_techniques_for_rule(db, alert["rule_id"])
        alert["mitre"] = [
            {
                "technique_id": t.technique_id,
                "technique_name": t.name,
                "tactic": t.tactic,
                "description": t.description,
            }
            for t in mitre_techniques
        ]
    _save_alerts_to_db(db, alerts)
    return alerts


@router.post("/privilege-escalation", response_model=List[Dict[str, Any]])
@limiter.limit("5/minute")
def run_privilege_escalation_detection(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run privilege escalation detection rule
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.detect_privilege_escalation()
    # Augment alerts with MITRE context
    for alert in alerts:
        mitre_techniques = get_mitre_techniques_for_rule(db, alert["rule_id"])
        alert["mitre"] = [
            {
                "technique_id": t.technique_id,
                "technique_name": t.name,
                "tactic": t.tactic,
                "description": t.description,
            }
            for t in mitre_techniques
        ]
    _save_alerts_to_db(db, alerts)
    return alerts


@router.get("/correlations", response_model=List[Dict[str, Any]])
@limiter.limit("10/minute")
def get_correlations(
    request: Request,
    severity: Optional[str] = None,
    asset: Optional[str] = None,
    source_ip: Optional[str] = None,
    user: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    window_minutes: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get correlated events (attack chains) with optional filtering.
    Filter by severity, asset, source_ip, user, and time range.
    Time range can be specified by either start_time and end_time (ISO format strings)
    or window_minutes (last N minutes from now). If neither is provided, defaults to last 60 minutes.
    """
    # Parse time parameters
    parsed_start_time: Optional[datetime] = None
    parsed_end_time: Optional[datetime] = None

    if start_time and end_time:
        try:
            parsed_start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            parsed_end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_time or end_time format. Use ISO format.")
    elif window_minutes is not None:
        parsed_end_time = datetime.utcnow()
        parsed_start_time = parsed_end_time - timedelta(minutes=window_minutes)
    # If neither time range nor window is provided, the correlation engine will default to last 60 minutes

    # Get correlations from engine
    correlation_engine = get_correlation_engine(db)
    correlations = correlation_engine.correlate_events(
        start_time=parsed_start_time,
        end_time=parsed_end_time
    )

    # Apply filters
    filtered_correlations = []
    for corr in correlations:
        # Severity filter (case-insensitive)
        if severity and corr["severity"].lower() != severity.lower():
            continue

        # Asset filter: check if asset ID is in assets_involved
        if asset:
            # Assume asset parameter is asset ID (integer as string)
            try:
                asset_id = int(asset)
                if asset_id not in corr["assets_involved"]:
                    continue
            except ValueError:
                # If not an integer, maybe it's asset name? We don't have asset name in correlation result.
                # For simplicity, we skip name-based filtering without a join.
                # We could join with asset table, but to keep it simple and avoid extra DB load,
                # we'll only support asset ID filtering.
                # If the user wants to filter by name, they need to know the ID or we'd need to do a lookup.
                # We'll do a simple lookup: if asset is not a number, treat as name and find matching assets.
                # But note: we are not allowed to change schema, but we can query.
                # We'll do a quick lookup for asset name -> ID.
                asset_obj = db.query(Asset).filter(Asset.hostname.ilike(f"%{asset}%")).first()
                if not asset_obj:
                    # No matching asset, so this correlation won't match
                    continue
                if asset_obj.id not in corr["assets_involved"]:
                    continue

        # Source IP filter
        if source_ip and source_ip not in corr["source_ips_involved"]:
            continue

        # User filter
        if user and user not in corr["users_involved"]:
            continue

        filtered_correlations.append(corr)

    return filtered_correlations