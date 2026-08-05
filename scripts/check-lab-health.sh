#!/bin/bash
# Pulsyn Lab Health Check

SERVICES=(
  "postgres:5432"
  "mysql:3306"
  "mongodb:27017"
  "redis:6379"
  "mssql:1433"
  "clickhouse:8123"
)

echo "🔍 Lab Health Check"
echo "===================="

UNHEALTHY=0

for service in "${SERVICES[@]}"; do
  IFS=':' read -r host port <<< "$service"

  if nc -z localhost $port 2>/dev/null; then
    echo "✅ $host:$port"
  else
    echo "❌ $host:$port (unreachable)"
    UNHEALTHY=$((UNHEALTHY + 1))
  fi
done

echo ""
if [ $UNHEALTHY -eq 0 ]; then
  echo "✅ All services healthy"
  exit 0
else
  echo "❌ $UNHEALTHY service(s) unhealthy"
  exit 1
fi
