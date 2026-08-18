from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import api_router
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.mitre import MITRETechnique
from app.core.config import settings
from app.core.rate_limiting import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(title="AegisSOC API", version="0.1.0")


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'none'"
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(api_router, prefix="/api/v1")


def seed_mitre_techniques():
    """Seed the MITRE ATT&CK techniques used by AegisSOC."""
    db = SessionLocal()
    try:
        # List of techniques to seed: (technique_id, name, tactic, description)
        techniques_to_seed = [
            (
                "T1110",
                "Brute Force",
                "credential-access",
                "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained."
            ),
            (
                "T1046",
                "Network Service Scanning",
                "discovery",
                "Adversaries may attempt to get a listing of services running on remote hosts, including those that may be vulnerable to remote software exploitation. Methods may include exploiting vulnerabilities to gather information."
            ),
            (
                "T1068",
                "Exploitation for Privilege Escalation",
                "privilege-escalation",
                "Adversaries may exploit software vulnerabilities in an attempt to elevate privileges."
            ),
        ]

        for technique_id, name, tactic, description in techniques_to_seed:
            # Check if technique already exists
            existing = db.query(MITRETechnique).filter(MITRETechnique.technique_id == technique_id).first()
            if not existing:
                technique = MITRETechnique(
                    technique_id=technique_id,
                    name=name,
                    tactic=tactic,
                    description=description,
                    data_sources=[],  # We'll leave empty for now
                    platforms=[],     # We'll leave empty for now
                    permissions_required=[],  # We'll leave empty for now
                )
                db.add(technique)
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    seed_mitre_techniques()


@app.get("/")
async def root():
    return {"message": "AegisSOC API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/test-rate-limit")
@limiter.limit("1/minute")
async def test_rate_limit(request: Request):
    return {"message": "test endpoint"}
