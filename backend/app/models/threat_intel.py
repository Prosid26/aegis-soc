from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.association import event_threat_intel
from datetime import datetime

class ThreatIntel(Base):
    __tablename__ = "threat_intel"

    id = Column(Integer, primary_key=True, index=True)
    indicator = Column(String(255), nullable=False, index=True)  # IP, domain, hash, etc.
    indicator_type = Column(String(50), nullable=False)  # ip, domain, hash, url, etc.
    threat_type = Column(String(100))  # malware, phishing, c2, etc.
    confidence = Column(Integer)  # 0-100
    source = Column(String(255))  # Source of the threat intel
    description = Column(Text)
    tags = Column(JSON)  # List of tags
    is_active = Column(Boolean, default=True)
    first_seen = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expired_at = Column(DateTime, nullable=True)  # If the indicator expires

    # Relationships
    events = relationship("Event", secondary=event_threat_intel, back_populates="threat_intel_matches")