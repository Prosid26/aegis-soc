"""
Seed data script for AegisSOC
Run this script to populate the database with demo data
"""
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, Role
from app.models.asset import Asset
from app.models.event import Event
from app.models.incident import Incident
from app.models.threat_intel import ThreatIntel
from app.models.mitre import MITRETechnique
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import json

def create_roles(db: Session):
    """Create default roles"""
    roles = [
        {"name": "ADMIN", "description": "Administrator with full access"},
        {"name": "SECURITY_ANALYST", "description": "Security analyst who can investigate incidents"},
        {"name": "VIEWER", "description": "Viewer with read-only access"}
    ]

    for role_data in roles:
        role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not role:
            role = Role(**role_data)
            db.add(role)

    db.commit()
    print("Roles created")

def create_users(db: Session):
    """Create demo users"""
    # Get roles
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    analyst_role = db.query(Role).filter(Role.name == "SECURITY_ANALYST").first()
    viewer_role = db.query(Role).filter(Role.name == "VIEWER").first()

    # Debug password lengths
    print("Creating users")
    print("admin123 length:", len("admin123"))
    print("analyst123 length:", len("analyst123"))
    print("viewer123 length:", len("viewer123"))
    users = [
        {
            "email": "admin@aegis-soc.com",
            "username": "admin",
            "full_name": "System Administrator",
            "hashed_password": get_password_hash("admin123"),
            "is_active": True,
            "is_verified": True
        },
        {
            "email": "analyst@aegis-soc.com",
            "username": "analyst",
            "full_name": "Security Analyst",
            "hashed_password": get_password_hash("analyst123"),
            "is_active": True,
            "is_verified": True
        },
        {
            "email": "viewer@aegis-soc.com",
            "username": "viewer",
            "full_name": "Security Viewer",
            "hashed_password": get_password_hash("viewer123"),
            "is_active": True,
            "is_verified": True
        }
    ]

    for user_data in users:
        user = db.query(User).filter(User.username == user_data["username"]).first()
        if not user:
            user = User(**user_data)
            db.add(user)
            db.flush()  # Get the user ID

            # Assign roles
            if user.username == "admin":
                user.roles.append(admin_role)
            elif user.username == "analyst":
                user.roles.append(analyst_role)
            elif user.username == "viewer":
                user.roles.append(viewer_role)

    db.commit()
    print("Users created")

def create_assets(db: Session):
    """Create demo assets"""
    assets = [
        {
            "asset_id": "ASSET-001",
            "hostname": "web-prod-01",
            "ip_address": "10.0.1.10",
            "mac_address": "00:1a:2b:3c:4d:5e",
            "asset_type": "web_server",
            "operating_system": "Ubuntu 20.04 LTS",
            "owner": "Infrastructure Team",
            "location": "Data Center A",
            "tags": ["web", "production", "public-facing"],
            "is_critical": True,
            "is_monitored": True
        },
        {
            "asset_id": "ASSET-002",
            "hostname": "db-prod-01",
            "ip_address": "10.0.1.20",
            "mac_address": "00:1a:2b:3c:4d:5f",
            "asset_type": "database_server",
            "operating_system": "CentOS 7",
            "owner": "Database Team",
            "location": "Data Center A",
            "tags": ["database", "production", "pci"],
            "is_critical": True,
            "is_monitored": True
        },
        {
            "asset_id": "ASSET-003",
            "hostname": "dc-prod-01",
            "ip_address": "10.0.1.30",
            "mac_address": "00:1a:2b:3c:4d:60",
            "asset_type": "domain_controller",
            "operating_system": "Windows Server 2019",
            "owner": "IT Security Team",
            "location": "Data Center B",
            "tags": ["domain-controller", "authentication", "critical"],
            "is_critical": True,
            "is_monitored": True
        },
        {
            "asset_id": "ASSET-004",
            "hostname": "ws-user-042",
            "ip_address": "10.0.2.42",
            "mac_address": "00:1a:2b:3c:4d:61",
            "asset_type": "workstation",
            "operating_system": "Windows 10 Enterprise",
            "owner": "Marketing Department",
            "location": "Office Floor 3",
            "tags": ["workstation", "user", "marketing"],
            "is_critical": False,
            "is_monitored": True
        },
        {
            "asset_id": "ASSET-005",
            "hostname": "email-prod-01",
            "ip_address": "10.0.1.50",
            "mac_address": "00:1a:2b:3c:4d:62",
            "asset_type": "mail_server",
            "operating_system": "Ubuntu 18.04 LTS",
            "owner": "Communications Team",
            "location": "Data Center A",
            "tags": ["email", "production", "smtp"],
            "is_critical": True,
            "is_monitored": True
        }
    ]

    for asset_data in assets:
        asset = db.query(Asset).filter(Asset.asset_id == asset_data["asset_id"]).first()
        if not asset:
            asset = Asset(**asset_data)
            db.add(asset)

    db.commit()
    print("Assets created")

def create_mitre_techniques(db: Session):
    """Create sample MITRE ATT&CK techniques"""
    techniques = [
        {
            "technique_id": "T1110",
            "tactic": "credential-access",
            "name": "Brute Force",
            "description": "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained.",
            "data_sources": ["Windows Security Logs", "Unix Authentication Logs", "Network Traffic"],
            "platforms": ["Windows", "Linux", "macOS"],
            "permissions_required": ["User"]
        },
        {
            "technique_id": "T1068",
            "tactic": "privilege-escalation",
            "name": "Exploitation for Privilege Escalation",
            "description": "Adversaries may exploit software vulnerabilities in an attempt to elevate privileges.",
            "data_sources": ["Process Monitoring", "Windows Security Logs", "API Monitoring"],
            "platforms": ["Windows", "Linux", "macOS"],
            "permissions_required": ["User"]
        },
        {
            "technique_id": "T1046",
            "tactic": "discovery",
            "name": "Network Service Scanning",
            "description": "Adversaries may attempt to get a listing of services running on remote hosts.",
            "data_sources": ["Network Traffic", "Firewall Logs", "IDS/IPS"],
            "platforms": ["Windows", "Linux", "macOS"],
            "permissions_required": ["User"]
        },
        {
            "technique_id": "T1078",
            "tactic": "defense-evasion",
            "name": "Valid Accounts",
            "description": "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.",
            "data_sources": ["Windows Security Logs", "Unix Authentication Logs", "Network Traffic"],
            "platforms": ["Windows", "Linux", "macOS"],
            "permissions_required": ["User"]
        },
        {
            "technique_id": "T1021",
            "tactic": "lateral-movement",
            "name": "Remote Services",
            "description": "Adversaries may use valid accounts to log into a service specifically designed to accept remote connections.",
            "data_sources": ["Windows Security Logs", "Unix Authentication Logs", "Network Traffic"],
            "platforms": ["Windows", "Linux", "macOS"],
            "permissions_required": ["User"]
        },
        {
            "technique_id": "T1041",
            "tactic": "exfiltration",
            "name": "Exfiltration Over C2 Channel",
            "description": "Adversaries may steal data by exfiltrating it over an existing command-and-control channel.",
            "data_sources": ["Network Traffic", "Proxy Logs", "Firewall Logs"],
            "platforms": ["Windows", "Linux", "macOS"],
            "permissions_required": ["User"]
        }
    ]

    for technique_data in techniques:
        technique = db.query(MITRETechnique).filter(MITRETechnique.technique_id == technique_data["technique_id"]).first()
        if not technique:
            technique = MITRETechnique(**technique_data)
            db.add(technique)

    db.commit()
    print("MITRE techniques created")

def create_threat_intelligence(db: Session):
    """Create sample threat intelligence"""
    threats = [
        {
            "indicator": "185.141.63.120",
            "indicator_type": "ip",
            "threat_type": "botnet_c2",
            "confidence": 95,
            "source": "Abuse.ch",
            "description": "Known Zeus botnet command and control server",
            "tags": ["botnet", "zeus", "malware"],
            "is_active": True
        },
        {
            "indicator": "malicious-domain.com",
            "indicator_type": "domain",
            "threat_type": "phishing",
            "confidence": 90,
            "source": "VirusTotal",
            "description": "Domain used for phishing campaigns targeting financial institutions",
            "tags": ["phishing", "financial", "spoofing"],
            "is_active": True
        },
        {
            "indicator": "44d88612fea8a8f36de82e1278abb02f",
            "indicator_type": "hash",
            "threat_type": "malware",
            "confidence": 99,
            "source": "Hybrid Analysis",
            "description": "Known WannaCry ransomware sample",
            "tags": ["ransomware", "wannacry", "malware"],
            "is_active": True
        },
        {
            "indicator": "104.244.42.1",
            "indicator_type": "ip",
            "threat_type": "tor_exit_node",
            "confidence": 80,
            "source": "Tor Project",
            "description": "Known Tor exit node",
            "tags": ["tor", "anonymity", "privacy"],
            "is_active": True
        }
    ]

    for threat_data in threats:
        threat = db.query(ThreatIntel).filter(ThreatIntel.indicator == threat_data["indicator"]).first()
        if not threat:
            threat = ThreatIntel(**threat_data)
            db.add(threat)

    db.commit()
    print("Threat intelligence created")

def create_sample_events(db: Session):
    """Create sample security events"""
    # Get some assets for references
    web_asset = db.query(Asset).filter(Asset.asset_id == "ASSET-001").first()
    db_asset = db.query(Asset).filter(Asset.asset_id == "ASSET-002").first()
    dc_asset = db.query(Asset).filter(Asset.asset_id == "ASSET-003").first()
    ws_asset = db.query(Asset).filter(Asset.asset_id == "ASSET-004").first()

    base_time = datetime.utcnow() - timedelta(hours=6)

    events = [
        # Brute force attack on domain controller
        {
            "event_id": "EVT-001",
            "timestamp": base_time + timedelta(minutes=5),
            "source_ip": "185.141.63.120",
            "destination_ip": dc_asset.ip_address if dc_asset else "10.0.1.30",
            "destination_port": 389,
            "protocol": "LDAP",
            "event_type": "authentication_failure",
            "severity": "medium",
            "user": "administrator",
            "asset": "dc-prod-01",
            "asset_id": dc_asset.id if dc_asset else None,
            "description": "Failed LDAP authentication attempt for administrator account",
            "raw_data": {
                "logon_type": 3,
                "authentication_package": "Kerberos",
                "failure_reason": "Unknown user name or bad password"
            }
        },
        {
            "event_id": "EVT-002",
            "timestamp": base_time + timedelta(minutes=6),
            "source_ip": "185.141.63.120",
            "destination_ip": dc_asset.ip_address if dc_asset else "10.0.1.30",
            "destination_port": 389,
            "protocol": "LDAP",
            "event_type": "authentication_failure",
            "severity": "medium",
            "user": "administrator",
            "asset": "dc-prod-01",
            "asset_id": dc_asset.id if dc_asset else None,
            "description": "Failed LDAP authentication attempt for administrator account",
            "raw_data": {
                "logon_type": 3,
                "authentication_package": "Kerberos",
                "failure_reason": "Unknown user name or bad password"
            }
        },
        {
            "event_id": "EVT-003",
            "timestamp": base_time + timedelta(minutes=7),
            "source_ip": "185.141.63.120",
            "destination_ip": dc_asset.ip_address if dc_asset else "10.0.1.30",
            "destination_port": 389,
            "protocol": "LDAP",
            "event_type": "authentication_failure",
            "severity": "medium",
            "user": "administrator",
            "asset": "dc-prod-01",
            "asset_id": dc_asset.id if dc_asset else None,
            "description": "Failed LDAP authentication attempt for administrator account",
            "raw_data": {
                "logon_type": 3,
                "authentication_package": "Kerberos",
                "failure_reason": "Unknown user name or bad password"
            }
        },
        {
            "event_id": "EVT-004",
            "timestamp": base_time + timedelta(minutes=8),
            "source_ip": "185.141.63.120",
            "destination_ip": dc_asset.ip_address if dc_asset else "10.0.1.30",
            "destination_port": 389,
            "protocol": "LDAP",
            "event_type": "authentication_success",
            "severity": "high",
            "user": "administrator",
            "asset": "dc-prod-01",
            "asset_id": dc_asset.id if dc_asset else None,
            "description": "Successful LDAP authentication for administrator account after multiple failures",
            "raw_data": {
                "logon_type": 3,
                "authentication_package": "Kerberos"
            }
        },
        # Port scan on web server
        {
            "event_id": "EVT-005",
            "timestamp": base_time + timedelta(minutes=15),
            "source_ip": "104.244.42.1",
            "destination_ip": web_asset.ip_address if web_asset else "10.0.1.10",
            "destination_port": 22,
            "protocol": "TCP",
            "event_type": "port_scan",
            "severity": "low",
            "asset": "web-prod-01",
            "asset_id": web_asset.id if web_asset else None,
            "description": "Connection attempt to SSH port",
            "raw_data": {
                "flags": "S",
                "ttl": 48
            }
        },
        {
            "event_id": "EVT-006",
            "timestamp": base_time + timedelta(minutes=15, seconds=10),
            "source_ip": "104.244.42.1",
            "destination_ip": web_asset.ip_address if web_asset else "10.0.1.10",
            "destination_port": 23,
            "protocol": "TCP",
            "event_type": "port_scan",
            "severity": "low",
            "asset": "web-prod-01",
            "asset_id": web_asset.id if web_asset else None,
            "description": "Connection attempt to Telnet port",
            "raw_data": {
                "flags": "S",
                "ttl": 48
            }
        },
        {
            "event_id": "EVT-007",
            "timestamp": base_time + timedelta(minutes=15, seconds=20),
            "source_ip": "104.244.42.1",
            "destination_ip": web_asset.ip_address if web_asset else "10.0.1.10",
            "destination_port": 80,
            "protocol": "TCP",
            "event_type": "port_scan",
            "severity": "low",
            "asset": "web-prod-01",
            "asset_id": web_asset.id if web_asset else None,
            "description": "Connection attempt to HTTP port",
            "raw_data": {
                "flags": "S",
                "ttl": 48
            }
        },
        {
            "event_id": "EVT-008",
            "timestamp": base_time + timedelta(minutes=15, seconds=30),
            "source_ip": "104.244.42.1",
            "destination_ip": web_asset.ip_address if web_asset else "10.0.1.10",
            "destination_port": 443,
            "protocol": "TCP",
            "event_type": "port_scan",
            "severity": "low",
            "asset": "web-prod-01",
            "asset_id": web_asset.id if web_asset else None,
            "description": "Connection attempt to HTTPS port",
            "raw_data": {
                "flags": "S",
                "ttl": 48
            }
        },
        # Privilege escalation attempt
        {
            "event_id": "EVT-009",
            "timestamp": base_time + timedelta(hours=1, minutes=30),
            "source_ip": "10.0.2.42",
            "destination_ip": ws_asset.ip_address if ws_asset else "10.0.2.42",
            "destination_port": 0,
            "protocol": "LOCAL",
            "event_type": "privilege_escalation",
            "severity": "high",
            "user": "john.doe",
            "asset": "ws-user-042",
            "asset_id": ws_asset.id if ws_asset else None,
            "description": "Attempted privilege escalation via vulnerable service",
            "raw_data": {
                "process_name": "svchost.exe",
                "parent_process": "explorer.exe",
                "vulnerability": "CVE-2021-34527"
            }
        }
    ]

    # Fix the ws-user-042 reference
    ws_user_042 = db.query(Asset).filter(Asset.asset_id == "ASSET-004").first()
    for event in events:
        if event["asset"] == "ws-user-042":
            event["asset_id"] = ws_user_042.id if ws_user_042 else None

    for event_data in events:
        event = db.query(Event).filter(Event.event_id == event_data["event_id"]).first()
        if not event:
            event = Event(**event_data)
            db.add(event)

    db.commit()
    print("Sample events created")

def create_sample_incidents(db: Session):
    """Create sample incidents"""
    # Get some events for the timeline
    brute_force_events = db.query(Event).filter(Event.event_type == "authentication_failure").all()
    port_scan_events = db.query(Event).filter(Event.event_type == "port_scan").all()
    priv_esc_event = db.query(Event).filter(Event.event_type == "privilege_escalation").first()

    incidents = [
        {
            "incident_id": "INC-001",
            "title": "Brute Force Attack on Domain Controller",
            "description": "Multiple failed authentication attempts followed by successful login indicating possible brute force attack",
            "severity": "high",
            "status": "RESOLVED",
            "risk_score": 85,
            "confidence": 90,
            "reported_at": datetime.utcnow() - timedelta(hours=5),
            "updated_at": datetime.utcnow() - timedelta(hours=4),
            "resolved_at": datetime.utcnow() - timedelta(hours=3),
            "timeline": [
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=5, minutes=55)).isoformat(),
                    "event_type": "authentication_failure",
                    "description": "Failed authentication attempt",
                    "source_ip": "185.141.63.120",
                    "user": "administrator"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=5, minutes=50)).isoformat(),
                    "event_type": "authentication_failure",
                    "description": "Failed authentication attempt",
                    "source_ip": "185.141.63.120",
                    "user": "administrator"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=5, minutes=45)).isoformat(),
                    "event_type": "authentication_failure",
                    "description": "Failed authentication attempt",
                    "source_ip": "185.141.63.120",
                    "user": "administrator"
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=5, minutes=40)).isoformat(),
                    "event_type": "authentication_success",
                    "description": "Successful authentication after multiple failures",
                    "source_ip": "185.141.63.120",
                    "user": "administrator"
                }
            ],
            "raw_data": {
                "attack_type": "brute_force",
                "target": "domain_controller",
                "source_ip": "185.141.63.120"
            }
        },
        {
            "incident_id": "INC-002",
            "title": "Network Reconnaissance Activity",
            "description": "Port scanning activity detected from Tor exit node targeting web server",
            "severity": "medium",
            "status": "INVESTIGATING",
            "risk_score": 65,
            "confidence": 80,
            "reported_at": datetime.utcnow() - timedelta(hours=3),
            "updated_at": datetime.utcnow() - timedelta(hours=2),
            "timeline": [
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=3, minutes=10)).isoformat(),
                    "event_type": "port_scan",
                    "description": "SSH port scan detected",
                    "source_ip": "104.244.42.1",
                    "destination_port": 22
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=3, minutes=9)).isoformat(),
                    "event_type": "port_scan",
                    "description": "Telnet port scan detected",
                    "source_ip": "104.244.42.1",
                    "destination_port": 23
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=3, minutes=8)).isoformat(),
                    "event_type": "port_scan",
                    "description": "HTTP port scan detected",
                    "source_ip": "104.244.42.1",
                    "destination_port": 80
                },
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=3, minutes=7)).isoformat(),
                    "event_type": "port_scan",
                    "description": "HTTPS port scan detected",
                    "source_ip": "104.244.42.1",
                    "destination_port": 443
                }
            ],
            "raw_data": {
                "attack_type": "reconnaissance",
                "source_ip": "104.244.42.1",
                "is_tor_exit_node": True
            }
        },
        {
            "incident_id": "INC-003",
            "title": "Privilege Escalation Attempt on Workstation",
            "description": "Attempt to exploit vulnerability to gain elevated privileges on user workstation",
            "severity": "high",
            "status": "NEW",
            "risk_score": 75,
            "confidence": 70,
            "reported_at": datetime.utcnow() - timedelta(hours=1),
            "updated_at": datetime.utcnow() - timedelta(hours=1),
            "timeline": [
                {
                    "timestamp": (datetime.utcnow() - timedelta(hours=1, minutes=30)).isoformat(),
                    "event_type": "privilege_escalation",
                    "description": "Privilege escalation attempt detected",
                    "source_ip": "10.0.2.42",
                    "user": "john.doe"
                }
            ],
            "raw_data": {
                "attack_type": "privilege_escalation",
                "source_ip": "10.0.2.42",
                "vulnerability": "CVE-2021-34527",
                "process_name": "svchost.exe"
            }
        }
    ]

    for incident_data in incidents:
        incident = db.query(Incident).filter(Incident.incident_id == incident_data["incident_id"]).first()
        if not incident:
            incident = Incident(**incident_data)
            db.add(incident)

    db.commit()
    print("Sample incidents created")

def seed_database():
    """Main function to seed the database"""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Clear existing data (in reverse dependency order)
        db.query(Event).delete()
        db.query(Incident).delete()
        db.query(Asset).delete()
        db.query(User).delete()
        db.query(Role).delete()
        db.query(ThreatIntel).delete()
        db.query(MITRETechnique).delete()
        db.commit()

        # Create seed data
        create_roles(db)
        create_users(db)
        create_assets(db)
        create_mitre_techniques(db)
        create_threat_intelligence(db)
        create_sample_events(db)
        create_sample_incidents(db)

        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()