from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ThreatIntelBase(BaseModel):
    indicator: str
    indicator_type: str
    threat_type: Optional[str] = None
    confidence: Optional[int] = None
    source: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    expired_at: Optional[datetime] = None

class ThreatIntelCreate(ThreatIntelBase):
    pass

class ThreatIntelUpdate(BaseModel):
    indicator: Optional[str] = None
    indicator_type: Optional[str] = None
    threat_type: Optional[str] = None
    confidence: Optional[int] = None
    source: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    expired_at: Optional[datetime] = None

class ThreatIntelInDBBase(ThreatIntelBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ThreatIntelInDB(ThreatIntelInDBBase):
    pass
