#!/bin/bash
# Deploy Aiken contracts to Cardano network
# 
# This script compiles and deploys the prescription validator script
# to the Cardano testnet or mainnet.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ONCHAIN_DIR="$PROJECT_ROOT/packages/onchain-scripts"

echo "Deploying prescription validator contract..."

# Check environment
if [ -z "$CARDANO_NETWORK" ]; then
  echo "Error: CARDANO_NETWORK environment variable not set"
  exit 1
fi

# Determine network flag
if [ "$CARDANO_NETWORK" = "mainnet" ]; then
  NETWORK_FLAG="--mainnet"
else
  NETWORK_FLAG="--testnet-magic 1097911063"  # Preview testnet
fi

cd "$ONCHAIN_DIR"

# Compile Aiken script
echo "Compiling validator..."
./scripts/compile.sh

# Get script address
if [ -f "compiled/validator.plutus" ]; then
  SCRIPT_ADDRESS=$(cardano-cli address build \
    --payment-script-file compiled/validator.plutus \
    $NETWORK_FLAG 2>/dev/null || echo "")
  
  if [ -n "$SCRIPT_ADDRESS" ]; then
    echo ""
    echo "✓ Validator script address: $SCRIPT_ADDRESS"
    echo "Set this in your .env file: PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS=$SCRIPT_ADDRESS"
  else
    echo "⚠ Could not generate script address. Make sure cardano-cli is installed."
  fi
else
  echo "✗ Compiled validator not found. Compilation may have failed."
  exit 1
fi

echo ""
echo "Deployment complete!"
echo "Note: Scripts don't need to be 'deployed' - they're referenced by hash."
echo "The script address above is what you'll use to lock UTxOs."

