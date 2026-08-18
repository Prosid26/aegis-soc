from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base import Base

# Association table for event and threat intel
event_threat_intel = Table(
    'event_threat_intel',
    Base.metadata,
    Column('event_id', Integer, ForeignKey('events.id')),
    Column('threat_intel_id', Integer, ForeignKey('threat_intel.id'))
)

# Association table for incident and MITRE technique
incident_mitre_technique = Table(
    'incident_mitre_technique',
    Base.metadata,
    Column('incident_id', Integer, ForeignKey('incidents.id')),
    Column('mitre_technique_id', Integer, ForeignKey('mitre_techniques.id'))
)

# Association table for incident and asset (affected assets)
incident_asset = Table(
    'incident_asset',
    Base.metadata,
    Column('incident_id', Integer, ForeignKey('incidents.id')),
    Column('asset_id', Integer, ForeignKey('assets.id'))
)

# Association table for detection and MITRE technique
detection_mitre_technique = Table(
    'detection_mitre_technique',
    Base.metadata,
    Column('detection_id', Integer, ForeignKey('detections.id')),
    Column('mitre_technique_id', Integer, ForeignKey('mitre_techniques.id'))
)
