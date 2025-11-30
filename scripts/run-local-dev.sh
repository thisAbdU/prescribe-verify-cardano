#!/bin/bash
# Run local development environment
# 
# This script starts all development services:
# - Next.js web app
# - Indexer service
# - Notifications service
# - Docker services (if configured)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting local development environment..."

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  echo "Warning: .env file not found. Copy .env.example to .env and configure it."
fi

# Start Docker services (if configured)
if [ -f "$PROJECT_ROOT/docker/docker-compose.dev.yml" ]; then
  echo "Starting Docker services..."
  docker-compose -f "$PROJECT_ROOT/docker/docker-compose.dev.yml" up -d
fi

# Start services in parallel using background processes
echo "Starting services..."

# Start web app
cd "$PROJECT_ROOT/apps/web"
pnpm dev &
WEB_PID=$!

# Start indexer service
cd "$PROJECT_ROOT/services/indexer"
pnpm dev &
INDEXER_PID=$!

# Start notifications service
cd "$PROJECT_ROOT/services/notifications"
pnpm dev &
NOTIFICATIONS_PID=$!

echo "Services started:"
echo "  - Web app: http://localhost:3000 (PID: $WEB_PID)"
echo "  - Indexer: running (PID: $INDEXER_PID)"
echo "  - Notifications: running (PID: $NOTIFICATIONS_PID)"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $WEB_PID $INDEXER_PID $NOTIFICATIONS_PID 2>/dev/null; exit" INT TERM
wait

