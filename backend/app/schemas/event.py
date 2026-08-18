from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class EventBase(BaseModel):
    event_id: Optional[str] = None
    timestamp: datetime
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: Optional[str] = None
    event_type: str
    severity: Optional[str] = None
    user: Optional[str] = None
    asset: Optional[str] = None
    asset_id: Optional[int] = None
    description: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    processed: Optional[bool] = None

class EventInDBBase(EventBase):
    id: int
    processed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EventInDB(EventInDBBase):
    pass
