import os
import sys
from sqlalchemy import create_engine
from app.db.base import Base

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Import all models to ensure they are registered with Base.metadata
import app.models  # noqa

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
if 'detections' in tables:
    print("Detections table created.")
else:
    print("Detections table NOT created.")
if 'detection_incident' in tables:
    print("Detection_incident table created.")
else:
    print("Detection_incident table NOT created.")