from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.association import incident_mitre_technique, incident_asset
from datetime import datetime

from app.models.ai_analysis import IncidentAIAnalysis
class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(100), unique=True, index=True)  # External incident ID
    title = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(20))  # low, medium, high, critical
    status = Column(String(20), default="NEW")  # NEW, INVESTIGATING, CONTAINED, RESOLVED
    assigned_to = Column(Integer, ForeignKey('users.id'), nullable=True)
    reported_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    risk_score = Column(Integer)  # 0-100
    confidence = Column(Integer)  # 0-100
    timeline = Column(JSON)  # List of events in the incident
    raw_data = Column(JSON)  # Original data that triggered the incident

    # Relationships
    assignee = relationship("User")
    mitre_techniques = relationship("MITRETechnique", secondary=incident_mitre_technique, back_populates="incidents")
    affected_assets = relationship("Asset", secondary=incident_asset, back_populates="incidents")
    detections = relationship("Detection", secondary="detection_incident", back_populates="incidents")
    ai_analyses = relationship("IncidentAIAnalysis", back_populates="incident")
