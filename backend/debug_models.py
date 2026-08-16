import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Import the models package
import app.models

# Check what's in Base.metadata
from app.db.base import Base
print("Tables in Base.metadata:")
for table in Base.metadata.tables.keys():
    print(f"  - {table}")

# Also check if Detection is in the models module
print("\nChecking app.models:")
print(dir(app.models))