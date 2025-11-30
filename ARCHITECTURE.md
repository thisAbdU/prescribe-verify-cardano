# Architecture Documentation

## System Overview

The Prescription Verification System is built on Cardano's Extended UTxO (EUTxO) model, where each prescription is represented as a single UTxO locked at a validator script address. This ensures immutability, verifiability, and single-use guarantees.

## Component Architecture

### 1. Web Application (`apps/web/`)

**Technology**: Next.js 14, React, TypeScript

**Responsibilities**:
- User interfaces for doctors, pharmacies, and patients
- Wallet connection and transaction signing
- Transaction building using Lucid.js
- Integration with Supabase for fast data queries

**Key Modules**:
- `lib/cardano/`: Cardano transaction builders, types, and wallet adapters
- `services/`: Business logic for prescription operations
- `app/`: Next.js app router pages

### 2. On-Chain Scripts (`packages/onchain-scripts/`)

**Technology**: Plutus (Haskell), Cardano CLI

**Responsibilities**:
- Plutus validator script that enforces prescription redemption rules
- Datum and redeemer type definitions
- Script compilation and deployment

**Key Files**:
- `contract/src/Validator.hs`: Plutus validator implementation
- `compiled/`: Compiled scripts (JSON/CBOR) for Lucid.js consumption

### 3. Indexer Service (`services/indexer/`)

**Technology**: Node.js, TypeScript, Blockfrost API

**Responsibilities**:
- Monitor Cardano blockchain for prescription UTxOs
- Sync on-chain data to Supabase for fast queries
- Detect prescription lifecycle events (create, redeem, expire)
- Emit events to notifications service

**Key Features**:
- Polls Blockfrost API for UTxOs at script address
- Decodes prescription datums
- Updates Supabase prescriptions table
- Handles spent UTxOs (redemptions)

### 4. Notifications Service (`services/notifications/`)

**Technology**: Node.js, TypeScript, Twilio, Nodemailer

**Responsibilities**:
- Send SMS notifications via Twilio
- Send email notifications via SendGrid/SMTP
- Process events from indexer or API
- Template management for notifications

**Key Features**:
- Polls Supabase events table
- Sends prescription issued notifications
- Sends prescription redeemed notifications
- Handles notification failures and retries

### 5. Database (Supabase)

**Technology**: PostgreSQL, Supabase

**Responsibilities**:
- Store prescription metadata and references
- Fast queries for UI rendering
- Event log for notifications
- User authentication and authorization

**Key Tables**:
- `doctors`: Doctor information and wallet addresses
- `pharmacies`: Pharmacy information and wallet addresses
- `prescriptions`: Index of on-chain prescription UTxOs
- `events`: Event log for notifications and audit

## Data Flow

### Prescription Creation Flow

```
1. Doctor fills prescription form (Web UI)
   ↓
2. prescriptionService.createPrescription() builds transaction
   ↓
3. Wallet adapter signs transaction (browser wallet)
   ↓
4. Transaction submitted to Cardano network
   ↓
5. Indexer detects new UTxO
   ↓
6. Indexer updates Supabase prescriptions table
   ↓
7. Indexer emits "prescription_issued" event
   ↓
8. Notifications service sends SMS/email to patient
```

### Prescription Redemption Flow

```
1. Pharmacy scans prescription QR or enters UTxO reference
   ↓
2. prescriptionService.redeemPrescription() builds transaction
   ↓
3. Wallet adapter signs transaction (browser wallet)
   ↓
4. Transaction submitted to Cardano network
   ↓
5. Validator script validates redemption (expiry, signatures, etc.)
   ↓
6. UTxO is spent (consumed)
   ↓
7. Indexer detects spent UTxO
   ↓
8. Indexer updates Supabase status to "redeemed"
   ↓
9. Indexer emits "prescription_redeemed" event
   ↓
10. Notifications service sends SMS/email to patient
```

## Security Architecture

### On-Chain Security

- **Validator Script**: Enforces business rules (expiry, signatures, refills)
- **Single-Use UTxOs**: Each prescription UTxO can only be spent once
- **Immutability**: On-chain data cannot be altered after confirmation

### Off-Chain Security

- **Private Keys**: Never stored in code or environment variables
  - Browser wallets for user signing
  - HSM/KMS for system wallets (if needed)
- **Patient Privacy**: 
  - Patient identifiers hashed (SHA-256 + salt) before on-chain storage
  - Sensitive data encrypted in Supabase
- **API Security**:
  - HTTPS/TLS for all communications
  - CSP headers
  - Rate limiting
  - Authentication via Supabase Auth

## Privacy & Compliance

### GDPR/HIPAA Considerations

1. **On-Chain Data**: 
   - No raw PII stored on-chain
   - Patient identifiers hashed
   - Metadata pointers to encrypted off-chain storage

2. **Off-Chain Data**:
   - Sensitive data encrypted in Supabase
   - Access controls via RLS policies
   - Audit logging via events table

3. **Data Retention**:
   - On-chain data is immutable (cannot be deleted)
   - Off-chain data can be deleted per retention policies
   - Consider data minimization principles

## Scalability Considerations

### Current Architecture

- **Indexer**: Polls Blockfrost every 30 seconds (configurable)
- **Notifications**: Polls events table every 10 seconds
- **Database**: Supabase handles connection pooling and scaling

### Future Improvements

- **Webhooks**: Use Blockfrost webhooks instead of polling
- **Message Queue**: Use Redis/RabbitMQ for event processing
- **Caching**: Add Redis cache for frequently accessed data
- **CDN**: Use CDN for static assets
- **Load Balancing**: Multiple indexer/notification instances

## Monitoring & Observability

### Key Metrics

- Indexer sync latency
- Transaction success rates
- Notification delivery rates
- Database query performance
- API response times

### Logging

- Structured logging for all services
- Transaction hashes for traceability
- Error tracking and alerting

## Deployment Architecture

### Development

- Local development with Docker Compose
- Testnet for Cardano transactions
- Local Supabase instance (optional)

### Production

- Web app: Vercel or self-hosted
- Services: AWS/GCP/Azure
- Database: Supabase (managed PostgreSQL)
- Indexer: Background service (PM2/systemd)
- Notifications: Background service (PM2/systemd)

## Future Enhancements

- [ ] Multi-signature support for high-value prescriptions
- [ ] Prescription refill flow (on-chain)
- [ ] Mobile app support
- [ ] Integration with pharmacy management systems
- [ ] Advanced analytics and reporting
- [ ] Support for multiple Cardano networks
- [ ] Decentralized identity integration

