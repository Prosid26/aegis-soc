from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.association import incident_asset
from app.models.vulnerability import Vulnerability
from datetime import datetime

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(100), unique=True, index=True)  # External asset ID
    hostname = Column(String(255), index=True)
    ip_address = Column(String(45))
    mac_address = Column(String(17))
    asset_type = Column(String(100))  # server, workstation, network_device, etc.
    operating_system = Column(String(255))
    owner = Column(String(255))
    location = Column(String(255))
    tags = Column(JSON)  # List of tags
    is_critical = Column(Boolean, default=False)
    is_monitored = Column(Boolean, default=True)
    last_seen = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    events = relationship("Event", back_populates="asset_info")
    vulnerabilities = relationship(Vulnerability, back_populates="asset")
    incidents = relationship("Incident", secondary=incident_asset, back_populates="affected_assets")
    detections = relationship("Detection", back_populates="asset_info")
