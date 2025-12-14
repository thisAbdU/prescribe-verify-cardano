#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VALIDATOR_FILE="$PROJECT_ROOT/packages/onchain-scripts/compiled/validator.plutus"
COMPILED_DIR="$PROJECT_ROOT/packages/onchain-scripts/compiled"

if [ ! -f "$VALIDATOR_FILE" ]; then
  echo "Error: validator.plutus not found. Please compile the validator first:"
  echo "  cd packages/onchain-scripts && ./scripts/compile.sh"
  exit 1
fi

NETWORK="${CARDANO_NETWORK:-testnet}"

if [ "$NETWORK" = "mainnet" ]; then
  NETWORK_FLAG="--mainnet"
else
  NETWORK_FLAG="--testnet-magic 1097911063"
fi

# Try cardano-cli first, then Docker
if command -v cardano-cli &> /dev/null; then
  echo "Using local cardano-cli..."
  SCRIPT_ADDRESS=$(cardano-cli address build \
    --payment-script-file "$VALIDATOR_FILE" \
    $NETWORK_FLAG)
else
  echo "cardano-cli not found. Using Docker..."
  
  # Use the Docker image you just pulled
  SCRIPT_ADDRESS=$(docker run --rm \
    -v "$PROJECT_ROOT:/workspace" \
    -w /workspace \
    ghcr.io/intersectmbo/cardano-node:10.6.1 \
    cardano-cli address build \
      --payment-script-file "packages/onchain-scripts/compiled/validator.plutus" \
      $NETWORK_FLAG)
fi

echo ""
echo "✓ Script address generated:"
echo "  $SCRIPT_ADDRESS"
echo ""

# Save to file
mkdir -p "$COMPILED_DIR"
echo "$SCRIPT_ADDRESS" > "$COMPILED_DIR/script-address.txt"
echo "✓ Saved to: $COMPILED_DIR/script-address.txt"
echo ""

echo "Add this to your .env file:"
echo "  PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS=$SCRIPT_ADDRESS"
echo "  NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS=$SCRIPT_ADDRESS"
echo ""