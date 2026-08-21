"""
Tests for the Detection Engine risk scoring logic.
"""
import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session
from app.services.detection_engine import DetectionEngine


def test_compute_risk_score_base():
    """Test base risk score calculation."""
    db_mock = Mock(spec=Session)
    engine = DetectionEngine(db_mock)

    # Test low severity, low confidence, few events, non-critical asset
    result = engine._compute_risk_score(
        severity="low",
        confidence=20,
        event_count=1,
        asset_critical=False
    )
    assert result["score"] == 10 + 6 + 2 + 0  # severity 10, confidence 6, event 2, critical 0
    assert result["factors"]["severity_points"] == 10
    assert result["factors"]["confidence_points"] == 6
    assert result["factors"]["event_count_points"] == 2
    assert result["factors"]["critical_points"] == 0

    # Test high severity, high confidence, many events, critical asset
    result = engine._compute_risk_score(
        severity="high",
        confidence=90,
        event_count=15,
        asset_critical=True
    )
    # severity: 60, confidence: min(30, 90*0.3=27) => 27, event: min(20,15*2=30)=>20, critical:20 => total 127 -> capped 100
    assert result["score"] == 100
    assert result["factors"]["severity_points"] == 60
    assert result["factors"]["confidence_points"] == 27
    assert result["factors"]["event_count_points"] == 20
    assert result["factors"]["critical_points"] == 20
    assert result["factors"]["base_score"] == 127
    assert result["factors"]["final_score"] == 100

def test_compute_risk_score_with_threat_intel():
    """Test risk score with threat intelligence factors."""
    db_mock = Mock(spec=Session)
    engine = DetectionEngine(db_mock)

    result = engine._compute_risk_score(
        severity="medium",
        confidence=50,
        event_count=5,
        asset_critical=False,
        threat_intel_confidence=80,
        threat_intel_severity="malware"
    )
    # base: severity 30, confidence 15, event 10, critical 0 => 55
    # threat intel: 80*0.1 = 8
    # total 63
    assert result["score"] == 63
    assert result["factors"]["threat_intel_points"] == 8
    assert result["factors"]["threat_intel_confidence"] == 80
    assert result["factors"]["threat_intel_severity"] == "malware"

def test_compute_risk_score_with_mitre():
    """Test risk score with MITRE ATT&CK factor."""
    db_mock = Mock(spec=Session)
    engine = DetectionEngine(db_mock)

    result = engine._compute_risk_score(
        severity="low",
        confidence=0,
        event_count=0,
        asset_critical=False,
        mitre_present=True
    )
    # base: severity 10, confidence 0, event 0, critical 0 => 10
    # mitre: 10
    # total 20
    assert result["score"] == 20
    assert result["factors"]["mitre_points"] == 10

def test_compute_risk_score_edge_caps():
    """Test that score is capped at 100."""
    db_mock = Mock(spec=Session)
    engine = DetectionEngine(db_mock)

    # All factors high
    result = engine._compute_risk_score(
        severity="critical",
        confidence=100,
        event_count=20,  # max for event count points
        asset_critical=True,
        threat_intel_confidence=100,
        mitre_present=True
    )
    # severity: 80
    # confidence: 30
    # event: min(20, 20*2=40) => 20
    # critical: 20
    # threat intel: 10
    # mitre: 10
    # total: 170 -> capped 100
    assert result["score"] == 100
    assert result["factors"]["final_score"] == 100
    # Ensure factors still show the raw sum
    assert result["factors"]["base_score"] == 80 + 30 + 20 + 20  # 150
    assert result["factors"]["threat_intel_points"] == 10
    assert result["factors"]["mitre_points"] == 10

def test_compute_risk_score_invalid_severity():
    """Test handling of unknown severity defaults to medium-ish."""
    db_mock = Mock(spec=Session)
    engine = DetectionEngine(db_mock)

    result = engine._compute_risk_score(
        severity="unknown",
        confidence=50,
        event_count=2,
        asset_critical=False
    )
    # unknown severity defaults to 20 points (as per get)
    assert result["factors"]["severity_points"] == 20
    # base: 20 + 15 + 4 + 0 = 39
    assert result["score"] == 39