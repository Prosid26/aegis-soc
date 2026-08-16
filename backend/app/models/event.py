from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.association import event_threat_intel
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(100), unique=True, index=True)  # External event ID if any
    timestamp = Column(DateTime, nullable=False, index=True)
    source_ip = Column(String(45))  # IPv4 or IPv6
    destination_ip = Column(String(45))
    source_port = Column(Integer)
    destination_port = Column(Integer)
    protocol = Column(String(20))
    event_type = Column(String(100), nullable=False, index=True)  # e.g., authentication_failure, port_scan
    severity = Column(String(20))  # low, medium, high, critical
    user = Column(String(255))  # Username if applicable
    asset = Column(String(255))  # Asset hostname or ID
    asset_id = Column(Integer, ForeignKey('assets.id'), nullable=True)
    description = Column(Text)
    raw_data = Column(JSON)  # Store the original event data
    processed = Column(Boolean, default=False)  # Whether the event has been processed by detection rules
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset_info = relationship("Asset", back_populates="events")
    threat_intel_matches = relationship("ThreatIntel", secondary=event_threat_intel, back_populates="events")