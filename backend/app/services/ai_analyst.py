import asyncio
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.event import Event
from app.models.asset import Asset
from app.models.threat_intel import ThreatIntel
from app.models.mitre import MITRETechnique
from app.models.user import User
from datetime import datetime, timedelta
import random

class AIAnalystService:
    def __init__(self, db: Session):
        self.db = db

    async def analyze_incident(self, incident: Incident) -> Dict[str, Any]:
        """
        Analyze an incident using AI-powered investigation techniques
        """
        # Simulate AI analysis process
        analysis_steps = [
            "Correlating related events",
            "Checking asset criticality",
            "Analyzing temporal patterns",
            "Checking threat intelligence matches",
            "Mapping to MITRE ATT&CK framework",
            "Calculating risk score",
            "Generating investigation timeline"
        ]

        # In a real implementation, this would call an LLM with tools
        # For now, we'll simulate based on the incident data

        # Get related events
        related_events = []
        if incident.timeline:
            # If timeline already exists, use it
            related_events = incident.timeline
        else:
            # Otherwise, get events around the reported time
            since = incident.reported_at - timedelta(hours=24)
            until = incident.reported_at + timedelta(hours=24)
            related_events = self.db.query(Event).filter(
                Event.timestamp >= since,
                Event.timestamp <= until
            ).limit(50).all()

        # Get affected assets
        affected_assets = []
        if incident.affected_assets:
            affected_assets = incident.affected_assets
        else:
            # Get assets related to the events
            asset_ids = list(set([e.asset_id for e in related_events if e.asset_id]))
            if asset_ids:
                affected_assets = self.db.query(Asset).filter(Asset.id.in_(asset_ids)).all()

        # Check threat intelligence
        threat_matches = []
        for event in related_events[:10]:  # Limit to first 10 events for performance
            # In a real implementation, we'd check the event_threat_intel association
            pass

        # Determine likely attack technique based on event types
        event_types = [e.event_type for e in related_events if e.event_type]
        technique_mapping = {
            "authentication_failure": "T1110",  # Brute Force
            "privilege_escalation": "T1068",    # Exploitation for Privilege Escalation
            "port_scan": "T1046",               # Network Service Scanning
            "malware_detected": "T1105",        # Ingress Tool Transfer
            "data_exfiltration": "T1041",       # Exfiltration Over C2 Channel
            "lateral_movement": "T1021",        # Remote Services
            "credentials_access": "T1003",      # OS Credential Dumping
        }

        likely_technique = None
        for etype in event_types:
            if etype in technique_mapping:
                likely_technique = technique_mapping[etype]
                break

        # Calculate risk score based on various factors
        risk_score = self._calculate_risk_score(incident, related_events, affected_assets)

        # Determine severity
        severity = self._determine_severity(risk_score)

        # Generate evidence summary
        evidence = self._generate_evidence_summary(incident, related_events, affected_assets, threat_matches)

        # Generate timeline
        timeline = self._generate_timeline(related_events)

        return {
            "risk_score": risk_score,
            "confidence": min(95, risk_score + random.randint(-5, 5)),  # Simulate confidence
            "severity": severity,
            "likely_technique": likely_technique,
            "evidence": evidence,
            "timeline": timeline,
            "analysis_steps": analysis_steps,
            "affected_assets_count": len(affected_assets),
            "related_events_count": len(related_events),
            "threat_intel_matches": len(threat_matches),
            "recommended_actions": self._generate_recommendations(likely_technique, risk_score)
        }

    async def investigate_event(self, event: Event) -> Dict[str, Any]:
        """
        Investigate a single event
        """
        investigation_steps = [
            "Analyzing event properties",
            "Checking source IP reputation",
            "Looking for similar historical events",
            "Checking for related events in time window",
            "Assessing asset criticality",
            "Checking threat intelligence",
            "Determining if part of larger incident"
        ]

        # Get similar events
        similar_events = self.db.query(Event).filter(
            Event.event_type == event.event_type,
            Event.source_ip == event.source_ip,
            Event.id != event.id
        ).limit(10).all()

        # Get asset info
        asset_info = None
        if event.asset_id:
            asset_info = self.db.query(Asset).filter(Asset.id == event.asset_id).first()

        # Check if this looks like part of a pattern (e.g., brute force)
        is_brute_force = False
        if event.event_type == "authentication_failure":
            failure_count = self.db.query(Event).filter(
                Event.event_type == "authentication_failure",
                Event.source_ip == event.source_ip,
                Event.timestamp >= event.timestamp - timedelta(hours=1),
                Event.timestamp <= event.timestamp + timedelta(hours=1)
            ).count()
            is_brute_force = failure_count >= 5

        # Calculate risk based on event
        risk_score = self._calculate_event_risk(event, asset_info, similar_events, is_brute_force)

        return {
            "event_id": event.id,
            "risk_score": risk_score,
            "is_part_of_campaign": len(similar_events) > 0,
            "similar_events_count": len(similar_events),
            "asset_criticality": asset_info.is_critical if asset_info else False,
            "brute_force_likelihood": is_brute_force,
            "investigation_steps": investigation_steps,
            "recommended_actions": self._get_event_recommendations(event, risk_score, is_brute_force)
        }

    def _calculate_risk_score(self, incident: Incident, events: List[Event], assets: List[Asset]) -> int:
        """Calculate risk score based on multiple factors"""
        base_score = 30  # Base risk

        # Factor 1: Incident severity (if already set)
        if incident.severity:
            severity_scores = {"low": 10, "medium": 30, "high": 60, "critical": 90}
            base_score = severity_scores.get(incident.severity.lower(), 30)

        # Factor 2: Number of related events
        event_factor = min(30, len(events) // 5)  # Up to 30 points for many events

        # Factor 3: Number of critical assets affected
        critical_assets = [a for a in assets if a.is_critical]
        asset_factor = min(25, len(critical_assets) * 5)  # Up to 25 points

        # Factor 4: Event types present
        high_risk_event_types = ["privilege_escalation", "data_exfiltration", "lateral_movement"]
        event_types = [e.event_type for e in events if e.event_type]
        event_type_factor = 0
        for etype in high_risk_event_types:
            if etype in event_types:
                event_type_factor += 15  # 15 points for each high-risk event type
        event_type_factor = min(30, event_type_factor)  # Cap at 30

        # Calculate final score
        final_score = base_score + event_factor + asset_factor + event_type_factor
        return min(100, max(0, final_score))  # Clamp between 0-100

    def _determine_severity(self, risk_score: int) -> str:
        """Determine severity based on risk score"""
        if risk_score >= 80:
            return "critical"
        elif risk_score >= 60:
            return "high"
        elif risk_score >= 40:
            return "medium"
        else:
            return "low"

    def _generate_evidence_summary(self, incident: Incident, events: List[Event],
                                 assets: List[Asset], threat_matches: List[Any]) -> List[str]:
        """Generate evidence summary for the investigation"""
        evidence = []

        # Event-based evidence
        if events:
            event_types = {}
            for e in events:
                event_types[e.event_type] = event_types.get(e.event_type, 0) + 1

            for etype, count in event_types.items():
                evidence.append(f"Detected {count} occurrences of {etype.replace('_', ' ')}")

        # Asset-based evidence
        if assets:
            critical_assets = [a for a in assets if a.is_critical]
            if critical_assets:
                evidence.append(f"{len(critical_assets)} critical asset(s) involved")

            # Geographic/anomaly evidence would go here in a real implementation

        # Threat intelligence evidence
        if threat_matches:
            evidence.append(f"Matched {len(threat_matches)} threat indicator(s)")

        # Temporal evidence
        if len(events) > 1:
            timestamps = [e.timestamp for e in events if e.timestamp]
            if timestamps:
                duration = max(timestamps) - min(timestamps)
                evidence.append(f"Activity span: {duration.total_seconds() / 3600:.1f} hours")

        # If no evidence yet, add some generic evidence
        if not evidence:
            evidence.append("Security event detected requiring investigation")
            evidence.append("Initial triage completed")

        return evidence

    def _generate_timeline(self, events: List[Event]) -> List[Dict[str, Any]]:
        """Generate investigation timeline from events"""
        timeline = []
        for event in sorted(events, key=lambda e: e.timestamp or datetime.min):
            timeline.append({
                "timestamp": event.timestamp.isoformat() if event.timestamp else None,
                "event_type": event.event_type,
                "description": event.description or f"{event.event_type} event",
                "source_ip": event.source_ip,
                "user": event.user,
                "asset": event.asset
            })
        return timeline

    def _generate_recommendations(self, technique: Optional[str], risk_score: int) -> List[str]:
        """Generate recommended actions based on analysis"""
        recommendations = []

        # Risk-based recommendations
        if risk_score >= 80:
            recommendations.append("Isolate affected systems immediately")
            recommendations.append("Block source IPs at firewall")
            recommendations.append("Engage incident response team")
        elif risk_score >= 60:
            recommendations.append("Increase monitoring on affected assets")
            recommendations.append("Consider blocking suspicious IPs")
            recommendations.append("Notify security team lead")
        else:
            recommendations.append("Continue monitoring for additional activity")
            recommendations.append("Log event for trend analysis")

        # Technique-specific recommendations
        if technique:
            technique_recommendations = {
                "T1110": [  # Brute Force
                    "Implement account lockout policies",
                    "Enable multi-factor authentication",
                    "Review authentication logs for successful breaches"
                ],
                "T1068": [  # Privilege Escalation
                    "Review recent privilege changes",
                    "Check for unauthorized admin account creation",
                    "Validate patch levels on affected systems"
                ],
                "T1046": [  # Network Scanning
                    "Block scanning source IP",
                    "Review firewall rules",
                    "Check for successful connections from scanner"
                ],
                "T1105": [  # Ingress Tool Transfer
                    "Quarantine affected systems",
                    "Scan for malware remnants",
                    "Review incoming network traffic"
                ]
            }
            if technique in technique_recommendations:
                recommendations.extend(technique_recommendations[technique])

        # Always add these
        recommendations.append("Document all findings in incident report")
        recommendations.append("Update threat intelligence with new indicators")
        recommendations.append("Review and improve detection rules")

        return recommendations[:8]  # Limit to top 8 recommendations

    def _calculate_event_risk(self, event: Event, asset: Optional[Asset],
                            similar_events: List[Event], is_brute_force: bool) -> int:
        """Calculate risk score for a single event"""
        base_score = 20

        # Event type risk
        event_type_risks = {
            "authentication_failure": 10,
            "privilege_escalation": 80,
            "data_exfiltration": 90,
            "lateral_movement": 85,
            "port_scan": 40,
            "malware_detected": 75,
            "credentials_access": 85
        }
        base_score = event_type_risks.get(event.event_type, 20)

        # Asset criticality
        if asset and asset.is_critical:
            base_score = min(100, base_score + 30)

        # Brute force likelihood
        if is_brute_force:
            base_score = min(100, base_score + 40)

        # Similar events (indicates campaign)
        if len(similar_events) > 5:
            base_score = min(100, base_score + 20)
        elif len(similar_events) > 0:
            base_score = min(100, base_score + 10)

        return base_score

    def _get_event_recommendations(self, event: Event, risk_score: int, is_brute_force: bool) -> List[str]:
        """Get recommendations for a single event investigation"""
        recommendations = []

        if risk_score >= 80:
            recommendations.append("Immediate investigation required")
            recommendations.append("Consider system isolation")
        elif risk_score >= 60:
            recommendations.append("Investigate within 4 hours")
        else:
            recommendations.append("Log for trend analysis")

        if is_brute_force:
            recommendations.append("Investigate for successful authentication")
            recommendations.append("Check source IP reputation")

        # Event-specific recommendations
        if event.event_type == "authentication_failure":
            recommendations.append("Review authentication logs")
            recommendations.append("Consider account lockout")
        elif event.event_type == "privilege_escalation":
            recommendations.append("Investigate privilege change source")
            recommendations.append("Check for malware or exploitation")

        recommendations.append("Document findings")
        return recommendations
