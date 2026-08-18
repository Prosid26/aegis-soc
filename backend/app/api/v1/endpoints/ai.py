from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.event import Event
from app.models.incident import Incident
from app.models.user import User
from app.core.deps import get_current_active_user
from app.services.ai_analyst import AIAnalystService
from app.core.rate_limiting import limiter

router = APIRouter()


@router.post("/incidents/{incident_id}/analyze")
@limiter.limit("10/minute")
async def analyze_incident(
    request: Request,
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Analyze an incident using the AI Security Analyst.
    Returns structured analysis output.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    ai_analyst = AIAnalystService(db)
    analysis_result = await ai_analyst.analyze_incident(incident)

    return {
        "incident_id": incident_id,
        "analysis": analysis_result,
    }


@router.post("/investigate-event/{event_id}")
@limiter.limit("10/minute")
async def investigate_event(
    request: Request,
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Investigate an event using the AI Security Analyst.
    """
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    ai_analyst = AIAnalystService(db)
    investigation_result = await ai_analyst.investigate_event(event)

    return {
        "event_id": event_id,
        "investigation": investigation_result,
    }


@router.get("/threat-hunting")
@limiter.limit("10/minute")
async def threat_hunting_query(
    request: Request,
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Threat hunting endpoint.

    Currently returns a placeholder response.
    """
    return {
        "query": query,
        "results": [],
        "message": "Threat hunting functionality would be implemented here with AI-powered querying",
    }