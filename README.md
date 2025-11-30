# Prescription Verification System on Cardano

A secure, blockchain-based prescription verification system built on Cardano's Extended UTxO (EUTxO) model. This system enables doctors to issue prescriptions, pharmacies to verify and redeem them, and patients to receive notifications—all while maintaining privacy and compliance with healthcare regulations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Web Application                         │
│                    (Next.js - React Frontend)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Doctors    │  │  Pharmacies  │  │   Patients   │         │
│  │   (Sign &    │  │  (Sign &     │  │  (SMS/Email  │         │
│  │   Create)    │  │   Redeem)    │  │  Notify)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘         │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cardano Blockchain                           │
│              (EUTxO Model - Single-Use UTxOs)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Prescription UTxO (Datum + Validator Script)            │  │
│  │  - Datum: Patient hash, drug info, expiry, refills       │  │
│  │  - Validator: Enforces redemption rules                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Off-Chain Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Indexer    │  │Notifications │  │   Supabase   │         │
│  │  (UTxO Sync) │  │  (SMS/Email) │  │  (Fast DB)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

- **On-Chain Verification**: Each prescription is a single-use UTxO locked at a validator script address
- **Privacy-First**: Patient identifiers are hashed before on-chain storage (no PII on-chain)
- **Browser Wallet Integration**: Doctors and pharmacies sign transactions using browser wallets (Nami, Eternl, Flint)
- **Fast Queries**: Supabase mirrors on-chain data for fast queries and UI rendering
- **Real-Time Notifications**: Patients receive SMS/email notifications for prescription events
- **Compliance Ready**: Designed with GDPR/HIPAA considerations

## Project Structure

```
/
├── apps/
│   └── web/                    # Next.js web application
│       ├── app/                # Next.js app router pages
│       ├── components/         # React components
│       ├── lib/
│       │   ├── cardano/        # Cardano transaction builders & types
│       │   └── supabaseClient.ts
│       └── services/           # Business logic services
│
├── packages/
│   └── onchain-scripts/        # Plutus validator scripts
│       ├── contract/           # Haskell/Plutus sources
│       ├── compiled/           # Compiled scripts (JSON/CBOR)
│       └── scripts/            # Compile/deploy helpers
│
├── services/
│   ├── indexer/                # UTxO watcher service
│   └── notifications/          # SMS/email notification service
│
├── infra/
│   └── migrations/             # Supabase database migrations
│
├── docker/                     # Docker compose configs
├── scripts/                    # Deployment & dev scripts
└── .github/workflows/          # CI/CD workflows
```

## Technology Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Blockchain**: Cardano (EUTxO), Plutus (validator scripts), Lucid.js (transaction building)
- **Database**: Supabase (PostgreSQL + Auth)
- **Indexer**: Blockfrost API (or Koios)
- **Notifications**: Twilio (SMS), SendGrid/SMTP (Email)
- **Wallet Integration**: Browser wallets (Nami, Eternl, Flint)

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- Cardano wallet extension (Nami, Eternl, or Flint)
- Blockfrost API key (get from [blockfrost.io](https://blockfrost.io/))
- Supabase account and project
- Twilio account (for SMS) and email service (for emails)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd prescribe-verify-cardano
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Supabase**:
   - Create a new Supabase project
   - Run the migration:
     ```bash
     # Apply migration via Supabase dashboard or CLI
     psql -h <supabase-host> -U postgres -d postgres -f infra/migrations/001_prescription_schema.sql
     ```

5. **Start development services**:
   ```bash
   ./scripts/run-local-dev.sh
   ```

   Or start individually:
   ```bash
   # Web app
   cd apps/web && pnpm dev

   # Indexer service
   cd services/indexer && pnpm dev

   # Notifications service
   cd services/notifications && pnpm dev
   ```

### Development Workflow

1. **Web App Development**:
   - Edit files in `apps/web/`
   - Hot reload available at `http://localhost:3000`

2. **On-Chain Script Development**:
   - Write Plutus validator in `packages/onchain-scripts/contract/src/Validator.hs`
   - Compile: `cd packages/onchain-scripts && ./scripts/compile.sh`
   - Deploy: `./scripts/deploy-contracts.sh`

3. **Service Development**:
   - Indexer: `cd services/indexer && pnpm dev`
   - Notifications: `cd services/notifications && pnpm dev`

## On-Chain Architecture

### Prescription Datum

Each prescription UTxO contains a datum with:

```typescript
{
  prescriptionId: string;        // UUID
  patientHash: string;           // SHA-256 hash (no PII)
  drugId: string;
  dosage: string;
  quantity: number;
  doctorPubKeyHash: string;
  issuedAt: number;              // Unix timestamp
  expiryAt: number;              // Unix timestamp
  refillsRemaining: number;
  meta?: string;                 // Optional metadata pointer
}
```

### Validator Actions

The validator accepts three redeemer actions:

1. **CREATE**: Doctor creates prescription (validated by doctor signature)
2. **REDEEM**: Pharmacy redeems prescription (validated by pharmacy signature + expiry check)
3. **REFILL**: Create new UTxO with decremented refills (if allowed)

See `packages/onchain-scripts/README.md` for detailed validator logic.

## Security & Privacy

⚠️ **CRITICAL SECURITY NOTES**:

1. **Private Keys**: NEVER store private keys in source code or environment variables
   - Doctors/pharmacies use browser wallets (signing happens in browser)
   - Server-side signing ONLY for trusted system wallets with HSM/KMS

2. **Patient Privacy**: 
   - Never store raw patient PII on-chain
   - Always hash patient identifiers (SHA-256 + salt)
   - Store sensitive data in encrypted Supabase storage

3. **Compliance**:
   - Consider GDPR/HIPAA requirements
   - On-chain data is immutable and public
   - Use encrypted off-chain storage for sensitive data

4. **Environment Variables**:
   - Never commit `.env` files
   - Use secure secret management in production
   - Rotate keys regularly

## Testing

Run tests:

```bash
# Web app tests
cd apps/web && pnpm test

# Indexer tests
cd services/indexer && pnpm test

# Notifications tests
cd services/notifications && pnpm test
```

## Deployment

### Deploy Validator Script

```bash
./scripts/deploy-contracts.sh
```

This will:
1. Compile the Plutus validator
2. Get the script address
3. Output the address for your `.env` file

### Deploy Web App

Deploy to Vercel, Netlify, or your preferred platform:

```bash
cd apps/web
pnpm build
# Deploy dist/ directory
```

### Deploy Services

Deploy indexer and notifications services to your infrastructure (AWS, GCP, etc.):

```bash
# Build services
cd services/indexer && pnpm build
cd services/notifications && pnpm build

# Run in production
NODE_ENV=production pnpm start
```

## CI/CD

GitHub Actions workflows are configured in `.github/workflows/ci.yml`:

- Lint checks
- Type checking
- Unit tests
- Build verification

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Open an issue on GitHub
- Check documentation in each package's README

## Roadmap

- [ ] Complete Plutus validator implementation
- [ ] Add comprehensive test coverage
- [ ] Implement QR code generation for prescriptions
- [ ] Add prescription refill flow
- [ ] Multi-signature support for high-value prescriptions
- [ ] Mobile app support
- [ ] Integration with pharmacy management systems

## Acknowledgments

Built with:
- [Cardano](https://cardano.org/)
- [Plutus](https://plutus.readthedocs.io/)
- [Lucid.js](https://lucid.spacebudz.io/)
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
