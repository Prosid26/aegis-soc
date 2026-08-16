from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean, Table
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.event import Event
from app.models.incident import Incident
from app.models.asset import Asset
from app.models.user import User
from datetime import datetime


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(String(100), unique=True, index=True)  # External detection ID
    rule_id = Column(String(50), nullable=False, index=True)  # e.g., BRUTE_FORCE_001
    rule_name = Column(String(255), nullable=False)
    description = Column(Text)
    severity = Column(String(20))  # low, medium, high, critical
    confidence = Column(Integer)  # 0-100
    risk_score = Column(Integer)  # 0-100
    timestamp = Column(DateTime, nullable=False, index=True)  # When detection occurred
    status = Column(String(20), default="NEW")  # NEW, IN_PROGRESS, RESOLVED, FALSE_POSITIVE

    # Related entities
    source_ip = Column(String(45))  # IPv4 or IPv6
    destination_ip = Column(String(45))
    user = Column(String(255))  # Username if applicable
    asset = Column(String(255))  # Asset hostname or ID
    asset_id = Column(Integer, ForeignKey('assets.id'), nullable=True)

    # Related events and evidence
    event_ids = Column(JSON)  # List of event IDs that triggered this detection
    evidence = Column(JSON)  # Additional evidence data

    # Relationships
    asset_info = relationship("Asset", back_populates="detections")
    incidents = relationship("Incident", secondary="detection_incident", back_populates="detections")
    mitre_techniques = relationship("MITRETechnique", secondary="detection_mitre_technique", back_populates="detections")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Association table for detections and incidents (many-to-many)
detection_incident = Table(
    'detection_incident',
    Base.metadata,
    Column('detection_id', Integer, ForeignKey('detections.id')),
    Column('incident_id', Integer, ForeignKey('incidents.id'))
)