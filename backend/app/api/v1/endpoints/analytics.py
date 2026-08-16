from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.db.session import get_db
from app.models.event import Event
from app.models.incident import Incident
from app.models.asset import Asset
from app.models.user import User
from app.core.deps import get_current_active_user
from app.models.user import User
import datetime
from sqlalchemy import func, and_

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Get counts for dashboard widgets
    total_events = db.query(Event).count()
    events_24h = db.query(Event).filter(
        Event.timestamp >= datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    ).count()

    total_incidents = db.query(Incident).count()
    open_incidents = db.query(Incident).filter(
        Incident.status.in_(["NEW", "INVESTIGATING"])
    ).count()

    critical_incidents = db.query(Incident).filter(
        Incident.severity == "critical"
    ).count()

    total_assets = db.query(Asset).count()
    critical_assets = db.query(Asset).filter(
        Asset.is_critical == True
    ).count()

    # Events by type (top 5)
    events_by_type = db.query(
        Event.event_type,
        func.count(Event.id).label('count')
    ).group_by(Event.event_type).order_by(
        func.count(Event.id).desc()
    ).limit(5).all()

    # Events by severity
    events_by_severity = db.query(
        Event.severity,
        func.count(Event.id).label('count')
    ).group_by(Event.severity).all()

    return {
        "total_events": total_events,
        "events_24h": events_24h,
        "total_incidents": total_incidents,
        "open_incidents": open_incidents,
        "critical_incidents": critical_incidents,
        "total_assets": total_assets,
        "critical_assets": critical_assets,
        "events_by_type": [{"type": et.event_type, "count": et.count} for et in events_by_type],
        "events_by_severity": [{"severity": es.severity, "count": es.count} for es in events_by_severity]
    }

@router.get("/events/timeline")
def get_events_timeline(
    hours: int = Query(24, ge=1, le=168),  # 1 hour to 7 days
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    since = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
    # Group events by hour
    results = db.query(
        func.date_trunc('hour', Event.timestamp).label('hour'),
        func.count(Event.id).label('count')
    ).filter(
        Event.timestamp >= since
    ).group_by(
        func.date_trunc('hour', Event.timestamp)
    ).order_by(
        func.date_trunc('hour', Event.timestamp)
    ).all()

    return [
        {
            "hour": r.hour.isoformat() if r.hour else None,
            "count": r.count
        }
        for r in results
    ]
