# AegisSOC Architecture

This document describes the technical architecture of the AegisSOC platform, detailing the components, their interactions, and the data flow through the system.

## Overview

AegisSOC follows a layered architecture pattern separating concerns between presentation, API, business logic, and data layers. The system is designed to be modular, scalable, and maintainable.

```mermaid
graph TD
    A[Frontend Layer] --> B[API Layer]
    B --> C[Service Layer]
    C --> D[Data Layer]
    D --> E[(Database)]
    C --> F[External Services]
    F --> G[Threat Intelligence Feeds]
    F --> H[AI Provider APIs]
    I[Infrastructure] --> B
    I --> C
    I --> D
```

## Layer Breakdown

### 1. Frontend Layer

**Technology**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui

**Components**:
- **Pages**: Route-based components for different views (dashboard, incidents, etc.)
- **Components**: Reusable UI components (tables, forms, charts, modals)
- **Libraries**: API client, authentication utilities, helper functions
- **Styles**: Global CSS and Tailwind configuration

**Responsibilities**:
- User interface rendering
- Client-state management
- API communication
- User authentication handling
- Responsive design for various screen sizes

**Key Files**:
- `frontend/src/app/` - Page components and routing
- `frontend/src/components/` - Reusable UI components
- `frontend/src/lib/api.ts` - API client and auth utilities

### 2. API Layer

**Technology**: FastAPI (Python 3.11)

**Components**:
- **API Routers**: Route definition and request/response validation
- **Endpoints**: CRUD operations and business logic endpoints
- **Middleware**: Security headers, CORS, rate limiting
- **Dependencies**: Database sessions, authentication, validation

**Responsibilities**:
- HTTP request handling
- Request validation and sanitization
- Authentication and authorization
- Response formatting
- API documentation generation (OpenAPI/Swagger)

**Key Files**:
- `backend/app/main.py` - Application setup and middleware
- `backend/app/api/` - API routers and endpoint definitions
- `backend/app/core/` - Configuration, security, dependencies

### 3. Service Layer

**Technology**: Python 3.11

**Components**:
- **Detection Engine**: Rule-based threat detection
- **Correlation Engine**: Event correlation and attack chain identification
- **AI Analyst Service**: LLM-powered incident investigation
- **MITRE Mapping Service**: Technique mapping and enrichment
- **Threat Intelligence Service**: IOC enrichment and lookup
- **Asset Service**: Asset management operations
- **Incident Service**: Incident lifecycle management

**Responsibilities**:
- Business logic implementation
- Data processing and transformation
- External service integration
- Complex algorithm implementation
- Service coordination

**Key Files**:
- `backend/app/services/` - All service implementations
- `backend/app/models/` - SQLAlchemy ORM models

### 4. Data Layer

**Technology**: SQLAlchemy ORM, PostgreSQL/SQLite

**Components**:
- **Models**: Database table definitions and relationships
- **Session Management**: Database connection handling
- **Migrations**: Schema version control (Alembic)

**Responsibilities**:
- Data persistence
- Data retrieval and querying
- Transaction management
- Data integrity enforcement
- Relationship management

**Key Files**:
- `backend/app/models/` - Database models
- `backend/app/db/` - Database session and connection
- `backend/alembic/` - Migration scripts

### 5. Infrastructure Layer

**Components**:
- **Containerization**: Docker and Docker Compose
- **Caching**: Redis for temporary data storage
- **Server**: Uvicorn ASGI server for production
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Health checks, logging, error tracking

**Responsibilities**:
- Environment consistency
- Horizontal scaling facilitation
- Dependency management
- Deployment automation
- Observability and monitoring

## Data Flow

### Event Ingestion Flow
```mermaid
sequenceDiagram
    participant External as External Event Source
    participant API as API Layer
    participant Service as Service Layer
    participant DB as Data Layer
    
    External->>API: POST /events (Security Event)
    API->>Service: Validate and process event
    Service->>DB: Store event in database
    DB-->>Service: Confirmation
    Service-->>API: Event stored response
    API-->>External: 201 Created
```

### Detection Flow
```mermaid
sequenceDiagram
    participant API as API Layer
    participant Detection as Detection Engine
    participant Correlation as Correlation Engine
    participant DB as Data Layer
    participant AI as AI Analyst Service
    
    API->>Detection: POST /detection/run (Trigger detection)
    Detection->>DB: Query recent events
    DB-->>Detection: Events data
    Detection->>Detection: Apply detection rules
    Detection->>DB: Store detections and create incidents
    Detection-->>API: Detection alerts
    API->>Correlation: Correlate related events
    Correlation->>DB: Query events for correlation
    DB-->>Correlation: Events data
    Correlation->>Correlation: Apply correlation algorithms
    Correlation->>DB: Store correlations
    Correlation-->>API: Correlation results
    API->>AI: Analyze significant incidents
    AI->>DB: Query incident data
    DB-->>AI: Incident details
    AI->>AI: Apply LLM analysis
    AI-->>API: Analysis results
    API-->>User: Complete detection and analysis results
```

### Incident Investigation Flow
```mermaid
sequenceDiagram
    participant User as Security Analyst
    participant API as API Layer
    participant Incident as Incident Service
    participant AI as AI Analyst Service
    participant DB as Data Layer
    
    User->>API: GET /incidents/{id} (Get incident details)
    API->>Incident: Retrieve incident from DB
    Incident->>DB: Query incident and related data
    DB-->>Incident: Incident data, timeline, detections
    Incident-->>API: Incident details
    API-->>User: Incident information
    
    User->>API: POST /ai/incidents/{id}/analyze (Request AI analysis)
    API->>AI: Trigger incident analysis
    AI->>DB: Query incident, detections, events, timeline
    DB-->>AI: All relevant data
    AI->>AI: Prepare context for LLM
    AI->>External AI: Send to AI provider (OpenAI/Anthropic)
    External AI-->>AI: Analysis response
    AI->>DB: Store analysis results
    API-->>User: AI analysis results
```

## Security Architecture

### Authentication & Authorization
```mermaid
graph LR
    A[User Login] --> B[Auth Endpoint]
    B --> C[Validate Credentials]
    C --> D[Generate JWT]
    D --> E[Return Token]
    E --> F[Store Token Client-side]
    F --> G[Include Token in Requests]
    G --> H[Verify Token Middleware]
    H --> I[Check Permissions]
    I --> J[Allow/Deny Request]
```

**Security Features**:
- Password hashing using bcrypt
- JWT-based authentication with expiration
- Role-based access control (ADMIN, SECURITY_ANALYST, VIEWER)
- OAuth2PasswordRequestForm for login
- Environment-based secret management
- Security headers (CSP, X-Frame-Options, etc.)
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- SQL injection prevention via ORM

### Data Protection
- Environment variables for sensitive configuration
- No logging of sensitive data
- Secure password storage
- HTTPS recommended for production (TLS termination at reverse proxy)
- Database connection security

## Component Details

### Detection Engine

**Location**: `backend/app/services/detection_engine.py`

**Capabilities**:
- Brute force detection (multiple failed login attempts)
- Port scan detection (multiple port connections from single IP)
- Privilege escalation detection (suspicious privilege changes)
- Rule-based detection framework
- MITRE ATT&CK technique mapping
- Confidence scoring and risk assessment

**Data Flow**:
1. Receive events from database
2. Apply detection rules to event streams
3. Generate alerts with risk scores and evidence
4. Create detection records in database
5. Automatically create incidents for high-confidence detections
6. Link detections to MITRE techniques

### Correlation Engine

**Location**: `backend/app/services/correlation_engine.py`

**Capabilities**:
- Temporal correlation (events within time windows)
- Entity-based correlation (same IP, user, asset)
- Attack chain reconstruction
- Severity propagation and escalation
- Configurable correlation windows

**Data Flow**:
1. Query events based on time windows or filters
2. Group events by common attributes (IP, user, asset, etc.)
3. Apply temporal and logical correlation rules
4. Generate correlation records representing attack chains
5. Calculate aggregate severity and confidence
6. Store correlation results for API retrieval

### AI Analyst Service

**Location**: `backend/app/services/ai_analyst.py`

**Capabilities**:
- Incident root cause analysis
- Attack timeline reconstruction
- Impact assessment and scoping
- Remediation recommendations
- Threat hunting query assistance
- MITRE technique attribution

**Data Flow**:
1. Receive incident ID for analysis
2. Query comprehensive incident data (events, detections, timeline)
3. Prepare structured prompt for LLM
4. Send to configured AI provider (OpenAI, Anthropic, etc.)
5. Parse and structure AI response
6. Store analysis results in database
7. Return formatted analysis to API

### MITRE Mapping Service

**Location**: `backend/app/services/mitre_mapping.py`

**Capabilities**:
- Technique lookup by ID or name
- Tactic-based filtering
- Detection rule to technique mapping
- Technique relationship traversal
- ATT&CK framework version management

**Data Flow**:
1. Receive technique ID or detection rule ID
2. Query MITRE techniques table
3. For detection rules, apply predefined mappings
4. Return technique details with tactics and descriptions
5. Cache frequently accessed techniques

### Threat Intelligence Service

**Location**: `backend/app/services/threat_intel.py` (implicit in models)

**Capabilities**:
- IOC (Indicator of Compromise) storage and lookup
- Threat feed integration framework
- Indicator type classification (IP, domain, hash, etc.)
- Active/inactive threat status
- Threat actor attribution

**Data Flow**:
1. Receive threat indicators via API or feeds
2. Store in threat_intel table with metadata
3. Provide lookup capabilities for event enrichment
4. Support for bulk indicator matching
5. Automatic expiration of outdated indicators

## Database Schema

### Core Tables

```mermaid
erDiagram
    USERS ||..|| USER_ROLES : has
    USER_ROLES ||..|| ROLES : defines
    EVENTS ||..|| DETECTIONS : "triggers"
    EVENTS ||..|| CORRELATIONS : "part of"
    INCIDENTS ||..|| DETECTIONS : "contains"
    INCIDENTS ||..|| INCIDENT_TIMELINE : "has"
    INCIDENTS ||..|| INCIDENT_MITRE : "maps to"
    DETECTIONS ||..|| DETECTION_MITRE : "maps to"
    ASSETS ||..|| EVENTS : "involved in"
    THREAT_INTEL ||..|| EVENTS : "matches"
    
    USERS {
        int id PK
        string email
        string username
        string hashed_password
        string full_name
        boolean is_active
        datetime created_at
    }
    
    ROLES {
        int id PK
        string name UK
        string description
    }
    
    USER_ROLES {
        int user_id PK,FK
        int role_id PK,FK
    }
    
    EVENTS {
        int id PK
        string event_type
        string source_ip
        string destination_ip
        string user
        string asset
        string description
        string severity
        datetime timestamp
        json raw_data
    }
    
    DETECTIONS {
        int id PK
        string rule_id
        string rule_name
        string description
        string severity
        float confidence
        float risk_score
        datetime timestamp
        string status
        json evidence
        int event_ids FK
    }
    
    INCIDENTS {
        int id PK
        string title
        string description
        string severity
        string status
        float risk_score
        float confidence
        datetime timestamp
        datetime resolved_at
        json timeline
        json raw_data
    }
    
    ASSETS {
        int id PK
        string hostname
        string asset_type
        boolean is_critical
        boolean is_monitored
        string ip_address
        string mac_address
        string owner
        string location
    }
    
    THREAT_INTEL {
        int id PK
        string indicator
        string indicator_type
        string threat_type
        boolean is_active
        string source
        datetime added_at
        datetime expires_at
    }
    
    MITRE_TECHNIQUES {
        int id PK
        string technique_id UK
        string name
        string tactic
        string description
        json data_sources
        json platforms
        json permissions_required
    }
```

## External Integrations

### AI Providers
- **OpenAI**: GPT-3.5-turbo, GPT-4 models
- **Anthropic**: Claude models
- **Configured via**: `AI_PROVIDER` and `AI_API_KEY` environment variables

### Threat Intelligence Sources
- Manual API entry (current implementation)
- Planned: Automated feeds from OTX, AlienVault, VirusTotal, etc.
- Format: STIX/TAXII or custom JSON

### Deployment Targets
- **Development**: SQLite database, local Docker compose
- **Production**: PostgreSQL database, Docker compose with nginx reverse proxy
- **Cloud**: AWS ECS, Azure Container Instances, Google Cloud Run

## Communication Protocols

### Internal Communication
- **HTTP/REST**: Between frontend and backend API
- **Direct Method Calls**: Between API layer and service layer
- **Database Queries**: Between service layer and data layer

### External Communication
- **HTTPS/REST**: AI provider APIs (OpenAI, Anthropic)
- **HTTPS/REST**: Threat intelligence feeds (when implemented)
- **Database Protocols**: PostgreSQL/SQLite native protocols

## Performance Characteristics

### Latency Targets
- API Response Time: <200ms for 95% of requests
- Detection Engine: <5s for batch processing
- Correlation Engine: <10s for historical analysis
- AI Analysis: <30s per incident (dependent on provider)

### Throughput
- Event Ingestion: 1000+ events/second (hardware dependent)
- Concurrent Users: 50+ simultaneous analysts
- API Requests: 100+ requests/second

### Scaling Strategies
- **Horizontal**: Multiple API instances behind load balancer
- **Database**: Read replicas for query-heavy operations
- **Caching**: Redis for frequently accessed data
- **Async Processing**: Background workers for non-time-critical tasks

## Deployment Architecture

### Development Environment
```mermaid
graph TD
    subgraph DevBox
        A[Frontend: localhost:3000] --> B[Backend: localhost:8000]
        B --> C[(SQLite Database)]
        B --> D[Redis: localhost:6379]
    end
```

### Production Environment
```mermaid
graph TD
    subgraph Load Balancer
        E[HTTPS:443] --> F[HTTP:80]
    end
    subgraph Web Tier
        F --> G[Frontend: nginx]
        F --> H[Backend: uvicorn]
    end
    subgraph Data Tier
        H --> I[(PostgreSQL Primary)]
        H --> J[Redis Cluster]
        I --> K[(PostgreSQL Replica)]
    end
    subgraph Monitoring
        L[Prometheus] --> M[Grafana]
        N[ELK Stack] --> O[Log Aggregation]
    end
```

## Extensibility Points

### Adding New Detection Rules
1. Implement detection function in `detection_engine.py`
2. Add rule to detection rule list
3. Define MITRE technique mapping
4. Add unit tests
5. No API changes required

### Adding New Service Endpoints
1. Create new router in `backend/app/api/v1/endpoints/`
2. Implement business logic in service layer
3. Define Pydantic models for request/response
4. Add router to main API router
5. Update OpenAPI documentation automatically

### Adding New Frontend Pages
1. Create new directory in `frontend/src/app/`
2. Add `page.tsx` and optional component files
3. Use existing API client for backend communication
4. Implement UI using shadcn/ui components
5. Add to navigation if appropriate

### Adding New Database Entities
1. Create SQLAlchemy model in `backend/app/models/`
2. Generate migration with Alembic
3. Implement CRUD operations in service layer
4. Create API endpoints in API layer
5. Add frontend components as needed

## Diagrams and Visual References

### Component Interaction Diagram
```mermaid
graph LR
    subgraph Frontend[Frontend Layer]
        A[React Components] --> B[API Client]
        B --> C[Authentication]
    end
    
    subgraph Backend[Backend Layer]
        D[API Routes] --> E[Authentication Middleware]
        D --> F[Request Validation]
        D --> G[Service Layer]
        
        G --> H[Detection Engine]
        G --> I[Correlation Engine]
        G --> J[AI Analyst Service]
        G --> K[MITRE Mapping Service]
        G --> L[Threat Intel Service]
        G --> M[Asset Service]
        G --> N[Incident Service]
        
        H --> O[(Database)]
        I --> O
        J --> O
        K --> O
        L --> O
        M --> O
        N --> O
    end
    
    subgraph External[External Services]
        P[AI Provider APIs] --> J
        Q[Threat Feeds] --> L
    end
    
    A --> |HTTP/REST| D
    C --> |Local Storage| A
```

### Data Flow Diagram
```mermaid
flowchart TD
    subgraph Ingestion[Event Ingestion]
        A[External Sources] --> B[API Endpoint]
        B --> C[Validation]
        C --> D[Database Storage]
    end
    
    subgraph Processing[Threat Processing]
        D --> E[Detection Engine]
        E --> F[Create Alerts]
        E --> G[Create Incidents]
        F --> H[Database Storage]
        G --> H
        H --> I[Correlation Engine]
        I --> J[Attack Chains]
        J --> H
        G --> K[AI Analyst]
        K --> L[Analysis Results]
        L --> H
    end
    
    subgraph Presentation[Presentation Layer]
        H --> M[API Endpoints]
        M --> N[Frontend Consumption]
        N --> O[Dashboard/Views]
        O --> P[User Interaction]
        P --> Q[Incident Management]
        Q --> R[Status Updates]
        R --> S[Database Updates]
        S --> H
    end
```

## Conclusion

AegisSOC provides a robust, modular architecture that separates concerns while maintaining tight integration between components. The layered approach enables independent development, testing, and scaling of each layer. The use of modern technologies (FastAPI, Next.js, Docker) ensures the platform is maintainable and deployable across various environments.

The system is designed with extensibility in mind, allowing for easy addition of new detection rules, threat intelligence sources, and analytical capabilities. Security is built into every layer, from authentication and authorization to data protection and secure communication channels.

This architecture supports the core mission of AegisSOC: to provide security teams with actionable intelligence through automated detection, correlation, and AI-powered analysis, enabling faster and more effective incident response.