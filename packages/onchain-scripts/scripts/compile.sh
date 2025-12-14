#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATOR_DIR="$SCRIPT_DIR/../validator"
COMPILED_DIR="$SCRIPT_DIR/../compiled"

mkdir -p "$COMPILED_DIR"

cd "$VALIDATOR_DIR"

echo "Checking Aiken project..."
aiken check

echo "Building validator..."
aiken build

echo "Extracting validator from plutus.json..."
# Extract compiledCode from plutus.json and convert hex to binary
if [ -f "plutus.json" ]; then
  python3 -c "
import json
import binascii
import sys

try:
    with open('plutus.json', 'r') as f:
        data = json.load(f)
        # Get the first validator's compiledCode (the spend validator)
        if 'validators' in data and len(data['validators']) > 0:
            hex_code = data['validators'][0]['compiledCode']
            binary = binascii.unhexlify(hex_code)
            with open('$COMPILED_DIR/validator.plutus', 'wb') as out:
                out.write(binary)
            print('✓ Validator extracted successfully')
        else:
            print('✗ No validators found in plutus.json')
            sys.exit(1)
except Exception as e:
    print(f'✗ Error extracting validator: {e}')
    sys.exit(1)
" || {
    echo "✗ Failed to extract validator from plutus.json"
    exit 1
  }
else
  echo "✗ plutus.json not found. Make sure 'aiken build' completed successfully."
  exit 1
fi

if [ -f "$COMPILED_DIR/validator.plutus" ]; then
    echo "✓ Validator compiled: $COMPILED_DIR/validator.plutus"
    
    if command -v cardano-cli &> /dev/null; then
        echo "Building script address..."
        cardano-cli address build \
            --payment-script-file "$COMPILED_DIR/validator.plutus" \
            --testnet-magic 1097911063 \
            --out-file "$COMPILED_DIR/script-address.txt" 2>/dev/null || true
        
        if [ -f "$COMPILED_DIR/script-address.txt" ]; then
            echo "✓ Script address: $(cat $COMPILED_DIR/script-address.txt)"
        fi
    fi
else
    echo "⚠ Validator compilation completed, but .plutus file not found"
    echo "Check the build output above for details"
fi

echo ""
echo "Build complete! Validator artifacts in: $COMPILED_DIR"
