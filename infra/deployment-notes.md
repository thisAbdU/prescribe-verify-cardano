# Deployment Notes

This document contains deployment instructions and notes for the prescription verification system.

## Prerequisites

- Node.js 20+
- pnpm package manager
- Cardano wallet (for testnet/mainnet)
- Blockfrost API key
- Supabase project
- Twilio account (for SMS)
- Email service (SendGrid, SMTP, etc.)

## Deployment Steps

### 1. Environment Setup

1. Copy `.env.example` to `.env` in the root directory
2. Fill in all required environment variables
3. **CRITICAL**: Never commit `.env` files to version control

### 2. Database Setup

1. Create a Supabase project
2. Run the migration:
   ```bash
   psql -h <supabase-host> -U postgres -d postgres -f infra/migrations/001_prescription_schema.sql
   ```
   Or use the Supabase dashboard SQL editor

### 3. Deploy Validator Script

1. Compile the Plutus validator:
   ```bash
   cd packages/onchain-scripts
   ./scripts/compile.sh
   ```

2. Deploy to Cardano network:
   ```bash
   ./scripts/deploy-contracts.sh
   ```

3. Copy the script address to your `.env` file:
   ```
   PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS=addr_test1...
   ```

### 4. Deploy Web Application

#### Option A: Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

#### Option B: Self-Hosted

1. Build the application:
   ```bash
   cd apps/web
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

### 5. Deploy Services

#### Indexer Service

1. Build:
   ```bash
   cd services/indexer
   pnpm build
   ```

2. Deploy to your infrastructure (AWS, GCP, etc.)
3. Set environment variables
4. Run as a background service or use PM2/systemd

#### Notifications Service

1. Build:
   ```bash
   cd services/notifications
   pnpm build
   ```

2. Deploy to your infrastructure
3. Set environment variables (Twilio, email service)
4. Run as a background service

### 6. Configure CI/CD

GitHub Actions workflows are configured in `.github/workflows/ci.yml`.

For deployment workflows, add:
- Secrets for environment variables
- Deployment steps for your infrastructure

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Validator script deployed and address configured
- [ ] Web application deployed
- [ ] Indexer service running
- [ ] Notifications service running
- [ ] SSL/TLS certificates configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] Security audit completed

## Security Considerations

1. **Private Keys**: Never store in code or environment variables
   - Use HSM/KMS for system wallets
   - Browser wallets for user signing

2. **Patient Data**: 
   - Hash all patient identifiers
   - Encrypt sensitive data in Supabase
   - Follow GDPR/HIPAA guidelines

3. **API Keys**: 
   - Rotate regularly
   - Use secret management services
   - Restrict access

4. **Network Security**:
   - Use HTTPS/TLS
   - Configure CSP headers
   - Enable rate limiting

## Monitoring

Set up monitoring for:
- Indexer service health
- Notification delivery rates
- Transaction success rates
- Database performance
- API response times

## Troubleshooting

### Indexer not syncing

- Check Blockfrost API key and rate limits
- Verify script address is correct
- Check Supabase connection

### Notifications not sending

- Verify Twilio credentials
- Check email service configuration
- Review event processing logs

### Transactions failing

- Verify wallet connection
- Check network (testnet vs mainnet)
- Review validator script logic
- Check transaction fees

