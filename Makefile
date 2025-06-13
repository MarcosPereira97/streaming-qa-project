.PHONY: help build up down logs ps clean install dev test

# Default target
help:
	@echo "Available commands:"
	@echo "  make build    - Build all Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs"
	@echo "  make ps       - List running containers"
	@echo "  make clean    - Clean up containers and volumes"
	@echo "  make install  - Install dependencies locally"
	@echo "  make dev      - Start in development mode"
	@echo "  make test     - Run tests"

# Build Docker images
build:
	docker-compose build

# Start services
up:
	docker-compose up -d

# Stop services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# List running containers
ps:
	docker-compose ps

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Install dependencies locally
install:
	cd api-gateway && npm install
	cd services/user && npm install
	cd services/content && npm install
	cd frontend && npm install

# Development mode
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run tests
test:
	cd api-gateway && npm test
	cd services/user && npm test
	cd services/content && npm test
	cd frontend && npm test

# Database migrations
migrate:
	docker-compose exec user-service npm run migrate

# Seed database
seed:
	docker-compose exec content-service npm run seed

# Full setup
setup: build up migrate seed
	@echo "Setup complete! Application running at http://localhost"