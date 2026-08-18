"""
AI Security Analyst service for AegisSOC.
Uses an AI provider to analyze incidents and produce structured output.
"""
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.event import Event
from app.models.detection import Detection
from app.models.asset import Asset
from app.models.mitre import MITRETechnique
from app.models.user import User
from app.models.association import event_threat_intel, detection_mitre_technique
from app.models.ai_analysis import IncidentAIAnalysis
from app.services.ai_provider import get_ai_provider
from app.schemas.ai import IncidentAnalysisInput, IncidentAnalysisOutput
from app.core.config import settings
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AIAnalystService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = get_ai_provider()

    async def analyze_incident(self, incident: Incident) -> Dict[str, Any]:
        """
        Analyze an incident using the configured AI provider.
        Returns a dictionary conforming to the analysis output schema.
        """
        try:
            # Build the input context
            context = await self._build_analysis_context(incident)

            # Convert to the input schema (for validation)
            analysis_input = IncidentAnalysisInput(
                incident_id=incident.id,
                title=incident.title,
                description=incident.description,
                severity=incident.severity,
                risk_score=incident.risk_score or 0,
                confidence=incident.confidence or 0,
                status=incident.status,
                reported_at=incident.reported_at,
                detections=context["detections"],
                events=context["events"],
                evidence=context["evidence"],
                mitre_techniques=context["mitre_techniques"]
            )

            # Call the AI provider
            ai_result = await self.provider.analyze_incident(incident, analysis_input.dict())

            # Validate the output against the expected schema
            # In a real implementation, we would parse the AI result into IncidentAnalysisOutput
            # For now, we assume the provider returns a dict that matches the schema.
            # We'll do a basic validation by trying to create the output schema.
            try:
                validated_output = IncidentAnalysisOutput(**ai_result)
                output_dict = validated_output.dict()
            except Exception as e:
                logger.error(f"AI provider returned invalid output: {e}")
                # Fallback to a structured error response
                output_dict = self._get_fallback_output(incident, str(e))

            # Persist the analysis
            await self._persist_analysis(incident, output_dict)

            return output_dict

        except Exception as e:
            logger.exception(f"Error analyzing incident {incident.id}")
            # Return a structured error
            return self._get_fallback_output(incident, str(e))

    async def _build_analysis_context(self, incident: Incident) -> Dict[str, Any]:
        """
        Build the analysis context from the incident and related data.
        """
        # Get related detections (those linked to this incident)
        detections = []
        if incident.detections:
            for det in incident.detections:
                detections.append({
                    "id": det.id,
                    "rule_id": det.rule_id,
                    "rule_name": det.rule_name,
                    "description": det.description,
                    "severity": det.severity,
                    "confidence": det.confidence,
                    "risk_score": det.risk_score,
                    "timestamp": det.timestamp.isoformat() if det.timestamp else None,
                    "event_ids": det.event_ids,
                    "evidence": det.evidence,
                    "source_ip": det.source_ip,
                    "destination_ip": det.destination_ip,
                    "user": det.user,
                    "asset": det.asset
                })

        # Get related events (those linked to the detections, or within time window)
        events = []
        # First, get events from the detections' event_ids
        event_ids = []
        for det in incident.detections:
            if det.event_ids:
                event_ids.extend(det.event_ids)

        if event_ids:
            events_query = self.db.query(Event).filter(Event.id.in_(event_ids))
            events = events_query.all()
        else:
            # If no event IDs, get events around the incident time
            since = incident.reported_at - timedelta(hours=24)
            until = incident.reported_at + timedelta(hours=24)
            events_query = self.db.query(Event).filter(
                Event.timestamp >= since,
                Event.timestamp <= until
            )
            events = events_query.limit(100).all()  # Limit to avoid too many

        # Convert events to dicts
        events_dicts = []
        for evt in events:
            events_dicts.append({
                "id": evt.id,
                "event_id": evt.event_id,
                "event_type": evt.event_type,
                "timestamp": evt.timestamp.isoformat() if evt.timestamp else None,
                "source_ip": evt.source_ip,
                "destination_ip": evt.destination_ip,
                "source_port": evt.source_port,
                "destination_port": evt.destination_port,
                "protocol": evt.protocol,
                "user": evt.user,
                "asset": evt.asset,
                "asset_id": evt.asset_id,
                "severity": evt.severity,
                "description": evt.description,
                "raw_data": evt.raw_data
            })

        # Build evidence aggregation
        evidence = {}
        # Combine evidence from detections
        all_evidence = []
        for det in incident.detections:
            if det.evidence:
                all_evidence.append(det.evidence)
        # Simple aggregation: if there are multiple evidence dicts, we can merge or keep list
        evidence["detection_evidence"] = all_evidence

        # Get MITRE techniques linked to the incident (via detections or directly)
        mitre_techniques = []
        # Get unique MITRE techniques from detections
        technique_ids = set()
        for det in incident.detections:
            if det.mitre_techniques:
                for tech in det.mitre_techniques:
                    technique_ids.add(tech.id)
        # Also get from incident directly (if any)
        if incident.mitre_techniques:
            for tech in incident.mitre_techniques:
                technique_ids.add(tech.id)

        if technique_ids:
            mitre_query = self.db.query(MITRETechnique).filter(MITRETechnique.id.in_(technique_ids))
            mitre_techniques = mitre_query.all()

        mitre_dicts = []
        for tech in mitre_techniques:
            mitre_dicts.append({
                "id": tech.id,
                "technique_id": tech.technique_id,
                "technique_name": tech.name,
                "tactic": tech.tactic,
                "description": tech.description,
                "data_sources": tech.data_sources,
                "platforms": tech.platforms,
                "permissions_required": tech.permissions_required
            })

        context = {
            "detections": detections,
            "events": events_dicts,
            "evidence": evidence,
            "mitre_techniques": mitre_dicts
        }

        return context

    async def _persist_analysis(self, incident: Incident, analysis_dict: Dict[str, Any]) -> None:
        """
        Persist the AI analysis to the database.
        """
        try:
            ai_analysis = IncidentAIAnalysis(
                incident_id=incident.id,
                provider=type(self.provider).__name__.replace("Provider", "").lower(),
                model=getattr(settings, "NIM_MODEL", "mock") if hasattr(self.provider, "__class__") and self.provider.__class__.__name__ == "NimProvider" else "mock",
                analysis=analysis_dict,
                confidence=analysis_dict.get("confidence", 0)
            )
            self.db.add(ai_analysis)
            self.db.commit()
            logger.info(f"Persisted AI analysis for incident {incident.id}")
        except Exception as e:
            logger.error(f"Failed to persist AI analysis: {e}")
            self.db.rollback()

    def _get_fallback_output(self, incident: Incident, error_msg: str) -> Dict[str, Any]:
        """
        Generate a fallback structured output when AI analysis fails.
        """
        return {
            "summary": f"AI analysis failed for incident {incident.incident_id}.",
            "threat_assessment": "Unable to assess threat due to AI analysis error.",
            "severity_assessment": incident.severity or "unknown",
            "mitre_analysis": "AI analysis error prevented MITRE context analysis.",
            "key_evidence": [
                f"Incident ID: {incident.id}",
                f"Title: {incident.title}",
                f"Error: {error_msg}"
            ],
            "recommended_actions": [
                "Investigate incident manually",
                "Check system logs",
                "Contact security team lead"
            ],
            "investigation_steps": [
                "Review incident details",
                "Gather related logs and events",
                "Correlate with threat intelligence",
                "Determine scope and impact"
            ],
            "questions_for_analyst": [
                "What is the timeline of events?",
                "Which systems are affected?",
                "Are there any indicators of compromise?",
                "What is the business impact?"
            ],
            "confidence": 0  # Low confidence due to failure
        }