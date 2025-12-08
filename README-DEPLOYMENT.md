# PlatePlan Deployment Guide

## Docker Deployment

This guide explains how to deploy PlatePlan using Docker Compose.

### Prerequisites

- Docker and Docker Compose installed
- Dataset file at `Data/dataset.csv` (gzipped)

### Quick Start

1. **Clone the repository and navigate to the project directory**

2. **Set up environment variables** (optional)
   - The default configuration works out of the box
   - For production, update `SECRET_KEY` in `docker-compose.yml`

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Create an admin user** (optional)
   ```bash
   docker-compose exec backend python create_admin.py admin admin@example.com password123
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8081
   - PostgreSQL: localhost:5432

### Services

- **Frontend**: Next.js application (port 3001)
- **Backend**: FastAPI application (port 8081)
- **Database**: PostgreSQL (port 5432)

### Database

The PostgreSQL database is automatically initialized on first startup. Data is persisted in a Docker volume named `postgres_data`.

### Environment Variables

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (change in production!)
- `DATASET_PATH`: Path to the dataset CSV file
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

#### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Creating Admin Users

To create an admin user, run:

```bash
docker-compose exec backend python create_admin.py <username> <email> <password>
```

### Stopping Services

```bash
docker-compose down
```

To remove volumes (clears database):

```bash
docker-compose down -v
```

### Troubleshooting

1. **Database connection issues**: Ensure the database service is healthy before starting the backend
2. **CORS errors**: Update `CORS_ORIGINS` in docker-compose.yml
3. **Dataset not found**: Ensure `Data/dataset.csv` exists and is accessible

### Production Deployment

For production deployment:

1. Change `SECRET_KEY` to a secure random value
2. Update `CORS_ORIGINS` to your domain
3. Use environment variables for sensitive data
4. Set up reverse proxy (nginx) for HTTPS
5. Configure database backups
6. Use Docker secrets for passwords

