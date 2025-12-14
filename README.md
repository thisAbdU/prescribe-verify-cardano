# Prescription Verification System on Cardano

A secure, blockchain-based prescription verification system built on Cardano's Extended UTxO (EUTxO) model. Enables doctors to issue prescriptions, pharmacies to verify and redeem them, and patients to receive notifications—all while maintaining privacy and compliance.

## Features

- **On-Chain Verification**: Each prescription is a single-use UTxO locked at a validator script address
- **Privacy-First**: Patient identifiers are hashed before on-chain storage
- **Browser Wallet Integration**: Sign transactions using browser wallets (Nami, Eternl, Flint)
- **Fast Queries**: Supabase mirrors on-chain data for fast queries
- **Real-Time Notifications**: SMS/email notifications for prescription events

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Cardano (EUTxO), Aiken (validator scripts), Lucid.js
- **Database**: Supabase (PostgreSQL)
- **Indexer**: Blockfrost API
- **Notifications**: Twilio (SMS), SendGrid/SMTP (Email)

## Project Structure

```
/
├── apps/web/              # Next.js web application
├── packages/onchain-scripts/  # Aiken validator scripts
├── services/
│   ├── indexer/          # UTxO watcher service
│   └── notifications/    # SMS/email service
└── infra/migrations/     # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- Blockfrost API key
- Supabase account
- Cardano wallet extension (Nami, Eternl, or Flint)

### Installation

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd prescribe-verify-cardano
   pnpm install
   ```

2. **Set up environment variables**:
   Create `apps/web/.env.local`:
   ```bash
   NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
   NEXT_PUBLIC_CARDANO_NETWORK=Preview
   NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS=addr_test1...
   NEXT_PUBLIC_PATIENT_ID_SALT=your-secret-salt
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up Supabase**:
   - Create a Supabase project
   - Run migration: `infra/migrations/001_prescription_schema.sql`

4. **Compile validator**:
   ```bash
   cd packages/onchain-scripts
   ./scripts/compile.sh
   ```

5. **Start development**:
   ```bash
   pnpm dev
   ```

## On-Chain Architecture

### Prescription Datum

Each prescription UTxO contains:
- `prescriptionId`: UUID
- `patientHash`: SHA-256 hash (no PII)
- `drugId`, `dosage`, `quantity`
- `doctorPubKeyHash`
- `issuedAt`, `expiryAt`
- `refillsRemaining`

### Validator Actions

1. **CREATE**: Doctor creates prescription
2. **REDEEM**: Pharmacy redeems prescription
3. **REFILL**: Create new UTxO with decremented refills

## Deployment

### Vercel

1. Connect repository to Vercel
2. Set root directory to `apps/web`
3. Add all environment variables in Vercel dashboard
4. Deploy

### Validator Script

```bash
cd packages/onchain-scripts
./scripts/compile.sh
./scripts/generate-script-address.sh
```

Add the generated address to environment variables.

## Security

- **Never store private keys** in code or environment variables
- **Hash patient identifiers** before on-chain storage
- **Use encrypted storage** for sensitive data
- **Never commit** `.env` files
