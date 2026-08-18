from fastapi import APIRouter
from app.api.v1.endpoints import auth, events, ai, incidents, assets, threat_intel, mitre, analytics, detection

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(events.router, prefix="/events", tags=["events"])
router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
router.include_router(assets.router, prefix="/assets", tags=["assets"])
router.include_router(threat_intel.router, prefix="/threat-intel", tags=["threat-intel"])
router.include_router(mitre.router, prefix="/mitre", tags=["mitre"])
router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(detection.router, prefix="/detection", tags=["detection"])

__all__ = ["router"]
