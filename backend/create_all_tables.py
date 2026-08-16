import os
import sys
from sqlalchemy import create_engine
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Import all models to ensure they are registered with Base.metadata
from app.models import Asset, Event, Incident, User, Role, ThreatIntel, Vulnerability, MITRETechnique, Detection
# Also import the association table
from app.models.detection import detection_incident

from app.db.base import Base

# Get database URL from environment or use default
database_url = os.getenv("DATABASE_URL", "sqlite:///./aegis_soc.db")
print(f"Connecting to database: {database_url}")

engine = create_engine(database_url)

# Create all tables defined in Base.metadata that don't exist yet
print("Creating tables...")
Base.metadata.create_all(engine)
print("Done.")

# Verify
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables now: {tables}")
for expected in ['detections', 'detection_incident']:
    if expected in tables:
        print(f"{expected} table created.")
    else:
        print(f"{expected} table NOT created.")