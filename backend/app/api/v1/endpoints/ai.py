from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.models.event import Event
from app.models.incident import Incident
from app.models.user import User
from app.schemas.event import EventInDB
from app.core.deps import get_current_active_user
from app.services.ai_analyst import AIAnalystService
from app.services.ai_provider import get_ai_provider
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
    query: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    source_ip: Optional[str] = Query(None),
    destination_ip: Optional[str] = Query(None),
    user: Optional[str] = Query(None),
    asset: Optional[str] = Query(None),
    timestamp_start: Optional[datetime] = Query(None),
    timestamp_end: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Threat hunting endpoint.
    Allows querying events with various filters.
    """
    # Build the query
    db_query = db.query(Event)

    # Apply filters
    if event_type:
        db_query = db_query.filter(Event.event_type == event_type)
    if severity:
        db_query = db_query.filter(Event.severity == severity)
    if source_ip:
        db_query = db_query.filter(Event.source_ip == source_ip)
    if destination_ip:
        db_query = db_query.filter(Event.destination_ip == destination_ip)
    if user:
        db_query = db_query.filter(Event.user == user)
    if asset:
        db_query = db_query.filter(Event.asset == asset)
    if timestamp_start:
        db_query = db_query.filter(Event.timestamp >= timestamp_start)
    if timestamp_end:
        db_query = db_query.filter(Event.timestamp <= timestamp_end)

    # Free-text search if query is provided
    if query:
        search = f"%{query}%"
        db_query = db_query.filter(
            or_(
                Event.event_type.ilike(search),
                Event.description.ilike(search),
                Event.source_ip.ilike(search),
                Event.destination_ip.ilike(search),
                Event.user.ilike(search),
                Event.asset.ilike(search)
            )
        )

    events = db_query.offset(skip).limit(limit).all()
    return events


@router.get("/health/")
@limiter.limit("10/minute")
async def ai_health_check(
    request: Request,
):
    """
    AI Analyst health check.
    Verifies that the AI Analyst service can initialize and the configured AI provider is healthy.
    Does NOT make an actual AI inference call.
    """
    try:
        # Get the AI provider based on configuration
        provider = get_ai_provider()
        # Perform health check on the provider
        is_healthy = await provider.health_check()
        provider_name = type(provider).__name__.replace("Provider", "").lower()
        # If we get here, the AI Analyst dependencies are healthy
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "service": "ai_analyst",
            "provider": provider_name,
            "timestamp": datetime.utcnow().isoformat(),
            "details": {
                "provider_healthy": is_healthy
            }
        }
    except Exception as e:
        # Log the error for debugging (in production, use proper logging)
        # For now, we'll return unhealthy with basic error info
        return {
            "status": "unhealthy",
            "service": "ai_analyst",
            "provider": "unknown",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }