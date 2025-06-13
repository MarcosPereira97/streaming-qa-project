# Streaming Platform Makefile
.PHONY: help dev start stop build clean test lint setup logs

# Default target
.DEFAULT_GOAL := help

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# Help command
help: ## Show this help message
	@echo "${CYAN}Streaming Platform - Available Commands${NC}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# Development
dev: ## Start all services in development mode
	@echo "${CYAN}Starting development environment...${NC}"
	docker-compose up -d
	@echo "${GREEN}Development environment started!${NC}"
	@echo "${YELLOW}View logs with: make logs${NC}"

start: ## Start all services
	@echo "${CYAN}Starting services...${NC}"
	docker-compose up -d
	@echo "${GREEN}Services started!${NC}"

stop: ## Stop all services
	@echo "${CYAN}Stopping services...${NC}"
	docker-compose down
	@echo "${GREEN}Services stopped!${NC}"

restart: stop start ## Restart all services

# Building
build: ## Build all Docker images
	@echo "${CYAN}Building Docker images...${NC}"
	docker-compose build
	@echo "${GREEN}Build complete!${NC}"

rebuild: ## Rebuild all Docker images (no cache)
	@echo "${CYAN}Rebuilding Docker images (no cache)...${NC}"
	docker-compose build --no-cache
	@echo "${GREEN}Rebuild complete!${NC}"

# Database
db-migrate: ## Run database migrations
	@echo "${CYAN}Running database migrations...${NC}"
	cd backend/services/user && npm run migrate
	@echo "${GREEN}Migrations complete!${NC}"

db-seed: ## Seed the database
	@echo "${CYAN}Seeding database...${NC}"
	cd backend/services/content && npm run seed
	@echo "${GREEN}Database seeded!${NC}"

db-reset: ## Reset database (drop, create, migrate, seed)
	@echo "${RED}Resetting database...${NC}"
	docker-compose down -v
	docker-compose up -d postgres redis
	sleep 5
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo "${GREEN}Database reset complete!${NC}"

# Testing
test: ## Run all tests
	@echo "${CYAN}Running all tests...${NC}"
	npm test
	@echo "${GREEN}Tests complete!${NC}"

test-backend: ## Run backend tests
	@echo "${CYAN}Running backend tests...${NC}"
	cd backend && npm test
	@echo "${GREEN}Backend tests complete!${NC}"

test-frontend: ## Run frontend tests
	@echo "${CYAN}Running frontend tests...${NC}"
	cd frontend && npm test
	@echo "${GREEN}Frontend tests complete!${NC}"

test-e2e: ## Run E2E tests
	@echo "${CYAN}Running E2E tests...${NC}"
	cd test && npm test
	@echo "${GREEN}E2E tests complete!${NC}"

# Code Quality
lint: ## Run linters on all code
	@echo "${CYAN}Running linters...${NC}"
	npm run lint
	@echo "${GREEN}Linting complete!${NC}"

format: ## Format all code
	@echo "${CYAN}Formatting code...${NC}"
	npx prettier --write "**/*.{js,jsx,ts,tsx,json,md,yml,yaml}"
	@echo "${GREEN}Formatting complete!${NC}"

# Setup
setup: ## Initial project setup
	@echo "${CYAN}Setting up project...${NC}"
	npm install
	npm run setup
	cp .env.example .env
	@echo "${GREEN}Setup complete!${NC}"
	@echo "${YELLOW}Don't forget to update your .env file!${NC}"

install: ## Install all dependencies
	@echo "${CYAN}Installing dependencies...${NC}"
	npm install
	npm run setup:backend
	npm run setup:frontend
	@echo "${GREEN}Dependencies installed!${NC}"

# Logs and Monitoring
logs: ## Show logs from all services
	docker-compose logs -f

logs-api: ## Show API Gateway logs
	docker-compose logs -f api-gateway

logs-user: ## Show User Service logs
	docker-compose logs -f user-service

logs-content: ## Show Content Service logs
	docker-compose logs -f content-service

logs-frontend: ## Show Frontend logs
	docker-compose logs -f frontend

# Cleanup
clean: ## Clean up containers, volumes, and images
	@echo "${RED}Cleaning up Docker resources...${NC}"
	docker-compose down -v
	docker system prune -f
	@echo "${GREEN}Cleanup complete!${NC}"

clean-all: ## Deep clean (including node_modules)
	@echo "${RED}Deep cleaning project...${NC}"
	docker-compose down -v
	docker system prune -af
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "coverage" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name "build" -type d -prune -exec rm -rf '{}' +
	@echo "${GREEN}Deep clean complete!${NC}"

# Production
prod-build: ## Build for production
	@echo "${CYAN}Building for production...${NC}"
	docker-compose -f docker-compose.prod.yml build
	@echo "${GREEN}Production build complete!${NC}"

prod-start: ## Start production environment
	@echo "${CYAN}Starting production environment...${NC}"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "${GREEN}Production environment started!${NC}"

prod-stop: ## Stop production environment
	@echo "${CYAN}Stopping production environment...${NC}"
	docker-compose -f docker-compose.prod.yml down
	@echo "${GREEN}Production environment stopped!${NC}"

# Utilities
shell-api: ## Open shell in API Gateway container
	docker-compose exec api-gateway /bin/sh

shell-user: ## Open shell in User Service container
	docker-compose exec user-service /bin/sh

shell-content: ## Open shell in Content Service container
	docker-compose exec content-service /bin/sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U streaming_user -d streaming_db

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli

status: ## Show status of all services
	@echo "${CYAN}Service Status:${NC}"
	docker-compose ps

health: ## Check health of all services
	@echo "${CYAN}Checking service health...${NC}"
	@curl -f http://localhost:3000/health > /dev/null 2>&1 && echo "${GREEN}✓ API Gateway${NC}" || echo "${RED}✗ API Gateway${NC}"
	@curl -f http://localhost:3001/health > /dev/null 2>&1 && echo "${GREEN}✓ User Service${NC}" || echo "${RED}✗ User Service${NC}"
	@curl -f http://localhost:3002/health > /dev/null 2>&1 && echo "${GREEN}✓ Content Service${NC}" || echo "${RED}✗ Content Service${NC}"
	@curl -f http://localhost > /dev/null 2>&1 && echo "${GREEN}✓ Frontend${NC}" || echo "${RED}✗ Frontend${NC}"