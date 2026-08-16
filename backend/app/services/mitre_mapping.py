"""
MITRE ATT&CK mapping for detection rules.
"""

# Mapping from detection rule ID to list of MITRE technique IDs
MITRE_MAPPING = {
    "BRUTE_FORCE_001": ["T1110"],  # Brute Force
    "PORT_SCAN_001": ["T1046"],    # Network Service Scanning
    "PRIV_ESC_001": ["T1068"],     # Exploitation for Privilege Escalation
    "ANOMALOUS_LOGIN_001": [],     # No direct technique
    "IMPOSSIBLE_TRAVEL_001": [],   # No direct technique
    "IOC_MATCH_001": [],           # No direct technique (depends on the IOC)
}


def get_mitre_techniques_for_rule(db, rule_id: str):
    """
    Get MITRE technique objects for a given detection rule ID.
    Returns a list of MITRETechnique objects.
    """
    from app.models.mitre import MITRETechnique

    technique_ids = MITRE_MAPPING.get(rule_id, [])
    if not technique_ids:
        return []

    # Query the techniques by their technique_id (e.g., T1110)
    techniques = db.query(MITRETechnique).filter(MITRETechnique.technique_id.in_(technique_ids)).all()
    return techniques