#!/bin/bash
# Setup Kafka test topic
# Run this after starting the Docker container

echo "Waiting for Kafka to be ready..."
sleep 10

echo "Creating test topic..."
docker exec pulsyn-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic testdb --partitions 1 --replication-factor 1

echo "Kafka test setup complete"
