import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))

try:
    from app.models import Asset, Detection, Incident
    print("Import succeeded")
    print(f"Asset has detections: {hasattr(Asset, 'detections')}")
    print(f"Detection has asset_info: {hasattr(Detection, 'asset_info')}")
    print(f"Incident has detections: {hasattr(Incident, 'detetions')}")  # Intentional typo to see
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()