#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}StreamFlix Setup Script${NC}"
echo "========================="

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created. Please update it with your configuration.${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p logs
mkdir -p uploads

# Build Docker images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec -T user-service npm run migrate

# Seed database
echo -e "${YELLOW}Seeding database...${NC}"
docker-compose exec -T content-service npm run seed

# Show status
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Services running at:"
echo "- Frontend: http://localhost"
echo "- API Gateway: http://localhost:3000"
echo "- API Documentation: http://localhost:3000/api-docs"
echo ""
echo "Default credentials:"
echo "- Email: demo@example.com"
echo "- Password: Demo123!"
echo ""
echo -e "${YELLOW}Run 'docker-compose logs -f' to view logs${NC}"
