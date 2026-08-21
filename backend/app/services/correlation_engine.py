"""
Correlation engine for detecting attack chains from security events.
"""
from typing import List, Dict, Any, Optional, Set, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models.event import Event
from app.models.asset import Asset
from datetime import datetime, timedelta
import uuid
import logging

logger = logging.getLogger(__name__)

# Configuration constants
BRUTE_FORCE_FAILURE_THRESHOLD = 5  # number of failures before considering brute force
TIME_BETWEEN_FAILURE_AND_SUCCESS_SECONDS = 300  # max seconds between last failure and success
PORT_SCAN_TO_CONNECTION_SECONDS = 600  # max seconds between port scan and suspicious connection
SAME_ASSET_HIGH_SEVERITY_COUNT = 3  # number of high-severity events on same asset to trigger correlation
SAME_SOURCE_IP_EVENT_COUNT = 5  # number of events from same IP in window to trigger correlation

class CorrelationEngine:
    def __init__(self, db: Session):
        self.db = db

    def correlate_events(self, start_time: Optional[datetime] = None, end_time: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Correlate events within a time window into attack chains.
        Returns a list of correlation dictionaries.
        If start_time and end_time are not provided, defaults to last 60 minutes.
        """
        if end_time is None:
            end_time = datetime.utcnow()
        if start_time is None:
            start_time = end_time - timedelta(minutes=60)

        # Get events in the time window, ordered by timestamp
        events = self.db.query(Event).filter(
            and_(Event.timestamp >= start_time, Event.timestamp <= end_time)
        ).order_by(Event.timestamp.asc()).all()

        if not events:
            return []

        correlations: List[Dict[str, Any]] = []
        seen_event_sets: Set[frozenset] = set()

        # Group events by source_ip and user for Brute Force -> Success detection
        ip_user_events: Dict[Tuple[Optional[str], Optional[str]], List[Event]] = {}
        for ev in events:
            key = (ev.source_ip, ev.user)
            ip_user_events.setdefault(key, []).append(ev)

        # Pattern 1: Brute force (multiple auth failures) -> successful login
        for (src_ip, user), ev_list in ip_user_events.items():
            failures = [e for e in ev_list if e.event_type == "authentication_failure"]
            successes = [e for e in ev_list if e.event_type == "authentication_success"]
            if len(failures) >= BRUTE_FORCE_FAILURE_THRESHOLD and successes:
                # Check temporal ordering: last failure before first success within time limit
                last_failure = max(failures, key=lambda e: e.timestamp) if failures else None
                first_success = min(successes, key=lambda e: e.timestamp) if successes else None
                if last_failure and first_success:
                    delta = (first_success.timestamp - last_failure.timestamp).total_seconds()
                    if 0 <= delta <= TIME_BETWEEN_FAILURE_AND_SUCCESS_SECONDS:
                        related = failures + successes
                        event_ids = [e.id for e in related]
                        key_set = frozenset(event_ids)
                        if key_set in seen_event_sets:
                            continue
                        seen_event_sets.add(key_set)

                        # Determine severity (highest)
                        severity_levels = {"low":0, "medium":1, "high":2, "critical":3}
                        max_sev = "low"
                        for e in related:
                            sev = e.severity or "low"
                            if severity_levels.get(sev,0) > severity_levels.get(max_sev,0):
                                max_sev = sev

                        # Confidence: based on number of failures and time closeness
                        conf = min(95, 60 + (len(failures) - BRUTE_FORCE_FAILURE_THRESHOLD) * 5)
                        if delta < 60:  # very close in time boosts confidence
                            conf = min(95, conf + 10)

                        # Asset criticality
                        asset_critical = False
                        asset_id = None
                        # Try to get asset from first failure that has asset_id
                        for e in failures:
                            if e.asset_id:
                                asset_id = e.asset_id
                                break
                        if asset_id:
                            asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
                            asset_critical = asset.is_critical if asset else False

                        # Risk score using same logic as detection engine
                        severity_points = {"low":10, "medium":30, "high":60, "critical":80}.get(max_sev,20)
                        confidence_points = min(30, conf * 0.3)
                        event_count_points = min(20, len(related) * 2)
                        critical_points = 20 if asset_critical else 0
                        base = severity_points + confidence_points + event_count_points + critical_points
                        risk_score = min(100, base)

                        # MITRE: if any event has linked detection with mitre? skip for now
                        mitre_technique_id = None

                        explanation = (
                            f"Brute force attack detected: {len(failures)} authentication failures from {src_ip or 'unknown IP'} "
                            f"for user '{user or 'unknown'}' followed by a successful login within {int(delta)} seconds."
                        )

                        correlations.append({
                            "correlation_id": str(uuid.uuid4()),
                            "related_event_ids": event_ids,
                            "pattern": "brute_force_to_success",
                            "severity": max_sev,
                            "confidence": round(conf, 1),
                            "risk_score": risk_score,
                            "mitre_technique_id": mitre_technique_id,
                            "explanation": explanation,
                            "start_timestamp": min(e.timestamp for e in related).isoformat(),
                            "end_timestamp": max(e.timestamp for e in related).isoformat(),
                            "assets_involved": list({e.asset_id for e in related if e.asset_id}),
                            "users_involved": list({e.user for e in related if e.user}),
                            "source_ips_involved": list({e.source_ip for e in related if e.source_ip}),
                        })

        # Pattern 2: Port scan -> suspicious connection (assuming event_type "connection" exists)
        # We'll look for port_scan events followed by any connection-like event from same IP
        ip_events: Dict[Optional[str], List[Event]] = {}
        for ev in events:
            ip_events.setdefault(ev.source_ip, []).append(ev)

        for src_ip, ev_list in ip_events.items():
            if not src_ip:
                continue
            port_scans = [e for e in ev_list if e.event_type == "port_scan"]
            # Assume suspicious connection is event_type "connection" or "network_connection"
            conns = [e for e in ev_list if e.event_type in ("connection", "network_connection", "suspicious_connection")]
            if port_scans and conns:
                # For each port scan, see if there is a connection after it within window
                for ps in port_scans:
                    for conn in conns:
                        if conn.timestamp >= ps.timestamp:
                            delta = (conn.timestamp - ps.timestamp).total_seconds()
                            if 0 <= delta <= PORT_SCAN_TO_CONNECTION_SECONDS:
                                related = [ps, conn]
                                event_ids = [e.id for e in related]
                                key_set = frozenset(event_ids)
                                if key_set in seen_event_sets:
                                    continue
                                seen_event_sets.add(key_set)

                                # Severity: higher of the two
                                sev_ps = ps.severity or "low"
                                sev_conn = conn.severity or "low"
                                severity_levels = {"low":0, "medium":1, "high":2, "critical":3}
                                max_sev = sev_ps if severity_levels.get(sev_ps,0) >= severity_levels.get(sev_conn,0) else sev_conn

                                # Confidence based on temporal closeness
                                conf = 70
                                if delta < 30:
                                    conf = 90
                                elif delta < 120:
                                    conf = 80

                                # Asset criticality
                                asset_critical = False
                                asset_id = ps.asset_id or conn.asset_id
                                if asset_id:
                                    asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
                                    asset_critical = asset.is_critical if asset else False

                                # Risk score
                                severity_points = {"low":10, "medium":30, "high":60, "critical":80}.get(max_sev,20)
                                confidence_points = min(30, conf * 0.3)
                                event_count_points = min(20, len(related) * 2)
                                critical_points = 20 if asset_critical else 0
                                base = severity_points + confidence_points + event_count_points + critical_points
                                risk_score = min(100, base)

                                explanation = (
                                    f"Port scan attack detected: {src_ip} conducted a port scan followed by a suspicious connection "
                                    f"within {int(delta)} seconds."
                                )

                                correlations.append({
                                    "correlation_id": str(uuid.uuid4()),
                                    "related_event_ids": event_ids,
                                    "pattern": "port_scan_to_connection",
                                    "severity": max_sev,
                                    "confidence": round(conf, 1),
                                    "risk_score": risk_score,
                                    "mitre_technique_id": None,
                                    "explanation": explanation,
                                    "start_timestamp": ps.timestamp.isoformat(),
                                    "end_timestamp": conn.timestamp.isoformat(),
                                    "assets_involved": list({e.asset_id for e in related if e.asset_id}),
                                    "users_involved": list({e.user for e in related if e.user}),
                                    "source_ips_involved": [src_ip],
                                })

        # Pattern 3: Multiple high-severity events on same asset
        asset_events: Dict[Optional[int], List[Event]] = {}
        for ev in events:
            asset_events.setdefault(ev.asset_id, []).append(ev)

        for asset_id, ev_list in asset_events.items():
            if asset_id is None:
                continue
            high_sev = [e for e in ev_list if e.severity in ("high", "critical")]
            if len(high_sev) >= SAME_ASSET_HIGH_SEVERITY_COUNT:
                # Take the most recent SAME_ASSET_HIGH_SEVERITY_COUNT events
                high_sev_sorted = sorted(high_sev, key=lambda e: e.timestamp, reverse=True)
                related = high_sev_sorted[:SAME_ASSET_HIGH_SEVERITY_COUNT]
                event_ids = [e.id for e in related]
                key_set = frozenset(event_ids)
                if key_set in seen_event_sets:
                    continue
                seen_event_sets.add(key_set)

                # Severity is highest among them (likely high or critical)
                sevs = [e.severity for e in related]
                max_sev = "critical" if any(s == "critical" for s in sevs) else "high"

                # Confidence increases with number of events
                conf = min(95, 50 + (len(related) - SAME_ASSET_HIGH_SEVERITY_COUNT) * 10)

                # Asset criticality
                asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
                asset_critical = asset.is_critical if asset else False

                # Risk score
                severity_points = {"low":10, "medium":30, "high":60, "critical":80}.get(max_sev,20)
                confidence_points = min(30, conf * 0.3)
                event_count_points = min(20, len(related) * 2)
                critical_points = 20 if asset_critical else 0
                base = severity_points + confidence_points + event_count_points + critical_points
                risk_score = min(100, base)

                explanation = (
                    f"Detected {len(related)} high-severity events on asset '{asset.hostname if asset else asset_id}' "
                    f"within the correlation window."
                )

                correlations.append({
                    "correlation_id": str(uuid.uuid4()),
                    "related_event_ids": event_ids,
                    "pattern": "multiple_high_severity_same_asset",
                    "severity": max_sev,
                    "confidence": round(conf, 1),
                    "risk_score": risk_score,
                    "mitre_technique_id": None,
                    "explanation": explanation,
                    "start_timestamp": min(e.timestamp for e in related).isoformat(),
                    "end_timestamp": max(e.timestamp for e in related).isoformat(),
                    "assets_involved": [asset_id],
                    "users_involved": list({e.user for e in related if e.user}),
                    "source_ips_involved": list({e.source_ip for e in related if e.source_ip}),
                })

        # Pattern 4: Many events from same source IP (possible scanning or sprayed attack)
        for src_ip, ev_list in ip_events.items():
            if not src_ip:
                continue
            if len(ev_list) >= SAME_SOURCE_IP_EVENT_COUNT:
                # Take the most recent SAME_SOURCE_IP_EVENT_COUNT events
                recent = sorted(ev_list, key=lambda e: e.timestamp, reverse=True)[:SAME_SOURCE_IP_EVENT_COUNT]
                event_ids = [e.id for e in recent]
                key_set = frozenset(event_ids)
                if key_set in seen_event_sets:
                    continue
                seen_event_sets.add(key_set)

                # Determine severity (highest)
                severity_levels = {"low":0, "medium":1, "high":2, "critical":3}
                max_sev = "low"
                for e in recent:
                    sev = e.severity or "low"
                    if severity_levels.get(sev,0) > severity_levels.get(max_sev,0):
                        max_sev = sev

                # Confidence based on count
                conf = min(95, 40 + (len(recent) - SAME_SOURCE_IP_EVENT_COUNT) * 8)

                # Asset criticality (if any)
                asset_critical = False
                asset_ids = {e.asset_id for e in recent if e.asset_id}
                if asset_ids:
                    # check if any asset is critical
                    for aid in asset_ids:
                        asset = self.db.query(Asset).filter(Asset.id == aid).first()
                        if asset and asset.is_critical:
                            asset_critical = True
                            break

                # Risk score
                severity_points = {"low":10, "medium":30, "high":60, "critical":80}.get(max_sev,20)
                confidence_points = min(30, conf * 0.3)
                event_count_points = min(20, len(recent) * 2)
                critical_points = 20 if asset_critical else 0
                base = severity_points + confidence_points + event_count_points + critical_points
                risk_score = min(100, base)

                explanation = (
                    f"Detected {len(recent)} events from same source IP {src_ip} "
                    f"within the correlation window, suggesting possible scanning or sprayed attack."
                )

                correlations.append({
                    "correlation_id": str(uuid.uuid4()),
                    "related_event_ids": event_ids,
                    "pattern": "same_source_ip_burst",
                    "severity": max_sev,
                    "confidence": round(conf, 1),
                    "risk_score": risk_score,
                    "mitre_technique_id": None,
                    "explanation": explanation,
                    "start_timestamp": min(e.timestamp for e in recent).isoformat(),
                    "end_timestamp": max(e.timestamp for e in recent).isoformat(),
                    "assets_involved": list(asset_ids),
                    "users_involved": list({e.user for e in recent if e.user}),
                    "source_ips_involved": [src_ip],
                })

        logger.info(f"Generated {len(correlations)} correlations from {len(events)} events.")
        return correlations

# Helper function to get engine
def get_correlation_engine(db: Session) -> CorrelationEngine:
    return CorrelationEngine(db)