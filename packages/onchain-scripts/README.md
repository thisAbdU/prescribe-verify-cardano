# On-Chain Scripts Package

This package contains the Plutus validator scripts for the prescription verification system.

## Overview

The prescription verification system uses Cardano's Extended UTxO (EUTxO) model where each prescription is represented as a single UTxO locked at a validator script address. The UTxO contains:
- **Datum**: Prescription data (patient hash, drug info, expiry, refills, etc.)
- **Validator Script**: Plutus script that enforces prescription redemption rules

## Architecture

### Datum Schema

The prescription datum (on-chain data) follows this structure:

```haskell
-- Haskell/Plutus representation
data PrescriptionDatum = PrescriptionDatum
  { prescriptionId :: BuiltinByteString  -- UUID
  , patientHash    :: BuiltinByteString  -- SHA-256 hash of patient ID
  , drugId         :: BuiltinByteString  -- Drug identifier
  , dosage         :: BuiltinByteString  -- Dosage instructions
  , quantity       :: Integer            -- Quantity
  , doctorPubKeyHash :: PubKeyHash      -- Doctor's public key hash
  , issuedAt       :: POSIXTime         -- Issue timestamp
  , expiryAt       :: POSIXTime         -- Expiry timestamp
  , refillsRemaining :: Integer         -- Number of refills remaining
  , meta           :: Maybe BuiltinByteString  -- Optional metadata pointer
  }
```

**JSON representation** (for Lucid.js consumption):
```json
{
  "prescriptionId": "550e8400-e29b-41d4-a716-446655440000",
  "patientHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "drugId": "DRUG-12345",
  "dosage": "500mg twice daily",
  "quantity": 30,
  "doctorPubKeyHash": "abc123...",
  "issuedAt": 1699123456,
  "expiryAt": 1701715456,
  "refillsRemaining": 2,
  "meta": null
}
```

### Redeemer Actions

The validator accepts three redeemer actions:

```haskell
data PrescriptionRedeemer
  = Create  -- Initial creation (validated by doctor signature)
  | Redeem  -- Pharmacy redemption (validated by pharmacy signature + expiry)
  | Refill  -- Create new UTxO with decremented refills
```

### Validator Logic (Pseudocode)

```haskell
validatePrescription :: PrescriptionDatum -> PrescriptionRedeemer -> ScriptContext -> Bool
validatePrescription datum redeemer ctx = case redeemer of
  Create -> 
    -- Check that transaction is signed by doctor
    signedBy (doctorPubKeyHash datum) ctx &&
    -- Validate datum fields (non-empty, valid timestamps, etc.)
    validateDatum datum

  Redeem ->
    -- Check expiry
    currentTime ctx <= expiryAt datum &&
    -- Check that transaction is signed by authorized pharmacy OR includes patient consent
    (signedByAuthorizedPharmacy ctx || hasPatientConsent redeemer ctx) &&
    -- If no refills remaining, do not create new UTxO (single-use)
    if refillsRemaining datum == 0
      then noOutputsCreated ctx  -- UTxO is consumed, no new UTxO created
      else True  -- Allow redemption, refill logic handled separately

  Refill ->
    -- Only allowed if refills remaining > 0
    refillsRemaining datum > 0 &&
    -- Check that transaction is signed by doctor OR initial datum allowed refills
    (signedBy (doctorPubKeyHash datum) ctx || refillsAllowedInDatum datum) &&
    -- New UTxO must have refillsRemaining - 1
    validateRefillOutput datum ctx
```

### Detailed Validator Rules

#### CREATE Action
- Transaction must be signed by the doctor (identified by `doctorPubKeyHash` in datum)
- Datum must be valid (non-empty fields, `issuedAt < expiryAt`, etc.)
- Output UTxO must be locked at the validator script address
- Output must contain the prescription datum

#### REDEEM Action
- Current time must be <= `expiryAt`
- Transaction must be signed by an authorized pharmacy OR include valid patient consent code
- If `refillsRemaining == 0`, the UTxO is consumed (single-use prescription)
- If `refillsRemaining > 0`, the UTxO can be consumed and a new one created (handled by REFILL action)

#### REFILL Action
- `refillsRemaining` must be > 0
- Transaction must be signed by the original doctor OR the initial datum must allow refills
- New UTxO must have `refillsRemaining - 1`
- All other datum fields remain the same (except `refillsRemaining`)

## Privacy & Security Considerations

⚠️ **CRITICAL**: Never store raw patient PII (Personally Identifiable Information) on-chain.

- **Patient identifiers**: Always hash using SHA-256 + salt before including in datum
- **Sensitive data**: Store encrypted metadata pointers in `meta` field, with actual data in Supabase
- **Compliance**: Consider GDPR/HIPAA requirements - on-chain data is immutable and public

## Compilation & Deployment

### Prerequisites

1. **Plutus toolchain** (if writing in Haskell):
   ```bash
   # Install Nix and use IOG's nix-shell for Plutus development
   # Or use Plutus Playground / Plutus Pioneer Program setup
   ```

2. **Cardano CLI** (for script compilation and deployment):
   ```bash
   # Install from IOG's releases or use cardano-node Docker image
   ```

### Compilation Steps

1. **Write Plutus validator** in `contract/src/Validator.hs`
2. **Compile to Plutus Core**:
   ```bash
   cabal build
   # Extract compiled script
   ```
3. **Convert to JSON/CBOR** for Lucid.js consumption:
   ```bash
   cardano-cli transaction policyid --script-file validator.plutus
   # Save compiled script to compiled/validator.plutus
   ```

### Deployment

1. **Get script address**:
   ```bash
   cardano-cli address build \
     --payment-script-file compiled/validator.plutus \
     --testnet-magic 1097911063  # or --mainnet
   ```

2. **Store script address** in environment variables:
   ```
   PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS=addr_test1...
   ```

3. **Deploy script** (optional - scripts can be referenced by hash):
   ```bash
   # Scripts don't need to be "deployed" - they're referenced by hash
   # But you may want to publish the script for transparency
   ```

## Testing

### Unit Tests

Write Plutus validator tests in `contract/test/ValidatorSpec.hs`:

```haskell
-- Example test structure
spec :: Spec
spec = do
  describe "Prescription Validator" $ do
    it "allows doctor to create prescription" $ do
      -- Test CREATE action
    it "rejects expired prescription redemption" $ do
      -- Test REDEEM action with expired datum
    it "allows refill when refills remaining > 0" $ do
      -- Test REFILL action
```

### Test Execution

```bash
cabal test
```

## Integration with Lucid.js

The compiled Plutus script (JSON/CBOR format) is consumed by Lucid.js in the web application:

```typescript
// In apps/web/lib/cardano/builder.ts
import validatorScript from "../../../packages/onchain-scripts/compiled/validator.json";

// Use in transaction building
const tx = await lucid
  .newTx()
  .collectFrom([utxo], validatorScript)
  .attachSpendingValidator(validatorScript)
  .complete();
```

## File Structure

```
packages/onchain-scripts/
├── README.md (this file)
├── contract/              # Plutus Haskell sources
│   ├── src/
│   │   └── Validator.hs   # Main validator script
│   └── test/
│       └── ValidatorSpec.hs
├── compiled/              # Compiled scripts (JSON/CBOR)
│   ├── validator.plutus
│   └── validator.json     # For Lucid.js
└── scripts/               # Helper scripts
    ├── compile.sh         # Compile Plutus script
    └── deploy.sh          # Deploy script (optional)
```

## TODO

- [ ] Write Plutus validator in Haskell
- [ ] Implement CREATE action validation
- [ ] Implement REDEEM action validation
- [ ] Implement REFILL action validation
- [ ] Add unit tests for all validator actions
- [ ] Compile script to Plutus Core
- [ ] Convert to JSON format for Lucid.js
- [ ] Test script with testnet transactions
- [ ] Document script address and policy ID
- [ ] Set up CI/CD for script compilation

## References

- [Plutus Documentation](https://plutus.readthedocs.io/)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Lucid.js Documentation](https://lucid.spacebudz.io/)

