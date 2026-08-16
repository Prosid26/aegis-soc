import os
import sys
from sqlalchemy import create_engine, inspect
from app.db.base import Base

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Get database URL from environment or use default
database_url = os.getenv("DATABASE_URL", "sqlite:///./aegis_soc.db")
print(f"Connecting to database: {database_url}")

engine = create_engine(database_url)
inspector = inspect(engine)

# Get existing tables
tables = inspector.get_table_names()
print(f"Existing tables: {tables}")

# Check if detections table exists
if 'detections' in tables:
    print("Detections table already exists")
else:
    print("Detections table does not exist - need to create migration")

# Also check our models
print("\nChecking SQLAlchemy metadata:")
for table in Base.metadata.tables.keys():
    print(f"  - {table}")