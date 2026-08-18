from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MITRETechniqueBase(BaseModel):
    technique_id: str
    tactic: Optional[str] = None
    name: str
    description: Optional[str] = None
    data_sources: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    permissions_required: Optional[List[str]] = None

class MITRETechniqueCreate(MITRETechniqueBase):
    pass

class MITRETechniqueUpdate(BaseModel):
    technique_id: Optional[str] = None
    tactic: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    data_sources: Optional[List[str]] = None
    platforms: Optional[List[str]] = None
    permissions_required: Optional[List[str]] = None

class MITRETechniqueInDBBase(MITRETechniqueBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MITRETechniqueInDB(MITRETechniqueInDBBase):
    pass
