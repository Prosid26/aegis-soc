"""
AI Provider abstraction for AegisSOC AI Security Analyst.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models.incident import Incident

class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def analyze_incident(self, incident: Incident, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze an incident and return structured analysis.

        Args:
            incident: The incident object from the database.
            context: Additional context including detections, events, evidence, MITRE info.

        Returns:
            A dictionary conforming to the analysis output schema.
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the AI provider is healthy and reachable.

        Returns:
            True if healthy, False otherwise.
        """
        pass


class MockProvider(AIProvider):
    """Mock AI provider for development and testing."""

    # System prompt that would be used for a real LLM (for reference)
    SYSTEM_PROMPT = """You are an AI assistant for a Security Operations Center.
You analyze ONLY the evidence provided by the AegisSOC system.
Do not invent:
- events
- IP addresses
- users
- assets
- timestamps
- vulnerabilities
- attack techniques
If evidence is insufficient, explicitly say:
"Insufficient evidence."
Distinguish between:
OBSERVED
INFERRED
RECOMMENDED
Do not claim an attack is confirmed merely because a detection exists.
Use MITRE ATT&CK information supplied by the application.
Do not invent MITRE techniques."""

    async def analyze_incident(self, incident: Incident, context: Dict[str, Any]) -> Dict[str, Any]:
        """Return a deterministic mock analysis based on incident data."""
        # Use incident data to generate a plausible but deterministic analysis
        risk_score = incident.risk_score or 50
        # Adjust slightly based on context to make it seem intelligent
        detection_count = len(context.get("detections", []))
        event_count = len(context.get("events", []))

        # Simple heuristic: more detections/events -> higher risk
        adjusted_risk = min(100, risk_score + (detection_count * 5) + (event_count * 2))
        adjusted_risk = max(0, adjusted_risk)

        severity = self._determine_severity(adjusted_risk)

        # Determine likely technique from detections
        technique_id = None
        technique_name = None
        tactic = None
        technique_description = None

        # Look for MITRE info in context
        mitre_techniques = context.get("mitre_techniques", [])
        if mitre_techniques:
            # Take the first one
            first = mitre_techniques[0]
            technique_id = first.get("technique_id")
            technique_name = first.get("technique_name")
            tactic = first.get("tactic")
            technique_description = first.get("description")

        # Generate evidence summary
        key_evidence = []
        for det in context.get("detections", []):
            key_evidence.append(f"Detection: {det.get('rule_name')} (confidence: {det.get('confidence')}%)")
        for evt in context.get("events", [])[:3]:  # Limit to 3 events
            key_evidence.append(f"Event: {evt.get('event_type')} from {evt.get('source_ip')} at {evt.get('timestamp')}")

        # Generate recommended actions
        recommended_actions = []
        if adjusted_risk >= 80:
            recommended_actions.extend([
                "Isolate affected systems immediately",
                "Block source IPs at firewall",
                "Engage incident response team",
                "Preserve logs for forensic analysis"
            ])
        elif adjusted_risk >= 60:
            recommended_actions.extend([
                "Increase monitoring on affected assets",
                "Consider blocking suspicious IPs",
                "Notify security team lead",
                "Review authentication logs"
            ])
        else:
            recommended_actions.extend([
                "Continue monitoring for additional activity",
                "Log event for trend analysis",
                "Review detection rule effectiveness"
            ])

        # Investigation steps
        investigation_steps = [
            "Correlate related events across data sources",
            "Check asset criticality and ownership",
            "Analyze temporal patterns of activity",
            "Verify detection rule accuracy",
            "Check for similar historical incidents",
            "Threat intelligence enrichment",
            "MITRE ATT&CK technique validation",
            "Prepare executive summary"
        ]

        # Questions for analyst
        questions_for_analyst = [
            "Are there any recent changes to the affected systems?",
            "Have similar incidents occurred in the past?",
            "Is there any indication of data exfiltration?",
            "What is the business impact of the affected assets?",
            "Are there any ongoing investigations related to this incident?"
        ]

        # Confidence (mock: high confidence for mock)
        confidence = 95

        return {
            "summary": f"Incident {incident.incident_id} involves {detection_count} detection rule(s) and {event_count} related event(s).",
            "threat_assessment": f"{severity.upper()} risk threat detected based on observed activities.",
            "severity_assessment": severity,
            "mitre_analysis": f"Maps to MITRE technique {technique_id} ({technique_name}) under {tactic} tactic." if technique_id else "No specific MITRE technique mapping available.",
            "key_evidence": key_evidence,
            "recommended_actions": recommended_actions,
            "investigation_steps": investigation_steps,
            "questions_for_analyst": questions_for_analyst,
            "confidence": confidence
        }

    async def health_check(self) -> bool:
        """Mock provider is always healthy."""
        return True

    def _determine_severity(self, risk_score: int) -> str:
        """Determine severity based on risk score."""
        if risk_score >= 80:
            return "critical"
        elif risk_score >= 60:
            return "high"
        elif risk_score >= 40:
            return "medium"
        else:
            return "low"


# Placeholder for NIM provider - to be implemented if NIM API is available
class NimProvider(AIProvider):
    """NIM AI provider implementation."""

    # System prompt for the security analyst
    SYSTEM_PROMPT = """You are an AI assistant for a Security Operations Center.
You analyze ONLY the evidence provided by the AegisSOC system.
Do not invent:
- events
- IP addresses
- users
- assets
- timestamps
- vulnerabilities
- attack techniques
If evidence is insufficient, explicitly say:
"Insufficient evidence."
Distinguish between:
OBSERVED
INFERRED
RECOMMENDED
Do not claim an attack is confirmed merely because a detection exists.
Use MITRE ATT&CK information supplied by the application.
Do not invent MITRE techniques."""

    def __init__(self):
        # In a real implementation, we would initialize the NIM client here
        # using settings from the config
        pass

    async def analyze_incident(self, incident: Incident, context: Dict[str, Any]) -> Dict[str, Any]:
        """Call NIM API to analyze incident."""
        # For now, we'll raise an exception to indicate not implemented
        # In a real implementation, we would:
        # 1. Build the prompt from incident and context using SYSTEM_PROMPT
        # 2. Call the NIM API with appropriate parameters
        # 3. Parse and validate the response
        # 4. Handle rate limits, errors, etc.
        raise NotImplementedError("NIM provider not yet implemented")

    async def health_check(self) -> bool:
        """Check NIM API health."""
        # For now, return False to indicate not implemented/available
        return False


def get_ai_provider() -> AIProvider:
    """Factory function to get the appropriate AI provider based on configuration."""
    from app.core.config import settings

    if settings.AI_PROVIDER.lower() == "nim":
        return NimProvider()
    else:
        # Default to mock
        return MockProvider()