from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.association import incident_mitre_technique, detection_mitre_technique
from datetime import datetime

class MITRETechnique(Base):
    __tablename__ = "mitre_techniques"

    id = Column(Integer, primary_key=True, index=True)
    technique_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., T1078
    tactic = Column(String(50))  # e.g., credential-access
    name = Column(String(255), nullable=False)
    description = Column(Text)
    data_sources = Column(JSON)  # List of data sources
    platforms = Column(JSON)  # List of platforms
    permissions_required = Column(JSON)  # List of permissions
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    incidents = relationship("Incident", secondary=incident_mitre_technique, back_populates="mitre_techniques")
    detections = relationship("Detection", secondary=detection_mitre_technique, back_populates="mitre_techniques")
