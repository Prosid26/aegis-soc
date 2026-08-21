# AegisSOC API Reference

This document provides a comprehensive reference to the AegisSOC RESTful API. All endpoints are prefixed with `/api/v1` and return JSON responses unless otherwise noted.

## Authentication

Most endpoints require authentication via JWT token obtained from the login endpoint. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Auth Endpoints

#### Register a New User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "secure_password",
  "full_name": "Full Name"
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "created_at": "2026-08-22T10:00:00Z",
  "roles": [
    {
      "id": 3,
      "name": "VIEWER",
      "description": "Viewer role with read-only access"
    }
  ]
}
```

#### Login
```http
POST /api/v1/auth/login
```

**Request Body (form-data):**
```
username: your_username
password: your_password
```

**Response:** 200 OK
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "created_at": "2026-08-22T10:00:00Z",
  "roles": [
    {
      "id": 1,
      "name": "ADMIN",
      "description": "Administrator role with full access"
    }
  ]
}
```

## Events Endpoints

### Create Event
```http
POST /api/v1/events/
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "event_type": "failed_login",
  "source_ip": "192.168.1.100",
  "destination_ip": "10.0.0.5",
  "user": "admin",
  "asset": "web-server-01",
  "description": "Failed login attempt for user admin",
  "severity": "medium",
  "timestamp": "2026-08-22T10:00:00Z",
  "raw_data": {}
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "event_type": "failed_login",
  "source_ip": "192.168.1.100",
  "destination_ip": "10.0.0.5",
  "user": "admin",
  "asset": "web-server-01",
  "description": "Failed login attempt for user admin",
  "severity": "medium",
  "timestamp": "2026-08-22T10:00:00Z",
  "raw_data": {}
}
```

### List Events
```http
GET /api/v1/events/
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip`: Number of events to skip (default: 0)
- `limit`: Maximum number of events to return (default: 100)
- `event_type`: Filter by event type
- `severity`: Filter by severity level
- `source_ip`: Filter by source IP address

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "event_type": "failed_login",
    "source_ip": "192.168.1.100",
    "destination_ip": "10.0.0.5",
    "user": "admin",
    "asset": "web-server-01",
    "description": "Failed login attempt for user admin",
    "severity": "medium",
    "timestamp": "2026-08-22T10:00:00Z",
    "raw_data": {}
  }
]
```

### Get Specific Event
```http
GET /api/v1/events/{event_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK
```json
{
  "id": 1,
  "event_type": "failed_login",
  "source_ip": "192.168.1.100",
  "destination_ip": "10.0.0.5",
  "user": "admin",
  "asset": "web-server-01",
  "description": "Failed login attempt for user admin",
  "severity": "medium",
  "timestamp": "2026-08-22T10:00:00Z",
  "raw_data": {}
}
```

**Error Responses:**
- 404 Not Found: Event not found

### Update Event
```http
PUT /api/v1/events/{event_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as event creation
**Response:** 200 OK (updated event object)

### Delete Event
```http
DELETE /api/v1/events/{event_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 204 No Content

## Incidents Endpoints

### Create Incident
```http
POST /api/v1/incidents/
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Brute Force Attack Detected",
  "description": "Multiple failed login attempts from IP 192.168.1.100",
  "severity": "high",
  "status": "NEW",
  "risk_score": 85.5,
  "confidence": 0.9,
  "timeline": [
    {
      "timestamp": "2026-08-22T10:00:00Z",
      "type": "detection_detected",
      "description": "Brute force detection triggered"
    }
  ],
  "raw_data": {}
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "title": "Brute Force Attack Detected",
  "description": "Multiple failed login attempts from IP 192.168.1.100",
  "severity": "high",
  "status": "NEW",
  "risk_score": 85.5,
  "confidence": 0.9,
  "timestamp": "2026-08-22T10:00:00Z",
  "resolved_at": null,
  "timeline": [
    {
      "timestamp": "2026-08-22T10:00:00Z",
      "type": "detection_detected",
      "description": "Brute force detection triggered"
    }
  ],
  "raw_data": {}
}
```

### List Incidents
```http
GET /api/v1/incidents/
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip`: Number of incidents to skip (default: 0)
- `limit`: Maximum number of incidents to return (default: 100)
- `status`: Filter by status (NEW, Investigating, Contained, Resolved, False Positive)
- `severity`: Filter by severity level
- `assigned_to`: Filter by assigned user ID

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "title": "Brute Force Attack Detected",
    "description": "Multiple failed login attempts from IP 192.168.1.100",
    "severity": "high",
    "status": "NEW",
    "risk_score": 85.5,
    "confidence": 0.9,
    "timestamp": "2026-08-22T10:00:00Z",
    "resolved_at": null,
    "timeline": [...],
    "raw_data": {}
  }
]
```

### Get Specific Incident
```http
GET /api/v1/incidents/{incident_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK (incident object)

### Update Incident
```http
PUT /api/v1/incidents/{incident_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as incident creation
**Response:** 200 OK (updated incident object)

### Delete Incident
```http
DELETE /api/v1/incidents/{incident_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 204 No Content

### Update Incident Status
```http
PATCH /api/v1/incidents/{incident_id}/status
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "Investigating"
}
```

**Allowed Status Values:**
- Investigating
- Contained
- Resolved
- False Positive

**Response:** 200 OK (updated incident object)

### Add Timeline Entry
```http
POST /api/v1/incidents/{incident_id}/timeline
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "investigation_step",
  "description": "Analyzed login logs for suspicious patterns",
  "evidence": {
    "log_lines": [...]
  }
}
```

**Notes:** If no timestamp is provided, current UTC time will be used automatically.

**Response:** 200 OK (updated incident object with new timeline entry)

## Detection Endpoints

### Run All Detection Rules
```http
POST /api/v1/detection/run
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK
```json
[
  {
    "rule_id": "brute_force_001",
    "name": "Brute Force Detection",
    "description": "Multiple failed login attempts detected",
    "severity": "high",
    "confidence": 0.95,
    "risk_score": 87.5,
    "timestamp": "2026-08-22T10:00:00Z",
    "status": "NEW",
    "event_ids": [1, 2, 3, 4, 5],
    "evidence": {
      "source_ip": "192.168.1.100",
      "sample_events": [...]
    },
    "mitre": [
      {
        "technique_id": "T1110",
        "technique_name": "Brute Force",
        "tactic": "credential-access",
        "description": "Adversaries may use brute force techniques to gain access to accounts..."
      }
    ]
  }
]
```

### Run Brute Force Detection
```http
POST /api/v1/detection/brute-force
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `time_window_minutes`: Time window in minutes for analysis (default: 5)
- `threshold`: Number of failed attempts to trigger alert (default: 10)

**Response:** 200 OK (array of detection alerts, same format as above)

### Run Port Scan Detection
```http
POST /api/v1/detection/port-scan
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `threshold_ports`: Number of distinct ports to trigger alert (default: 20)
- `time_window_minutes`: Time window in minutes for analysis (default: 5)

**Response:** 200 OK (array of detection alerts)

### Run Privilege Escalation Detection
```http
POST /api/v1/detection/privilege-escalation
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK (array of detection alerts)

### Get Correlated Events (Attack Chains)
```http
GET /api/v1/detection/correlations
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `severity`: Filter by severity level
- `asset`: Filter by asset ID (integer)
- `source_ip`: Filter by source IP address
- `user`: Filter by username
- `start_time`: Start time in ISO format (e.g., 2026-08-22T09:00:00Z)
- `end_time`: End time in ISO format
- `window_minutes`: Last N minutes from now (alternative to start_time/end_time)

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "event_ids": [1, 2, 3, 4, 5],
    "source_ips_involved": ["192.168.1.100"],
    "destination_ips_involved": ["10.0.0.5", "10.0.0.6"],
    "users_involved": ["admin"],
    "assets_involved": [1],
    "severity": "high",
    "confidence": 0.85,
    "risk_score": 82.0,
    "start_time": "2026-08-22T09:55:00Z",
    "end_time": "2026-08-22T10:05:00Z",
    "event_count": 5,
    "description": "Correlated events showing brute force attack followed by successful login"
  }
]
```

## AI Analyst Endpoints

### Analyze Incident
```http
POST /api/v1/ai/incidents/{incident_id}/analyze
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK
```json
{
  "incident_id": 1,
  "analysis": {
    "summary": "Brute force attack targeting admin account",
    "attack_vector": "Network-facing service exposed to internet",
    "root_cause": "Weak password policy and lack of account lockout mechanism",
    "impact_assessment": {
      "data_exfiltration_risk": "low",
      "privilege_escalation_risk": "medium",
      "persistence_risk": "low"
    },
    "mitre_techniques": [
      {
        "technique_id": "T1110",
        "technique_name": "Brute Force",
        "tactic": "credential-access"
      }
    ],
    "recommendations": [
      "Implement account lockout policy after 5 failed attempts",
      "Enable multi-factor authentication for admin accounts",
      "Review and strengthen password policy requirements",
      "Monitor for successful authentication following failed attempts"
    ],
    "timeline_analysis": [
      {
        "timestamp": "2026-08-22T09:55:00Z",
        "event_type": "failed_login",
        "description": "Initial failed login attempt"
      }
    ]
  }
}
```

### Investigate Event
```http
POST /api/v1/ai/investigate-event/{event_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK
```json
{
  "event_id": 1,
  "investigation": {
    "summary": "Failed login attempt for admin account",
    "context": "Event occurred during non-business hours",
    "indicators": [
      {
        "type": "ip_address",
        "value": "192.168.1.100",
        "significance": "External IP attempting internal access"
      }
    ],
    "recommendations": [
      "Block source IP temporarily",
      "Review authentication logs for similar patterns",
      "Consider implementing geo-fencing for authentication"
    ]
  }
}
```

### Threat Hunting Query
```http
GET /api/v1/ai/threat-hunting
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `query`: Free-text search term
- `skip`: Number of results to skip (default: 0)
- `limit`: Maximum number of results to return (default: 100)
- `event_type`: Filter by event type
- `severity`: Filter by severity level
- `source_ip`: Filter by source IP address
- `destination_ip`: Filter by destination IP address
- `user`: Filter by username
- `asset`: Filter by asset name
- `timestamp_start`: Start time in ISO format
- `timestamp_end`: End time in ISO format

**Response:** 200 OK (array of event objects matching criteria)

## Assets Endpoints

### Create Asset
```http
POST /api/v1/assets/
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hostname": "web-server-01",
  "asset_type": "server",
  "is_critical": true,
  "is_monitored": true,
  "ip_address": "10.0.0.5",
  "mac_address": "00:11:22:33:44:55",
  "owner": "IT Team",
  "location": "Data Center A"
}
```

**Response:** 201 Created

### List Assets
```http
GET /api/v1/assets/
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `asset_type`: Filter by asset type
- `is_critical`: Filter by critical status (true/false)
- `is_monitored`: Filter by monitored status (true/false)

**Response:** 200 OK (array of asset objects)

### Get Specific Asset
```http
GET /api/v1/assets/{asset_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK

### Update Asset
```http
PUT /api/v1/assets/{asset_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as asset creation
**Response:** 200 OK

### Delete Asset
```http
DELETE /api/v1/assets/{asset_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 204 No Content

## Threat Intelligence Endpoints

### Create Threat Intelligence Record
```http
POST /api/v1/threat-intel/
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "indicator": "192.168.1.100",
  "indicator_type": "ip_address",
  "threat_type": "malicious_ip",
  "is_active": true,
  "source": "Internal Detection",
  "expires_at": "2026-09-22T10:00:00Z"
}
```

**Response:** 201 Created

### List Threat Intelligence Records
```http
GET /api/v1/threat-intel/
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `indicator_type`: Filter by indicator type
- `threat_type`: Filter by threat type
- `is_active`: Filter by active status

**Response:** 200 OK (array of threat intelligence objects)

### Get Specific Threat Intelligence Record
```http
GET /api/v1/threat-intel/{threat_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK

### Update Threat Intelligence Record
```http
PUT /api/v1/threat-intel/{threat_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as creation
**Response:** 200 OK

### Delete Threat Intelligence Record
```http
DELETE /api/v1/threat-intel/{threat_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 204 No Content

## MITRE ATT&CK Endpoints

### Create MITRE Technique
```http
POST /api/v1/mitre/
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "technique_id": "T1110",
  "name": "Brute Force",
  "tactic": "credential-access",
  "description": "Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained.",
  "data_sources": ["Authentication logs", "Process monitoring"],
  "platforms": ["Windows", "Linux", "macOS"],
  "permissions_required": ["User"]
}
```

**Response:** 201 Created

### List MITRE Techniques
```http
GET /api/v1/mitre/
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `tactic`: Filter by tactic (e.g., credential-access, discovery, etc.)

**Response:** 200 OK (array of MITRE technique objects)

### Get Specific MITRE Technique
```http
GET /api/v1/mitre/{technique_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK

### Update MITRE Technique
```http
PUT /api/v1/mitre/{technique_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as creation
**Response:** 200 OK

### Delete MITRE Technique
```http
DELETE /api/v1/mitre/{technique_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 204 No Content

### Get MITRE Techniques for Detection Rule
```http
GET /api/v1/mitre/detections/{rule_id}
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK (array of MITRE technique objects associated with the rule)

## Analytics Endpoints

### Get Dashboard Statistics
```http
GET /api/v1/analytics/dashboard
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 200 OK
```json
{
  "total_events": 1450,
  "events_24h": 23,
  "total_incidents": 28,
  "open_incidents": 5,
  "critical_incidents": 2,
  "total_assets": 45,
  "critical_assets": 12,
  "events_by_type": [
    {
      "type": "failed_login",
      "count": 450
    },
    {
      "type": "successful_login",
      "count": 320
    }
  ],
  "events_by_severity": [
    {
      "severity": "low",
      "count": 500
    },
    {
      "severity": "medium",
      "count": 600
    },
    {
      "severity": "high",
      "count": 300
    },
    {
      "severity": "critical",
      "count": 50
    }
  ]
}
```

### Get Events Timeline
```http
GET /api/v1/analytics/events/timeline
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `hours`: Number of hours to look back (default: 24, min: 1, max: 168)

**Response:** 200 OK
```json
[
  {
    "hour": "2026-08-22T09:00:00Z",
    "count": 15
  },
  {
    "hour": "2026-08-22T10:00:00Z",
    "count": 23
  }
]
```

## Health Check Endpoint

### Health Check
```http
GET /api/v1/health
```

**Note:** No authentication required

**Response:** 200 OK
```json
{
  "status": "healthy"
}
```

### Root Endpoint
```http
GET /
```

**Note:** No authentication required

**Response:** 200 OK
```json
{
  "message": "AegisSOC API is running"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated",
  "headers": {
    "WWW-Authenticate": "Bearer"
  }
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- Authentication endpoints: 5 requests/minute for register, 1 request/minute for login
- General endpoints: Varies by endpoint (typically 10-100 requests/minute)
- Detection endpoints: 5 requests/minute for rule execution
- Correlation endpoints: 10 requests/minute
- AI endpoints: 10 requests/minute

When rate limit is exceeded, a 429 Too Many Requests response is returned.

## Pagination

Endpoints that return lists support pagination using `skip` and `limit` parameters:

- `skip`: Number of items to skip (for pagination)
- `limit`: Maximum number of items to return (default varies by endpoint, typically 100)

Example: `GET /api/v1/events/?skip=50&limit=25` returns events 51-75.

## Filtering

Many list endpoints support filtering via query parameters. Refer to individual endpoint specifications for available filters.

## Sorting

Default sorting is applied by most endpoints (typically by ID descending or timestamp descending). Custom sorting parameters are not currently implemented.

## Date/Time Format

All timestamps are in ISO 8601 format with UTC timezone: `YYYY-MM-DDTHH:MM:SSZ`

Example: `2026-08-22T10:00:00Z`

## Status Codes

- 200 OK: Successful request
- 201 Created: Resource successfully created
- 204 No Content: Successful deletion (no response body)
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Requested resource does not exist
- 422 Unprocessable Entity: Validation error
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Unexpected server error

## API Documentation

Interactive API documentation is available when the backend is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

These interfaces provide interactive testing capabilities and detailed schema information for all endpoints.