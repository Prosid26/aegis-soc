# AEGISSOC PHASE 5 — MITRE ATT&CK REPORT

## IMPLEMENTATION

- MITRE data model: PASS
- Detection mapping: PASS
- Incident mapping: PASS
- MITRE API: PASS
- Seed data: PASS

## MAPPINGS

| Detection Rule ID | MITRE Technique ID | Technique Name           | Tactic                 |
|-------------------|--------------------|--------------------------|------------------------|
| BRUTE_FORCE_001   | T1110              | Brute Force              | Credential Access      |
| PORT_SCAN_001     | T1046              | Network Service Scanning | Discovery              |
| PRIV_ESC_001      | T1068              | Exploitation for Privilege Escalation | Privilege Escalation |
| ANOMALOUS_LOGIN_001 | (none)            | (none)                   | (none)                 |
| IMPOSSIBLE_TRAVEL_001 | (none)          | (none)                   | (none)                 |
| IOC_MATCH_001     | (none)             | (none)                   | (none)                 |

## TESTS

We created the following test suites (all passing):

1. **MITRE mapping tests**:
   - `test_brute_force_mitre_mapping`: Verifies BRUTE_FORCE_001 maps to T1110.
   - `test_port_scan_mitre_mapping`: Verifies PORT_SCAN_001 maps to T1046.
   - `test_privilege_escalation_mitre_mapping`: Verifies PRIV_ESC_001 maps to T1068.
   - `test_unmapped_detection_returns_null`: Verifies ANOMALOUS_LOGIN_001, IMPOSSIBLE_TRAVEL_001, and IOC_MATCH_001 return empty MITRE context.

2. **Persistence tests**:
   - `test_detection_mitre_persistence`: Verifies that when a detection is saved, the associated MITRE techniques are stored in the `detection_mitre_technique` association table.
   - `test_incident_mitre_context`: Verifies that incidents created from detections include the correct MITRE techniques.

3. **API tests**:
   - `test_mitre_api_techniques`: Verifies the `/mitre/techniques` and `/mitre/techniques/{technique_id}` endpoints.
   - `test_mitre_api_detection_mapping`: Verifies the `/mitre/detections/{rule_id}` endpoint returns the correct techniques for a given rule ID.
   - `test_detection_api_mitre_context`: Verifies that detection endpoints (`/detection/run`, `/detection/brute-force`, etc.) return alerts with the `mitre` field populated.
   - `test_incident_api_mitre_context`: Verifies that incident endpoints return incidents with the `mitre_techniques` field populated.

4. **Regression tests**:
   - Verified that existing Phase 4 functionality continues to work:
     - Health endpoint returns `{"status":"healthy"}`.
     - Authentication flow (login, token validation) works.
     - Event creation and retrieval work.
     - Detection engine executes all six rules and returns alerts.
     - Detection persistence to the `detections` table works.
     - Incident creation from detections works.
     - No false positives when rules shouldn't trigger (e.g., anomalous login only triggers outside 22:00-06:00 window).

## EXAMPLE

**Event**:  
An authentication failure event from IP `185.141.63.120` for user `administrator` at timestamp `2026-08-16T06:10:06Z`.

**→ Detection**:  
Brute force detection triggers after 5 such events within 5 minutes.  
Detection alert includes:
```json
{
  "rule_id": "BRUTE_FORCE_001",
  "name": "Brute Force Authentication Attempt",
  "description": "Detected 5 authentication failures from IP 185.141.63.120 within 5 minutes",
  "severity": "medium",
  "confidence": 60,
  "risk_score": 58,
  "event_ids": [1,2,3,4,5],
  "evidence": { ... },
  "mitre": [
    {
      "technique_id": "T1110",
      "technique_name": "Brute Force",
      "tactic": "credential-access",
      "description": "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained."
    }
  ],
  "timestamp": "2026-08-16T06:12:06.735475",
  "event_type": "brute_force_detected",
  "metadata": { "rule_version": "1.0", "threshold": 5, "time_window": 5 }
}
```

**→ Risk Score**:  
Computed deterministically:  
severity_score (medium=30) + confidence_score (60*0.3=18) + event_count_score (5*2=10, capped at 20) + critical_score (0) = 58.

**→ MITRE Technique**:  
T1110 (Brute Force) under tactic Credential Access.

**→ Incident**:  
An incident is created linked to the detection, with:
```json
{
  "incident_id": "INC-004",
  "title": "Incident: Brute Force Authentication Attempt",
  "description": "Detected 5 authentication failures from IP 185.141.63.120 within 5 minutes",
  "severity": "medium",
  "status": "NEW",
  "risk_score": 58,
  "confidence": 60,
  "mitre_techniques": [
    {
      "technique_id": "T1110",
      "technique_name": "Brute Force",
      "tactic": "credential-access",
      "description": "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained."
    }
  ],
  "timeline": [{"timestamp": "2026-08-16T06:12:06.735475", "type": "detection_detected"}],
  "raw_data": { ... }
}
```

## FILES MODIFIED

1. `backend/app/models/association.py` - Added `detection_mitre_technique` association table.
2. `backend/app/models/detection.py` - Added `mitre_techniques` relationship to MITRETechnique.
3. `backend/app/models/mitre.py` - Added `detections` relationship and imported `detection_mitre_technique`.
4. `backend/app/api/v1/endpoints/detection.py` - Updated to augment alerts with MITRE context and persist MITRE techniques for detections and incidents.
5. `backend/app/schemas/incident.py` - Updated `mitre_techniques` field to use `List[MITRETechniqueInDB]` for detailed output.
6. `backend/app/api/v1/endpoints/mitre.py` - Added `GET /mitre/detections/{rule_id}` endpoint to retrieve MITRE techniques for a detection rule.
7. `backend/app/main.py` - Added startup event to seed MITRE techniques (T1110, T1046, T1068) on application start.
8. `backend/app/services/mitre_mapping.py` - New file containing the deterministic mapping from detection rule IDs to MITRE technique IDs and a lookup function.

## REMAINING LIMITATIONS

1. The MITRE mapping is hardcoded in a Python dictionary. For a production system, this should be made configurable (e.g., via a database table or external configuration file) to allow updates without code changes.
2. Only three techniques are seeded; additional techniques would require updating the seed data and the mapping dictionary.
3. The `data_sources`, `platforms`, and `permissions_required` fields in the seeded MITRE techniques are left empty due to lack of specific information in the detection rules. These could be enriched in the future.
4. The mapping does not support multiple techniques per rule (though the data model does); current rules map to at most one technique.
5. The MITRE tactic is stored as a string (e.g., "credential-access") but could be normalized to an enum for consistency.