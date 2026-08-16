from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AssetBase(BaseModel):
    asset_id: Optional[str] = None
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    asset_type: Optional[str] = None
    operating_system: Optional[str] = None
    owner: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    is_critical: Optional[bool] = None
    is_monitored: Optional[bool] = None
    last_seen: Optional[datetime] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    hostname: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    asset_type: Optional[str] = None
    operating_system: Optional[str] = None
    owner: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    is_critical: Optional[bool] = None
    is_monitored: Optional[bool] = None
    last_seen: Optional[datetime] = None

class AssetInDBBase(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class AssetInDB(AssetInDBBase):
    pass