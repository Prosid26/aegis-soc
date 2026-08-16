from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.threat_intel import ThreatIntel
from app.schemas.threat_intel import ThreatIntelCreate, ThreatIntelInDB
from app.core.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ThreatIntelInDB, status_code=status.HTTP_201_CREATED)
def create_threat_intel(
    threat_in: ThreatIntelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    threat = ThreatIntel(**threat_in.dict())
    db.add(threat)
    db.commit()
    db.refresh(threat)
    return threat

@router.get("/", response_model=List[ThreatIntelInDB])
def read_threat_intel(
    skip: int = 0,
    limit: int = 100,
    indicator_type: Optional[str] = Query(None),
    threat_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(ThreatIntel)
    if indicator_type:
        query = query.filter(ThreatIntel.indicator_type == indicator_type)
    if threat_type:
        query = query.filter(ThreatIntel.threat_type == threat_type)
    if is_active is not None:
        query = query.filter(ThreatIntel.is_active == is_active)
    threats = query.offset(skip).limit(limit).all()
    return threats

@router.get("/{threat_id}", response_model=ThreatIntelInDB)
def read_threat_intel(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    threat = db.query(ThreatIntel).filter(ThreatIntel.id == threat_id).first()
    if threat is None:
        raise HTTPException(status_code=404, detail="Threat intelligence not found")
    return threat

@router.put("/{threat_id}", response_model=ThreatIntelInDB)
def update_threat_intel(
    threat_id: int,
    threat_in: ThreatIntelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    threat = db.query(ThreatIntel).filter(ThreatIntel.id == threat_id).first()
    if threat is None:
        raise HTTPException(status_code=404, detail="Threat intelligence not found")
    for field, value in threat_in.dict().items():
        setattr(threat, field, value)
    db.commit()
    db.refresh(threat)
    return threat

@router.delete("/{threat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_threat_intel(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    threat = db.query(ThreatIntel).filter(ThreatIntel.id == threat_id).first()
    if threat is None:
        raise HTTPException(status_code=404, detail="Threat intelligence not found")
    db.delete(threat)
    db.commit()
    return None
