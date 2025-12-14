#!/bin/bash
set -e

# Install dependencies from repo root
cd ../..
pnpm install --frozen-lockfile

# Return to apps/web and build
cd apps/web
next build

