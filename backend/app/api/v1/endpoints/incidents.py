from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentInDB
from app.core.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=IncidentInDB, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    incident = Incident(**incident_in.dict())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/", response_model=List[IncidentInDB])
def read_incidents(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if assigned_to:
        query = query.filter(Incident.assigned_to == assigned_to)
    incidents = query.offset(skip).limit(limit).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentInDB)
def read_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.put("/{incident_id}", response_model=IncidentInDB)
def update_incident(
    incident_id: int,
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    for field, value in incident_in.dict().items():
        setattr(incident, field, value)
    db.commit()
    db.refresh(incident)
    return incident

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return None

@router.patch("/{incident_id}/status", response_model=IncidentInDB)
def update_incident_status(
    incident_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update the status of an incident.
    Allowed status values: Investigating, Contained, Resolved, False Positive.
    The stored status "NEW" is treated as "Open" in the UI.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Validate the status
    allowed_statuses = ["Investigating", "Contained", "Resolved", "False Positive"]
    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of {allowed_statuses}"
        )

    incident.status = status
    # If resolving or marking as false positive, set resolved_at if not already set
    if status in ["Resolved", "False Positive"] and incident.resolved_at is None:
        incident.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(incident)
    return incident

@router.post("/{incident_id}/timeline", response_model=IncidentInDB)
def add_to_timeline(
    incident_id: int,
    timeline_entry: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Add an entry to the incident's timeline.
    The timeline_entry should be a dictionary. It is recommended to include a "type" key
    to distinguish between different kinds of entries (e.g., "note", "investigation_step",
    "evidence", "resolution_summary").
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Add a timestamp if not provided
    if "timestamp" not in timeline_entry:
        timeline_entry["timestamp"] = datetime.utcnow().isoformat()

    incident.add_timeline_entry(timeline_entry)
    db.commit()
    db.refresh(incident)
    return incident