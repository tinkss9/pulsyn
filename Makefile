.PHONY: dev build test lint clean docker

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Test
test:
	npm run test

test-unit:
	npm run test:unit

test-integration:
	npm run test:integration

test-e2e:
	npm run test:e2e

test-bench:
	npm run test:bench

# Lint
lint:
	npm run lint

format:
	npm run format

typecheck:
	npm run typecheck

# Clean
clean:
	npm run clean

# Docker
docker-build:
	docker build -f docker/Dockerfile -t pulsyn:latest .

docker-run:
	docker-compose -f docker/docker-compose.yml up -d

docker-stop:
	docker-compose -f docker/docker-compose.yml down

# Database
db-reset:
	docker-compose -f docker/docker-compose.yml down -v
	docker-compose -f docker/docker-compose.yml up -d postgres mysql

# Quick start
quickstart: docker-build docker-run
	@echo "Pulsyn is running at http://localhost:3000"
	@echo "API is running at http://localhost:8080"
