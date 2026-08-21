"""
Tests for the Correlation Engine.
"""
import pytest
from unittest.mock import Mock
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.services.correlation_engine import CorrelationEngine
from app.models.event import Event
from app.models.asset import Asset


@pytest.fixture
def db_session_mock():
    return Mock(spec=Session)


@pytest.fixture
def correlation_engine(db_session_mock):
    return CorrelationEngine(db_session_mock)


def test_correlates_brute_force_then_success(correlation_engine, db_session_mock):
    """Test detection of brute force followed by successful login."""
    # Setup mock events
    base_time = datetime.utcnow()
    events = []

    # 5 authentication failures from same IP and user
    for i in range(5):
        ev = Mock(spec=Event)
        ev.event_type = "authentication_failure"
        ev.source_ip = "192.168.1.100"
        ev.user = "testuser"
        ev.timestamp = base_time + timedelta(seconds=i*10)
        ev.severity = "medium"
        ev.asset_id = 1
        ev.id = i+1
        events.append(ev)

    # One successful login shortly after
    ev_success = Mock(spec=Event)
    ev_success.event_type = "authentication_success"
    ev_success.source_ip = "192.168.1.100"
    ev_success.user = "testuser"
    ev_success.timestamp = base_time + timedelta(seconds=60)  # 60 seconds after first failure
    ev_success.severity = "low"
    ev_success.asset_id = 1
    ev_success.id = 10
    events.append(ev_success)

    # Mock the query to return these events
    db_session_mock.query.return_value.filter.return_value.order_by.return_value.all.return_value = events

    # Mock asset lookup for criticality
    asset_mock = Mock(spec=Asset)
    asset_mock.is_critical = False
    db_session_mock.query.return_value.filter.return_value.first.return_value = asset_mock

    # Run correlation
    correlations = correlation_engine.correlate_events()

    # We expect two correlations: brute_force_to_success and same_source_ip_burst (because we have 6 events from same IP)
    assert len(correlations) == 2
    # Find the brute force correlation
    brute_corr = None
    burst_corr = None
    for corr in correlations:
        if corr["pattern"] == "brute_force_to_success":
            brute_corr = corr
        elif corr["pattern"] == "same_source_ip_burst":
            burst_corr = corr

    assert brute_corr is not None, "Brute force correlation not found"
    assert burst_corr is not None, "Same source IP burst correlation not found"

    # Assertions for brute force correlation
    assert brute_corr["severity"] == "medium"  # highest among events
    assert len(brute_corr["related_event_ids"]) == 6  # 5 failures + 1 success
    assert brute_corr["confidence"] > 60  # should be boosted by multiple failures
    assert brute_corr["risk_score"] >= 0 and brute_corr["risk_score"] <= 100
    assert "brute force" in brute_corr["explanation"].lower()

    # Assertions for burst correlation
    assert burst_corr["severity"] == "medium"  # highest among the 5 most recent events
    assert len(burst_corr["related_event_ids"]) == 5  # 5 most recent events
    assert burst_corr["confidence"] >= 40  # base confidence for 5 events
    assert burst_corr["risk_score"] >= 0
    assert "same source ip" in burst_corr["explanation"].lower()


def test_correlates_port_scan_then_connection(correlation_engine, db_session_mock):
    """Test detection of port scan followed by suspicious connection."""
    base_time = datetime.utcnow()
    events = []

    # Port scan event
    ev_scan = Mock(spec=Event)
    ev_scan.event_type = "port_scan"
    ev_scan.source_ip = "10.0.0.1"
    ev_scan.timestamp = base_time
    ev_scan.severity = "medium"
    ev_scan.asset_id = 2
    ev_scan.id = 100
    events.append(ev_scan)

    # Suspicious connection event shortly after
    ev_conn = Mock(spec=Event)
    ev_conn.event_type = "connection"
    ev_conn.source_ip = "10.0.0.1"
    ev_conn.timestamp = base_time + timedelta(seconds=30)
    ev_conn.severity = "high"
    ev_conn.asset_id = 2
    ev_conn.id = 101
    events.append(ev_conn)

    # Mock query
    db_session_mock.query.return_value.filter.return_value.order_by.return_value.all.return_value = events

    # Mock asset lookup
    asset_mock = Mock(spec=Asset)
    asset_mock.is_critical = True
    db_session_mock.query.return_value.filter.return_value.first.return_value = asset_mock

    correlations = correlation_engine.correlate_events()

    assert len(correlations) == 1
    corr = correlations[0]
    assert corr["pattern"] == "port_scan_to_connection"
    assert corr["severity"] == "high"
    assert set(corr["related_event_ids"]) == {100, 101}
    assert corr["confidence"] >= 70  # should be at least 70
    assert corr["risk_score"] > 0
    assert "port scan" in corr["explanation"].lower()
    assert "suspicious connection" in corr["explanation"].lower()


def test_correlates_multiple_high_severity_same_asset(correlation_engine, db_session_mock):
    """Test detection of multiple high-severity events on same asset."""
    base_time = datetime.utcnow()
    events = []

    # Three high-severity events on same asset
    for i in range(3):
        ev = Mock(spec=Event)
        ev.event_type = "malware_detected"
        ev.source_ip = "10.0.0.2"
        ev.user = "attacker"
        ev.timestamp = base_time + timedelta(seconds=i*10)
        ev.severity = "high"
        ev.asset_id = 3
        ev.id = 200 + i
        events.append(ev)

    db_session_mock.query.return_value.filter.return_value.order_by.return_value.all.return_value = events

    # Asset is critical
    asset_mock = Mock(spec=Asset)
    asset_mock.is_critical = True
    db_session_mock.query.return_value.filter.return_value.first.return_value = asset_mock

    correlations = correlation_engine.correlate_events()

    assert len(correlations) == 1
    corr = correlations[0]
    assert corr["pattern"] == "multiple_high_severity_same_asset"
    assert corr["severity"] == "high"
    assert len(corr["related_event_ids"]) == 3
    assert corr["confidence"] >= 50  # base confidence for 3 events
    assert corr["risk_score"] > 0
    assert "high-severity events" in corr["explanation"].lower()


def test_correlates_same_source_ip_burst(correlation_engine, db_session_mock):
    """Test detection of many events from same source IP."""
    base_time = datetime.utcnow()
    events = []

    # Five events from same IP (various types)
    for i in range(5):
        ev = Mock(spec=Event)
        ev.event_type = "alert" if i % 2 == 0 else "log"
        ev.source_ip = "192.168.1.50"
        ev.user = f"user{i}"
        ev.timestamp = base_time + timedelta(seconds=i*5)
        ev.severity = "low" if i < 3 else "medium"
        ev.asset_id = 4 if i % 2 == 0 else None  # some have asset, some don't
        ev.id = 300 + i
        events.append(ev)

    db_session_mock.query.return_value.filter.return_value.order_by.return_value.all.return_value = events

    # No asset criticality
    asset_mock = Mock(spec=Asset)
    asset_mock.is_critical = False
    db_session_mock.query.return_value.filter.return_value.first.return_value = asset_mock

    correlations = correlation_engine.correlate_events()

    assert len(correlations) == 1
    corr = correlations[0]
    assert corr["pattern"] == "same_source_ip_burst"
    assert corr["severity"] == "medium"  # highest severity among events
    assert len(corr["related_event_ids"]) == 5
    assert corr["confidence"] >= 40  # base confidence for 5 events
    assert corr["risk_score"] >= 0
    assert "same source ip" in corr["explanation"].lower()


def test_correlation_filtering(correlation_engine, db_session_mock):
    """Test that filtering works correctly."""
    base_time = datetime.utcnow()
    events = []

    # Create a brute force correlation (should match severity medium)
    for i in range(5):
        ev = Mock(spec=Event)
        ev.event_type = "authentication_failure"
        ev.source_ip = "10.0.0.10"
        ev.user = "admin"
        ev.timestamp = base_time + timedelta(seconds=i*10)
        ev.severity = "medium"
        ev.asset_id = 5
        ev.id = 400 + i
        events.append(ev)

    ev_success = Mock(spec=Event)
    ev_success.event_type = "authentication_success"
    ev_success.source_ip = "10.0.0.10"
    ev_success.user = "admin"
    ev_success.timestamp = base_time + timedelta(seconds=60)
    ev_success.severity = "low"
    ev_success.asset_id = 5
    ev_success.id = 405
    events.append(ev_success)

    db_session_mock.query.return_value.filter.return_value.order_by.return_value.all.return_value = events

    asset_mock = Mock(spec=Asset)
    asset_mock.is_critical = False
    db_session_mock.query.return_value.filter.return_value.first.return_value = asset_mock

    # Get all correlations
    correlations = correlation_engine.correlate_events()
    # We expect two correlations: brute_force_to_success and same_source_ip_burst
    assert len(correlations) == 2

    # Filter by severity high: should exclude both (both are medium)
    filtered = [c for c in correlations if c["severity"].lower() == "high"]
    assert len(filtered) == 0

    # Filter by severity medium: should include both
    filtered = [c for c in correlations if c["severity"].lower() == "medium"]
    assert len(filtered) == 2

    # Filter by asset ID 5: should include both (both involve asset 5)
    filtered = [c for c in correlations if 5 in c["assets_involved"]]
    assert len(filtered) == 2

    # Filter by asset ID 99: should exclude both
    filtered = [c for c in correlations if 99 in c["assets_involved"]]
    assert len(filtered) == 0

    # Filter by source IP
    filtered = [c for c in correlations if "10.0.0.10" in c["source_ips_involved"]]
    assert len(filtered) == 2  # both correlations involve this IP

    filtered = [c for c in correlations if "10.0.0.11" in c["source_ips_involved"]]
    assert len(filtered) == 0

    # Filter by user
    filtered = [c for c in correlations if "admin" in c["users_involved"]]
    assert len(filtered) == 2  # both correlations involve admin

    filtered = [c for c in correlations if "hacker" in c["users_involved"]]
    assert len(filtered) == 0

    # Test combined filters: severity medium AND asset ID 5 AND source IP 10.0.0.10 AND user admin
    filtered = [c for c in correlations if
                c["severity"].lower() == "medium" and
                5 in c["assets_involved"] and
                "10.0.0.10" in c["source_ips_involved"] and
                "admin" in c["users_involved"]]
    assert len(filtered) == 2

    # Test filter that excludes one correlation: source IP 10.0.0.10 AND user admin AND exclude the burst correlation by pattern?
    # We don't filter by pattern, so we can't exclude one correlation by pattern with our current filtering.
    # But we can test that if we filter by something that only one correlation has, we get one.
    # For example, the brute force correlation has 6 event IDs, the burst correlation has 5 event IDs.
    # We cannot filter by event count directly, but we can test that the burst correlation has exactly 5 related event IDs.
    burst_corr = [c for c in correlations if c["pattern"] == "same_source_ip_burst"][0]
    assert len(burst_corr["related_event_ids"]) == 5
    brute_corr = [c for c in correlations if c["pattern"] == "brute_force_to_success"][0]
    assert len(brute_corr["related_event_ids"]) == 6