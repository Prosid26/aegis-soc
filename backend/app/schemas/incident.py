from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.mitre import MITRETechniqueInDB

class IncidentBase(BaseModel):
    incident_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    risk_score: Optional[int] = None
    confidence: Optional[int] = None
    mitre_techniques: Optional[List[MITRETechniqueInDB]] = None
    affected_assets: Optional[List[int]] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    raw_data: Optional[Dict[str, Any]] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    risk_score: Optional[int] = None
    confidence: Optional[int] = None
    mitre_techniques: Optional[List[MITRETechniqueInDB]] = None
    affected_assets: Optional[List[int]] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    raw_data: Optional[Dict[str, Any]] = None

class IncidentInDBBase(IncidentBase):
    id: int
    reported_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class IncidentInDB(IncidentInDBBase):
    pass