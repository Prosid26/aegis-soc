from fastapi import FastAPI
from app.api.api_router import api_router
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.mitre import MITRETechnique

app = FastAPI(title="AegisSOC API", version="0.1.0")

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