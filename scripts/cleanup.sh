#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}StreamFlix Cleanup Script${NC}"
echo "=========================="

# Confirm cleanup
read -p "This will remove all containers, volumes, and data. Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cleanup cancelled.${NC}"
    exit 1
fi

# Stop and remove containers
echo -e "${YELLOW}Stopping containers...${NC}"
docker-compose down

# Remove volumes
echo -e "${YELLOW}Removing volumes...${NC}"
docker-compose down -v

# Remove images
read -p "Remove Docker images as well? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Removing Docker images...${NC}"
    docker-compose down --rmi all
fi

# Clean up directories
echo -e "${YELLOW}Cleaning up directories...${NC}"
rm -rf logs/*
rm -rf uploads/*
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "build" -type d -prune -exec rm -rf '{}' +
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name "coverage" -type d -prune -exec rm -rf '{}' +

# Docker system prune
read -p "Run Docker system prune? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Running Docker system prune...${NC}"
    docker system prune -af
fi

echo -e "${GREEN}Cleanup complete!${NC}"
