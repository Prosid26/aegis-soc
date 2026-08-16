"""
SQLAlchemy model for persistent AI analysis history.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.incident import Incident
from datetime import datetime

class IncidentAIAnalysis(Base):
    __tablename__ = "incident_ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # e.g., "mock", "nim"
    model = Column(String(100), nullable=True)  # e.g., "nemotron-3-8b-chat"
    analysis = Column(JSON, nullable=False)  # Store the full analysis output
    confidence = Column(Integer)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    incident = relationship("Incident", back_populates="ai_analyses")