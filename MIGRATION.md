# Migration Guide

## Project Restructuring

The project has been restructured to support Cardano on-chain and off-chain development. This document explains the changes and migration steps.

## New Structure

The project now follows a monorepo structure:

```
/
├── apps/web/              # Next.js web application (moved from root)
├── packages/onchain-scripts/  # Plutus validator scripts
├── services/              # Background services (indexer, notifications)
├── infra/                 # Infrastructure configs and migrations
└── scripts/               # Deployment and dev scripts
```

## File Locations

### Moved Files

The following files have been copied to `apps/web/`:
- `app/` → `apps/web/app/`
- `components/` → `apps/web/components/`
- `lib/` → `apps/web/lib/`
- `public/` → `apps/web/public/`
- `next.config.js` → `apps/web/next.config.js`
- `tsconfig.json` → `apps/web/tsconfig.json`
- `tailwind.config.js` → `apps/web/tailwind.config.js`
- `postcss.config.js` → `apps/web/postcss.config.js`
- `components.json` → `apps/web/components.json`

### Old Files (Can Be Removed)

The following files at the root can be removed after verifying the new structure works:
- `app/` (old location)
- `components/` (old location)
- `lib/` (old location)
- `public/` (old location)
- `next.config.js` (old location)
- `tsconfig.json` (old location)
- `tailwind.config.js` (old location)
- `postcss.config.js` (old location)
- `components.json` (old location)

**Note**: Keep `database-schema.sql` at root for reference, but use `infra/migrations/001_prescription_schema.sql` for new deployments.

## New Files Added

### Cardano Integration
- `apps/web/lib/cardano/types.ts` - Type definitions
- `apps/web/lib/cardano/builder.ts` - Transaction builders
- `apps/web/lib/cardano/walletAdapter.ts` - Wallet integration
- `apps/web/services/prescriptionService.ts` - Business logic
- `apps/web/services/indexerClient.ts` - Blockchain queries

### On-Chain Scripts
- `packages/onchain-scripts/contract/src/Validator.hs` - Plutus validator
- `packages/onchain-scripts/README.md` - Validator documentation
- `packages/onchain-scripts/scripts/compile.sh` - Compilation script

### Services
- `services/indexer/src/worker.ts` - UTxO watcher
- `services/notifications/src/send.ts` - Notification sender

### Infrastructure
- `infra/migrations/001_prescription_schema.sql` - Database schema
- `infra/deployment-notes.md` - Deployment guide

### Configuration
- `pnpm-workspace.yaml` - Monorepo workspace config
- `.github/workflows/ci.yml` - CI/CD pipeline
- `docker/docker-compose.dev.yml` - Docker setup
- `scripts/deploy-contracts.sh` - Contract deployment
- `scripts/run-local-dev.sh` - Local dev runner

## Migration Steps

### 1. Update Dependencies

```bash
# Install dependencies for all workspaces
pnpm install
```

### 2. Update Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Update Imports (if needed)

If you have any absolute imports that reference the old structure, update them:

```typescript
// Old (if any)
import { something } from "@/lib/..."

// New (should work the same with path aliases)
import { something } from "@/lib/..."
```

### 4. Update Database Schema

Apply the new migration:

```bash
# Via Supabase dashboard SQL editor or CLI
psql -h <host> -U postgres -d postgres -f infra/migrations/001_prescription_schema.sql
```

### 5. Test the New Structure

```bash
# Start web app
pnpm dev:web

# Start indexer (in separate terminal)
pnpm dev:indexer

# Start notifications (in separate terminal)
pnpm dev:notifications
```

### 6. Clean Up Old Files (Optional)

After verifying everything works, you can remove the old files:

```bash
# Be careful - make sure everything works first!
rm -rf app/ components/ lib/ public/
rm next.config.js tsconfig.json tailwind.config.js postcss.config.js components.json
```

## Development Workflow Changes

### Before (Old Structure)
```bash
pnpm dev
```

### After (New Structure)
```bash
# Web app only
pnpm dev:web

# All services
./scripts/run-local-dev.sh
```

## Package Scripts

The root `package.json` now includes workspace scripts:

- `pnpm dev:web` - Start web app
- `pnpm dev:indexer` - Start indexer service
- `pnpm dev:notifications` - Start notifications service
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Test all packages

## Next Steps

1. ✅ Review the new structure
2. ✅ Install dependencies
3. ✅ Configure environment variables
4. ✅ Apply database migration
5. ✅ Test the application
6. ✅ Implement Cardano integration (see TODOs in code)
7. ✅ Deploy validator script
8. ✅ Set up services in production

## Troubleshooting

### Import Errors

If you see import errors, check:
- Path aliases in `apps/web/tsconfig.json`
- File locations (should be in `apps/web/`)

### Build Errors

If builds fail:
- Check workspace configuration in `pnpm-workspace.yaml`
- Verify all `package.json` files are correct
- Run `pnpm install` again

### Database Errors

If database operations fail:
- Verify migration was applied
- Check Supabase connection settings
- Review RLS policies

## Support

For issues or questions:
- Check `README.md` for general information
- Check `ARCHITECTURE.md` for system design
- Review code comments and TODOs
- Open an issue on GitHub

