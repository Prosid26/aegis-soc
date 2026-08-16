from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.db.session import get_db
from app.models.incident import Incident
from app.core.deps import get_current_active_user
from app.models.user import User
from app.services.ai_analyst import AIAnalystService

router = APIRouter()

@router.post("/incidents/{incident_id}/analyze")
async def analyze_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Analyze an incident using the AI Security Analyst.
    Returns structured analysis output.
    """
    # Check if incident exists
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Optional: Check if the user has permission to view this incident
    # For now, we assume any authenticated user can analyze any incident.
    # In a production system, you would check roles/permissions.

    # Initialize AI analyst service
    ai_analyst = AIAnalystService(db)

    # Perform analysis
    analysis_result = await ai_analyst.analyze_incident(incident)

    return {
        "incident_id": incident_id,
        "analysis": analysis_result
    }

# Keep the other endpoints for event investigation and threat hunting as they were
@router.post("/investigate-event/{event_id}")
async def investigate_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Initialize AI analyst service
    ai_analyst = AIAnalystService(db)

    # Perform investigation
    investigation_result = await ai_analyst.investigate_event(event)

    return {
        "event_id": event_id,
        "investigation": investigation_result
    }

@router.get("/threat-hunting")
async def threat_hunting_query(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # This would be a more complex threat hunting query using the AI analyst
    # For now, return a placeholder
    return {
        "query": query,
        "results": [],
        "message": "Threat hunting functionality would be implemented here with AI-powered querying"
    }