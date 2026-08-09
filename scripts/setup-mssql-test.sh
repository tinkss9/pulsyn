#!/bin/bash
# Setup MSSQL test tables
# Run this after starting the Docker container

echo "Waiting for MSSQL to be ready..."
sleep 10

echo "Creating test tables..."
docker exec -i pulsyn-mssql-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Test@12345' -i /dev/stdin < scripts/setup-mssql-test.sql

echo "MSSQL test setup complete"
