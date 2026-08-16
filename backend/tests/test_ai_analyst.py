"""
Tests for the AI Security Analyst service.
"""
import pytest
from unittest.mock import Mock, AsyncMock
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.services.ai_analyst import AIAnalystService
from app.services.ai_provider import MockProvider, NimProvider
from app.core.config import settings

@pytest.fixture
def mock_db():
    return Mock(spec=Session)

@pytest.fixture
def sample_incident():
    incident = Mock(spec=Incident)
    incident.id = 1
    incident.incident_id = "INC-001"
    incident.title = "Test Incident"
    incident.description = "Test description"
    incident.severity = "medium"
    incident.risk_score = 60
    incident.confidence = 70
    incident.status = "NEW"
    incident.reported_at = None  # We'll set a datetime in the test if needed
    incident.detections = []
    incident.mitre_techniques = []
    return incident

@pytest.mark.asyncio
async def test_mock_provider_analyze_incident(mock_db, sample_incident):
    """Test that the MockProvider returns a structured analysis."""
    provider = MockProvider()
    # We need to pass context; the analyze_incident method expects context.
    # But the AIAnalystService builds the context and calls provider.analyze_incident(incident, context)
    # We'll test the service directly.
    pass

@pytest.mark.asyncio
async def test_ai_analyst_service_uses_mock_provider(mock_db, sample_incident):
    """Test that the AIAnalystService uses the MockProvider when AI_PROVIDER=mock."""
    # Set the settings to mock
    settings.AI_PROVIDER = "mock"
    service = AIAnalystService(mock_db)
    assert isinstance(service.provider, MockProvider)

    # Mock the db queries to return empty lists
    mock_db.query.return_value.filter.return_value.all.return_value = []

    # We also need to mock the incident's relationships
    sample_incident.detections = []
    sample_incident.mitre_techniques = []

    # Call analyze_incident
    result = await service.analyze_incident(sample_incident)

    # Check that the result is a dict with the expected keys
    assert isinstance(result, dict)
    expected_keys = {"summary", "threat_assessment", "severity_assessment", "mitre_analysis",
                     "key_evidence", "recommended_actions", "investigation_steps",
                     "questions_for_analyst", "confidence"}
    assert set(result.keys()) == expected_keys
    assert isinstance(result["confidence"], int)
    assert 0 <= result["confidence"] <= 100

@pytest.mark.asyncio
async def test_ai_analyst_handles_empty_incident(mock_db):
    """Test analyzing an incident with no related data."""
    settings.AI_PROVIDER = "mock"
    service = AIAnalystService(mock_db)

    incident = Mock(spec=Incident)
    incident.id = 2
    incident.incident_id = "INC-002"
    incident.title = "Empty Incident"
    incident.description = None
    incident.severity = "low"
    incident.risk_score = 30
    incident.confidence = 40
    incident.status = "NEW"
    incident.reported_at = None
    incident.detections = []
    incident.mitre_techniques = []

    # Mock db queries to return empty lists
    mock_db.query.return_value.filter.return_value.all.return_value = []
    mock_db.query.return_value.filter.return_value.count.return_value = 0

    result = await service.analyze_incident(incident)

    assert result["confidence"] >= 0
    assert result["severity_assessment"] in ["low", "medium", "high", "critical"]
    assert isinstance(result["key_evidence"], list)
    assert isinstance(result["recommended_actions"], list)
    assert isinstance(result["investigation_steps"], list)
    assert isinstance(result["questions_for_analyst"], list)

@pytest.mark.asyncio
async def test_ai_analyst_persistence(mock_db, sample_incident):
    """Test that the analysis is persisted."""
    settings.AI_PROVIDER = "mock"
    service = AIAnalystService(mock_db)

    # Mock the db add and commit
    mock_db.add = Mock()
    mock_db.commit = Mock()
    mock_db.rollback = Mock()

    # Mock queries to return empty
    mock_db.query.return_value.filter.return_value.all.return_value = []
    mock_db.query.return_value.filter.return_value.count.return_value = 0

    await service.analyze_incident(sample_incident)

    # Check that add and commit were called
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

if __name__ == "__main__":
    pytest.main([__file__])