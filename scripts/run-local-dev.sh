#!/bin/bash
# Run local development services
# 
# This script starts all development services for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting local development services..."

cd "$PROJECT_ROOT"

if [ ! -f ".env" ]; then
  echo "Warning: .env file not found. Please copy .env.example to .env and configure it."
  exit 1
fi

echo "Starting web application..."
pnpm dev:web &
WEB_PID=$!

echo "Starting indexer service..."
pnpm dev:indexer &
INDEXER_PID=$!

echo "Starting notifications service..."
pnpm dev:notifications &
NOTIFICATIONS_PID=$!

echo ""
echo "All services started!"
echo "  - Web app: http://localhost:3000 (PID: $WEB_PID)"
echo "  - Indexer: running (PID: $INDEXER_PID)"
echo "  - Notifications: running (PID: $NOTIFICATIONS_PID)"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $WEB_PID $INDEXER_PID $NOTIFICATIONS_PID 2>/dev/null; exit" INT TERM

wait
