from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.mitre import MITRETechnique
from app.schemas.mitre import MITRETechniqueCreate, MITRETechniqueInDB
from app.core.deps import get_current_active_user
from app.models.user import User
from app.services.mitre_mapping import get_mitre_techniques_for_rule

router = APIRouter()

@router.post("/", response_model=MITRETechniqueInDB, status_code=status.HTTP_201_CREATED)
def create_mitre_technique(
    technique_in: MITRETechniqueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    technique = MITRETechnique(**technique_in.dict())
    db.add(technique)
    db.commit()
    db.refresh(technique)
    return technique

@router.get("/", response_model=List[MITRETechniqueInDB])
def read_mitre_techniques(
    skip: int = 0,
    limit: int = 100,
    tactic: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(MITRETechnique)
    if tactic:
        query = query.filter(MITRETechnique.tactic == tactic)
    techniques = query.offset(skip).limit(limit).all()
    return techniques

@router.get("/{technique_id}", response_model=MITRETechniqueInDB)
def read_mitre_technique(
    technique_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    technique = db.query(MITRETechnique).filter(MITRETechnique.id == technique_id).first()
    if technique is None:
        raise HTTPException(status_code=404, detail="MITRE technique not found")
    return technique

@router.put("/{technique_id}", response_model=MITRETechniqueInDB)
def update_mitre_technique(
    technique_id: int,
    technique_in: MITRETechniqueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    technique = db.query(MITRETechnique).filter(MITRETechnique.id == technique_id).first()
    if technique is None:
        raise HTTPException(status_code=404, detail="MITRE technique not found")
    for field, value in technique_in.dict().items():
        setattr(technique, field, value)
    db.commit()
    db.refresh(technique)
    return technique

@router.delete("/{technique_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mitre_technique(
    technique_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    technique = db.query(MITRETechnique).filter(MITRETechnique.id == technique_id).first()
    if technique is None:
        raise HTTPException(status_code=404, detail="MITRE technique not found")
    db.delete(technique)
    db.commit()
    return None

@router.get("/detections/{rule_id}", response_model=List[MITRETechniqueInDB])
def get_mitre_for_detection_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get MITRE techniques associated with a detection rule ID.
    """
    techniques = get_mitre_techniques_for_rule(db, rule_id)
    return techniques