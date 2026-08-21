from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, and_, or_
from app.models.event import Event
from app.models.asset import Asset
from app.models.threat_intel import ThreatIntel
from app.models.association import event_threat_intel
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)


class DetectionEngine:
    def __init__(self, db: Session):
        self.db = db

    def _compute_risk_score(self, severity: str, confidence: int, event_count: int, asset_critical: bool,
                          threat_intel_confidence: Optional[int] = None,
                          threat_intel_severity: Optional[str] = None,
                          mitre_present: bool = False) -> Dict[str, Any]:
        """
        Compute risk score (0-100) with explainable factors.
        Returns dict with 'score' and 'factors'.
        """
        # Severity points: low=10, medium=30, high=60, critical=80
        severity_scores = {
            "low": 10,
            "medium": 30,
            "high": 60,
            "critical": 80
        }
        severity_points = severity_scores.get(severity.lower(), 20)

        # Confidence contributes up to 30 points (0-100 * 0.3)
        confidence_points = min(30, confidence * 0.3)

        # Event count contributes up to 20 points (assuming >10 events is rare)
        event_count_points = min(20, event_count * 2)

        # Asset criticality adds 20 points
        critical_points = 20 if asset_critical else 0

        # Base score
        base_score = severity_points + confidence_points + event_count_points + critical_points

        # Threat intelligence points: up to 10 points based on confidence
        threat_intel_points = 0
        if threat_intel_confidence is not None:
            threat_intel_points = min(10, threat_intel_confidence * 0.1)

        # MITRE ATT&CK points: up to 10 points if MITRE mapping exists
        mitre_points = 10 if mitre_present else 0

        # Calculate final score with caps
        final_score = base_score + threat_intel_points + mitre_points
        final_score = min(100, final_score)

        # Build factors breakdown
        factors = {
            "severity_points": severity_points,
            "confidence_points": confidence_points,
            "event_count_points": event_count_points,
            "critical_points": critical_points,
            "threat_intel_points": threat_intel_points,
            "mitre_points": mitre_points,
            "base_score": base_score,
            "final_score": final_score
        }

        # Add optional threat intel details if provided
        if threat_intel_severity is not None:
            factors["threat_intel_severity"] = threat_intel_severity
        if threat_intel_confidence is not None:
            factors["threat_intel_confidence"] = threat_intel_confidence

        return {
            "score": int(final_score),
            "factors": factors
        }

    def _get_asset_criticality(self, asset_id: int) -> bool:
        """Check if asset is critical."""
        if asset_id is None:
            return False
        asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
        return asset.is_critical if asset else False

    def detect_brute_force(self, time_window_minutes: int = 5, threshold: int = 10) -> List[Dict[str, Any]]:
        """
        Detect brute force authentication attempts
        Multiple authentication failures from one source within a time window
        """
        alerts = []
        since = datetime.utcnow() - timedelta(minutes=time_window_minutes)

        # Group by source IP and count authentication failures
        failure_counts = self.db.query(
            Event.source_ip,
            func.count(Event.id).label('failure_count')
        ).filter(
            Event.event_type == "authentication_failure",
            Event.timestamp >= since
        ).group_by(
            Event.source_ip
        ).having(
            func.count(Event.id) >= threshold
        ).all()

        for ip, count in failure_counts:
            # Get the failure events for evidence
            failure_events = self.db.query(Event).filter(
                Event.source_ip == ip,
                Event.event_type == "authentication_failure",
                Event.timestamp >= since
            ).order_by(Event.timestamp.desc()).limit(10).all()

            # Determine asset criticality (if any asset associated)
            asset_critical = False
            if failure_events:
                # Take the first event's asset_id
                asset_id = failure_events[0].asset_id
                asset_critical = self._get_asset_criticality(asset_id)

            # Compute risk score
            risk_result = self._compute_risk_score(
                severity="high" if count >= 20 else "medium",
                confidence=min(95, 60 + (count - threshold) * 2),
                event_count=count,
                asset_critical=asset_critical
            )

            alert = {
                "rule_id": "BRUTE_FORCE_001",
                "name": "Brute Force Authentication Attempt",
                "description": f"Detected {count} authentication failures from IP {ip} within {time_window_minutes} minutes",
                "severity": "high" if count >= 20 else "medium",
                "confidence": min(95, 60 + (count - threshold) * 2),
                "risk_score": risk_result["score"],
                "risk_score_factors": risk_result["factors"],
                "event_ids": [e.id for e in failure_events],
                "evidence": {
                    "source_ip": ip,
                    "failure_count": count,
                    "time_window_minutes": time_window_minutes,
                    "sample_events": [
                        {
                            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                            "user": e.user,
                            "asset": e.asset
                        }
                        for e in failure_events[:5]
                    ]
                },
                "timestamp": datetime.utcnow(),
                "event_type": "brute_force_detected",
                "metadata": {
                    "rule_version": "1.0",
                    "threshold": threshold,
                    "time_window": time_window_minutes
                }
            }
            alerts.append(alert)
            logger.info(f"Brute force detection triggered: {count} failures from {ip}")

        return alerts

    def detect_impossible_travel(self, time_window_minutes: int = 5) -> List[Dict[str, Any]]:
        """
        Detect impossible travel - logins from geographically distant locations
        in unrealistic timeframe.
        Since we lack geolocation, we flag any two successful logins for the same user
        from different IPs within a short time window as impossible travel.
        """
        alerts = []
        since = datetime.utcnow() - timedelta(minutes=time_window_minutes)

        # Get successful logins in the time window
        success_logins = self.db.query(Event).filter(
            Event.event_type == "authentication_success",
            Event.timestamp >= since
        ).order_by(Event.timestamp.asc()).all()

        # Group by user
        user_sessions = {}
        for login in success_logins:
            user = login.user
            if user not in user_sessions:
                user_sessions[user] = []
            user_sessions[user].append(login)

        for user, logins in user_sessions.items():
            if len(logins) < 2:
                continue
            # Check if any two consecutive logins have different IPs
            for i in range(len(logins) - 1):
                curr = logins[i]
                nxt = logins[i + 1]
                if curr.source_ip != nxt.source_ip:
                    # Different IPs within time window (already filtered by since)
                    # Determine asset criticality (if any asset associated)
                    asset_critical = False
                    if curr.asset_id:
                        asset_critical = self._get_asset_criticality(curr.asset_id)
                    # Compute risk score
                    risk_result = self._compute_risk_score(
                        severity="medium",
                        confidence=80,  # high confidence for impossible travel
                        event_count=2,  # at least two events
                        asset_critical=asset_critical
                    )
                    alert = {
                        "rule_id": "IMPOSSIBLE_TRAVEL_001",
                        "name": "Impossible Travel Detected",
                        "description": f"User {user} logged in from {curr.source_ip} and then {nxt.source_ip} within {time_window_minutes} minutes",
                        "severity": "medium",
                        "confidence": 80,
                        "risk_score": risk_result["score"],
                        "risk_score_factors": risk_result["factors"],
                        "event_ids": [curr.id, nxt.id],
                        "evidence": {
                            "user": user,
                            "source_ip_1": curr.source_ip,
                            "source_ip_2": nxt.source_ip,
                            "timestamp_1": curr.timestamp.isoformat() if curr.timestamp else None,
                            "timestamp_2": nxt.timestamp.isoformat() if nxt.timestamp else None,
                            "time_window_minutes": time_window_minutes
                        },
                        "timestamp": datetime.utcnow(),
                        "event_type": "impossible_travel_detected",
                        "metadata": {
                            "rule_version": "1.0",
                            "time_window": time_window_minutes
                        }
                    }
                    alerts.append(alert)
                    logger.info(f"Impossible travel detection triggered for user {user}: {curr.source_ip} -> {nxt.source_ip}")
                    # Break after first detection for this user to avoid multiple alerts for same session
                    break

        return alerts

    def detect_port_scan(self, threshold_ports: int = 20, time_window_minutes: int = 5) -> List[Dict[str, Any]]:
        """
        Detect port scanning - many destination ports from one source in short time
        """
        alerts = []
        since = datetime.utcnow() - timedelta(minutes=time_window_minutes)

        # Group by source IP and count distinct destination ports
        port_counts = self.db.query(
            Event.source_ip,
            func.count(func.distinct(Event.destination_port)).label('port_count')
        ).filter(
            Event.event_type == "port_scan",
            Event.timestamp >= since
        ).group_by(
            Event.source_ip
        ).having(
            func.count(func.distinct(Event.destination_port)) >= threshold_ports
        ).all()

        for ip, port_count in port_counts:
            # Get the port scan events for evidence
            scan_events = self.db.query(Event).filter(
                Event.source_ip == ip,
                Event.event_type == "port_scan",
                Event.timestamp >= since
            ).order_by(Event.timestamp.desc()).limit(10).all()

            # Determine asset criticality (if any asset associated)
            asset_critical = False
            if scan_events:
                asset_id = scan_events[0].asset_id
                asset_critical = self._get_asset_criticality(asset_id)

            # Compute risk score
            risk_result = self._compute_risk_score(
                severity="medium",
                confidence=min(90, 50 + (port_count - threshold_ports) * 2),
                event_count=port_count,
                asset_critical=asset_critical
            )

            alert = {
                "rule_id": "PORT_SCAN_001",
                "name": "Port Scan Detected",
                "description": f"Detected scanning of {port_count} distinct ports from IP {ip} within {time_window_minutes} minutes",
                "severity": "medium",
                "confidence": min(90, 50 + (port_count - threshold_ports) * 2),
                "risk_score": risk_result["score"],
                "risk_score_factors": risk_result["factors"],
                "event_ids": [e.id for e in scan_events],
                "evidence": {
                    "source_ip": ip,
                    "distinct_ports_scanned": port_count,
                    "time_window_minutes": time_window_minutes,
                    "sample_events": [
                        {
                            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                            "destination_port": e.destination_port,
                            "destination_ip": e.destination_ip
                        }
                        for e in scan_events[:5]
                    ]
                },
                "timestamp": datetime.utcnow(),
                "event_type": "port_scan_detected",
                "metadata": {
                    "rule_version": "1.0",
                    "threshold_ports": threshold_ports,
                    "time_window": time_window_minutes
                }
            }
            alerts.append(alert)
            logger.info(f"Port scan detection triggered: {port_count} ports from {ip}")

        return alerts

    def detect_privilege_escalation(self) -> List[Dict[str, Any]]:
        """
        Detect privilege escalation events
        """
        alerts = []
        since = datetime.utcnow() - timedelta(hours=24)  # Look at last 24 hours

        priv_events = self.db.query(Event).filter(
            Event.event_type == "privilege_escalation",
            Event.timestamp >= since
        ).all()

        for event in priv_events:
            # Determine asset criticality
            asset_critical = self._get_asset_criticality(event.asset_id) if event.asset_id else False
            # Compute risk score
            risk_result = self._compute_risk_score(
                severity="high",
                confidence=85,
                event_count=1,
                asset_critical=asset_critical
            )
            alert = {
                "rule_id": "PRIV_ESC_001",
                "name": "Privilege Escalation Detected",
                "description": f"Privilege escalation event detected for user {event.user} on asset {event.asset}",
                "severity": "high",
                "confidence": 85,
                "risk_score": risk_result["score"],
                "risk_score_factors": risk_result["factors"],
                "event_ids": [event.id],
                "evidence": {
                    "user": event.user,
                    "asset": event.asset,
                    "description": event.description,
                    "timestamp": event.timestamp.isoformat() if event.timestamp else None
                },
                "timestamp": datetime.utcnow(),
                "event_type": "privilege_escalation_detected",
                "metadata": {
                    "rule_version": "1.0"
                }
            }
            alerts.append(alert)
            logger.info(f"Privilege escalation detection triggered for user {event.user}")

        return alerts

    def detect_anomalous_login(self, start_hour: int = 22, end_hour: int = 6) -> List[Dict[str, Any]]:
        """
        Detect anomalous login behavior compared to historical baseline.
        Simple implementation: flag logins outside of typical hours (e.g., 22:00 to 06:00).
        """
        alerts = []
        # Get successful logins
        success_logins = self.db.query(Event).filter(
            Event.event_type == "authentication_success"
        ).all()

        for event in success_logins:
            if event.timestamp is None:
                continue
            hour = event.timestamp.hour
            # Check if hour is outside normal range (e.g., 22-23 or 0-6)
            if hour >= start_hour or hour <= end_hour:
                # Determine asset criticality
                asset_critical = self._get_asset_criticality(event.asset_id) if event.asset_id else False
                # Compute risk score
                risk_result = self._compute_risk_score(
                    severity="low",
                    confidence=70,
                    event_count=1,
                    asset_critical=asset_critical
                )
                alert = {
                    "rule_id": "ANOMALOUS_LOGIN_001",
                    "name": "Anomalous Login Detected",
                    "description": f"Login outside normal hours for user {event.user} at {event.timestamp}",
                    "severity": "low",
                    "confidence": 70,
                    "risk_score": risk_result["score"],
                    "risk_score_factors": risk_result["factors"],
                    "event_ids": [event.id],
                    "evidence": {
                        "user": event.user,
                        "asset": event.asset,
                        "timestamp": event.timestamp.isoformat() if event.timestamp else None,
                        "hour": hour
                    },
                    "timestamp": datetime.utcnow(),
                    "event_type": "anomalous_login_detected",
                    "metadata": {
                        "rule_version": "1.0",
                        "start_hour": start_hour,
                        "end_hour": end_hour
                    }
                }
                alerts.append(alert)
                logger.info(f"Anomalous login detection triggered for user {event.user} at hour {hour}")

        return alerts

    def detect_ioc_match(self) -> List[Dict[str, Any]]:
        """
        Detect events matching known Indicators of Compromise
        """
        alerts = []
        # Use aliases to avoid confusion in the join
        EventAlias = aliased(Event)
        ThreatIntelAlias = aliased(ThreatIntel)
        # Join events with threat intelligence on IP indicators via the association table
        ioc_matches = self.db.query(EventAlias, ThreatIntelAlias).join(
            event_threat_intel, EventAlias.id == event_threat_intel.c.event_id
        ).join(
            ThreatIntelAlias, event_threat_intel.c.threat_intel_id == ThreatIntelAlias.id
        ).filter(
            ThreatIntelAlias.indicator_type == "ip",
            ThreatIntelAlias.is_active == True
        ).filter(
            or_(
                EventAlias.source_ip == ThreatIntelAlias.indicator,
                EventAlias.destination_ip == ThreatIntelAlias.indicator
            )
        ).all()

        for event, intel in ioc_matches:
            # Determine asset criticality
            asset_critical = self._get_asset_criticality(event.asset_id) if event.asset_id else False
            # Compute risk score
            # Determine severity from threat type
            severity = "high" if intel.threat_type.lower() in ["malware", "c2", "ransomware"] else "medium"
            risk_result = self._compute_risk_score(
                severity=severity,
                confidence=intel.confidence,
                event_count=1,
                asset_critical=asset_critical,
                threat_intel_confidence=intel.confidence,
                threat_intel_severity=intel.threat_type
            )
            alert = {
                "rule_id": "IOC_MATCH_001",
                "name": "IOC Match Detected",
                "description": f"Event matches threat intelligence indicator: {intel.indicator}",
                "severity": "high" if intel.threat_type.lower() in ["malware", "c2", "ransomware"] else "medium",
                "confidence": intel.confidence,
                "risk_score": risk_result["score"],
                "risk_score_factors": risk_result["factors"],
                "event_ids": [event.id],
                "evidence": {
                    "event_id": event.event_id,
                    "source_ip": event.source_ip,
                    "destination_ip": event.destination_ip,
                    "threat_indicator": intel.indicator,
                    "threat_type": intel.threat_type,
                    "threat_source": intel.source
                },
                "timestamp": datetime.utcnow(),
                "event_type": "ioc_match_detected",
                "metadata": {
                    "rule_version": "1.0",
                    "threat_intel_id": intel.id
                }
            }
            alerts.append(alert)
            logger.info(f"IOC match detection triggered: event {event.event_id} matches indicator {intel.indicator}")

        return alerts

    def run_all_detections(self) -> List[Dict[str, Any]]:
        """
        Run all detection rules and return combined alerts
        """
        all_alerts = []

        # Run each detection method
        all_alerts.extend(self.detect_brute_force())
        all_alerts.extend(self.detect_impossible_travel())
        all_alerts.extend(self.detect_port_scan())
        all_alerts.extend(self.detect_privilege_escalation())
        all_alerts.extend(self.detect_anomalous_login())
        all_alerts.extend(self.detect_ioc_match())

        logger.info(f"Total detections triggered: {len(all_alerts)}")
        return all_alerts