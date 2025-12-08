# backend/Dockerfile

FROM python:3.10.8

RUN mkdir -p app/backend

# Build context is ./FastAPI_Backend, so copy files relative to here
COPY requirements.txt app/backend/requirements.txt
COPY . app/backend

WORKDIR /app/backend

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Wait for database to be ready
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy wait script
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

EXPOSE 8080

CMD ["/wait-for-postgres.sh", "db", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]