# AegisSOC - AI-Powered Security Operations Center

AegisSOC is an AI-powered Security Operations Center platform that ingests security events, detects suspicious behavior, correlates related events, investigates incidents using an AI Security Analyst, assigns risk scores, maps activity to MITRE ATT&CK techniques, and provides actionable remediation recommendations.

## Features

- **Real-time Event Ingestion**: Collect and process security events from various sources
- **AI-Powered Investigation**: Autonomous AI analyst that investigates incidents and provides actionable insights
- **Threat Intelligence Integration**: Real-time IOC matching and enrichment from global threat feeds
- **MITRE ATT&CK Mapping**: Automatic mapping of detected techniques to the MITRE ATT&CK framework
- **Incident Management**: Complete incident lifecycle management from detection to resolution
- **Security Analytics**: Comprehensive dashboards and reporting for security operations
- **Role-Based Access Control**: Secure authentication with ADMIN, SECURITY_ANALYST, and VIEWER roles
- **Audit Logging**: Complete audit trail of all system activities
- **Dockerized Deployment**: Easy deployment with Docker Compose

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide icons

### Backend
- Python 3.11
- FastAPI
- SQLAlchemy ORM
- PostgreSQL/SQLite
- Redis
- Apache Kafka
- Pydantic for data validation

### Infrastructure
- Docker & Docker Compose
- GitHub Actions CI/CD

## Architecture

![Architecture Diagram](docs/architecture-diagram.png)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aegis-soc
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend (if needed)
   cp frontend/.env.example frontend/.env
   ```

5. Initialize the database:
   ```bash
   cd ../backend
   python seed/seed_data.py
   ```

6. Start the development servers:
   ```bash
   # In one terminal
   cd backend
   uvicorn app.main:app --reload
   
   # In another terminal
   cd frontend
   npm run dev
   ```

### Docker Deployment

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
aegis-soc/
├── backend/                 # FastAPI backend
│   ├── app/                 # Application code
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Configuration and security
│   │   ├── db/              # Database models and session
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   ├── seed/                # Database seeding scripts
│   ├── tests/               # Backend tests
│   ├── Dockerfile           # Backend Dockerfile
│   └── requirements.txt     # Python dependencies
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js app router
│   │   ├── (routes)         # Application pages
│   │   └── components/      # Reusable components
│   ├── components/          # shadcn/ui components
│   ├── lib/                 # Utility functions
│   ├── public/              # Static assets
│   ├── styles/              # CSS styles
│   ├── Dockerfile           # Frontend Dockerfile
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
├── docs/                    # Documentation
├── .github/                 # GitHub Actions workflows
├── docker-compose.yml       # Docker Compose configuration
�└── README.md                # This file
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention through ORM
- Environment-based configuration
- Audit logging for all sensitive operations

## License

MIT License