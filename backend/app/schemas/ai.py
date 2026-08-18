"""
Pydantic schemas for AI Security Analyst.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class IncidentAnalysisInput(BaseModel):
    """Input schema for AI incident analysis."""
    incident_id: int
    title: str
    description: Optional[str] = None
    severity: str  # low, medium, high, critical
    risk_score: int  # 0-100
    confidence: int  # 0-100
    status: str  # NEW, INVESTIGATING, CONTAINED, RESOLVED
    reported_at: datetime
    # Related data (will be populated by the service)
    detections: List[Dict[str, Any]] = Field(default_factory=list)
    events: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: Dict[str, Any] = Field(default_factory=dict)
    mitre_techniques: List[Dict[str, Any]] = Field(default_factory=list)

class IncidentAnalysisOutput(BaseModel):
    """Output schema for AI incident analysis."""
    summary: str = Field(..., description="Brief summary of the incident")
    threat_assessment: str = Field(..., description="Assessment of the threat level and nature")
    severity_assessment: str = Field(..., description="Severity level: low, medium, high, critical")
    mitre_analysis: str = Field(..., description="Explanation of MITRE ATT&CK mapping")
    key_evidence: List[str] = Field(..., description="Key pieces of evidence supporting the analysis")
    recommended_actions: List[str] = Field(..., description="Recommended immediate actions")
    investigation_steps: List[str] = Field(..., description="Suggested investigation steps")
    questions_for_analyst: List[str] = Field(..., description="Questions the analyst should consider")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score in the analysis (0-100)")

class IncidentAIAnalysis(BaseModel):
    """Schema for persisted AI analysis."""
    id: Optional[int] = None
    incident_id: int
    provider: str  # e.g., "mock", "nim"
    model: Optional[str] = None  # e.g., "nemotron-3-8b-chat"
    analysis: Dict[str, Any]  # The full analysis output
    confidence: int
    created_at: datetime

    class Config:
        from_attributes = True
