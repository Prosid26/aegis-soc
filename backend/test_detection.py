import os
import sys
from sqlalchemy import create_engine
from app.models.detection import Detection
from app.db.base import Base

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Get database URL from environment or use default
database_url = os.getenv("DATABASE_URL", "sqlite:///./aegis_soc.db")
print(f"Connecting to database: {database_url}")

engine = create_engine(database_url)

# Create the detection table using the model's metadata
print("Creating detection table...")
Detection.__table__.create(engine, checkfirst=True)
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