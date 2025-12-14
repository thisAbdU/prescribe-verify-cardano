/**
 * Cardano Wallet Adapter
 * 
 * This module provides a unified interface for connecting to Cardano browser wallets
 * (Nami, Eternl, Flint, etc.) and signing transactions.
 * 
 * SECURITY WARNING: 
 * - Private keys MUST NEVER be stored in source control or server-side code
 * - All signing should happen in the browser using wallet extensions
 * - Server-side signing is ONLY for trusted system wallets (admin flows)
 *   and requires strict key management (hardware security modules, key rotation)
 * 
 * TODO: Install wallet adapter libraries
 *   npm install @cardano-foundation/cardano-connect-with-wallet
 *   OR use wallet-specific adapters for Nami/Eternl/Flint
 */

/**
 * Supported wallet providers
 */
export enum WalletProvider {
  NAMI = "nami",
  ETERNL = "eternl",
  FLINT = "flint",
  LACE = "lace",
  GERO = "gero",
}

/**
 * Wallet connection information
 */
export type WalletInfo = {
  /** Wallet provider name */
  provider: WalletProvider;
  
  /** Connected wallet address (Bech32 format) */
  address: string;
  
  /** Wallet's public key hash (for verification) */
  pubKeyHash?: string;
  
  /** Whether wallet is connected */
  isConnected: boolean;
};

/**
 * Connect to a Cardano browser wallet
 * 
 * This function prompts the user to connect their wallet via the browser extension.
 * 
 * @param provider - The wallet provider to connect to
 * @returns Wallet information including address
 * 
 * @example
 * ```typescript
 * const wallet = await connectWallet(WalletProvider.NAMI);
 * console.log("Connected to:", wallet.address);
 * ```
 */
export async function connectWallet(provider: WalletProvider): Promise<WalletInfo> {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection is only available in the browser");
  }

  let api: any;
  let address: string;

  switch (provider) {
    case WalletProvider.NAMI:
      if (!window.cardano?.nami) {
        throw new Error("Nami wallet not found. Please install Nami extension.");
      }
      api = await window.cardano.nami.enable();
      address = (await api.getUsedAddresses())[0];
      break;

    case WalletProvider.ETERNL:
      if (!window.cardano?.eternl) {
        throw new Error("Eternl wallet not found. Please install Eternl extension.");
      }
      api = await window.cardano.eternl.enable();
      address = (await api.getUsedAddresses())[0];
      break;

    case WalletProvider.FLINT:
      if (!window.cardano?.flint) {
        throw new Error("Flint wallet not found. Please install Flint extension.");
      }
      api = await window.cardano.flint.enable();
      address = (await api.getUsedAddresses())[0];
      break;

    case WalletProvider.LACE:
      if (!window.cardano?.lace) {
        throw new Error("Lace wallet not found. Please install Lace extension.");
      }
      api = await window.cardano.lace.enable();
      address = (await api.getUsedAddresses())[0];
      break;

    case WalletProvider.GERO:
      if (!window.cardano?.gero) {
        throw new Error("Gero wallet not found. Please install Gero extension.");
      }
      api = await window.cardano.gero.enable();
      address = (await api.getUsedAddresses())[0];
      break;

    default:
      throw new Error(`Unsupported wallet provider: ${provider}`);
  }

  return {
    provider,
    address,
    isConnected: true,
  };
}

/**
 * Sign a transaction using the connected wallet
 * 
 * This function sends the unsigned transaction to the wallet for signing.
 * The user will be prompted to approve the transaction in their wallet extension.
 * 
 * @param unsignedTx - Unsigned transaction (CBOR hex string)
 * @param walletInfo - Connected wallet information
 * @returns Signed transaction (CBOR hex string)
 * 
 * @example
 * ```typescript
 * const unsignedTx = await buildCreatePrescriptionTx(...);
 * const signedTx = await signTx(unsignedTx, walletInfo);
 * const txHash = await submitTx(signedTx);
 * ```
 */
export async function signTx(
  unsignedTx: string,
  walletInfo: WalletInfo
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Transaction signing is only available in the browser");
  }

  let api: any;
  let signedTx: string;

  switch (walletInfo.provider) {
    case WalletProvider.NAMI:
      if (!window.cardano?.nami) {
        throw new Error("Nami wallet not found");
      }
      api = await window.cardano.nami.enable();
      signedTx = await api.signTx(unsignedTx, true);
      break;

    case WalletProvider.ETERNL:
      if (!window.cardano?.eternl) {
        throw new Error("Eternl wallet not found");
      }
      api = await window.cardano.eternl.enable();
      signedTx = await api.signTx(unsignedTx, true);
      break;

    case WalletProvider.FLINT:
      if (!window.cardano?.flint) {
        throw new Error("Flint wallet not found");
      }
      api = await window.cardano.flint.enable();
      signedTx = await api.signTx(unsignedTx, true);
      break;

    case WalletProvider.LACE:
      if (!window.cardano?.lace) {
        throw new Error("Lace wallet not found");
      }
      api = await window.cardano.lace.enable();
      signedTx = await api.signTx(unsignedTx, true);
      break;

    case WalletProvider.GERO:
      if (!window.cardano?.gero) {
        throw new Error("Gero wallet not found");
      }
      api = await window.cardano.gero.enable();
      signedTx = await api.signTx(unsignedTx, true);
      break;

    default:
      throw new Error(`Unsupported wallet provider: ${walletInfo.provider}`);
  }

  return signedTx;
}

/**
 * Get the address from a connected wallet
 * 
 * @param walletInfo - Connected wallet information
 * @returns Wallet address (Bech32 format)
 */
export async function getAddress(walletInfo: WalletInfo): Promise<string> {
  if (typeof window === "undefined") {
    return walletInfo.address;
  }

  let api: any;

  switch (walletInfo.provider) {
    case WalletProvider.NAMI:
      if (window.cardano?.nami) {
        api = await window.cardano.nami.enable();
        const addresses = await api.getUsedAddresses();
        return addresses[0];
      }
      break;

    case WalletProvider.ETERNL:
      if (window.cardano?.eternl) {
        api = await window.cardano.eternl.enable();
        const addresses = await api.getUsedAddresses();
        return addresses[0];
      }
      break;

    case WalletProvider.FLINT:
      if (window.cardano?.flint) {
        api = await window.cardano.flint.enable();
        const addresses = await api.getUsedAddresses();
        return addresses[0];
      }
      break;

    case WalletProvider.LACE:
      if (window.cardano?.lace) {
        api = await window.cardano.lace.enable();
        const addresses = await api.getUsedAddresses();
        return addresses[0];
      }
      break;

    case WalletProvider.GERO:
      if (window.cardano?.gero) {
        api = await window.cardano.gero.enable();
        const addresses = await api.getUsedAddresses();
        return addresses[0];
      }
      break;
  }

  return walletInfo.address;
}

/**
 * Disconnect from wallet
 * 
 * @param walletInfo - Connected wallet information
 */
export async function disconnectWallet(walletInfo: WalletInfo): Promise<void> {
  // TODO: Implement wallet disconnection
  // Some wallets may not support explicit disconnection
  // In that case, just clear local state
}

/**
 * Check if a wallet provider is available
 * 
 * @param provider - Wallet provider to check
 * @returns Whether the wallet extension is installed
 */
export function isWalletAvailable(provider: WalletProvider): boolean {
  if (typeof window === "undefined") return false;

  switch (provider) {
    case WalletProvider.NAMI:
      return !!window.cardano?.nami;
    case WalletProvider.ETERNL:
      return !!window.cardano?.eternl;
    case WalletProvider.FLINT:
      return !!window.cardano?.flint;
    case WalletProvider.LACE:
      return !!window.cardano?.lace;
    case WalletProvider.GERO:
      return !!window.cardano?.gero;
    default:
      return false;
  }
}

/**
 * Get list of available wallet providers
 * 
 * @returns Array of available wallet providers
 */
export function getAvailableWallets(): WalletProvider[] {
  const providers = Object.values(WalletProvider);
  return providers.filter((provider) => isWalletAvailable(provider));
}

// ============================================================================
// SERVER-SIDE SIGNING (ADMIN ONLY - USE WITH EXTREME CAUTION)
// ============================================================================

/**
 * ⚠️ WARNING: Server-side signing should ONLY be used for trusted system wallets
 * (e.g., admin operations, automated processes). This requires:
 * 
 * 1. Private keys stored in hardware security modules (HSM) or secure key management systems
 * 2. Key rotation policies
 * 3. Audit logging of all signed transactions
 * 4. Multi-signature requirements for sensitive operations
 * 5. Strict access controls
 * 
 * DO NOT use this for doctor/pharmacy wallet signing - they should use browser wallets.
 */

/**
 * Sign transaction server-side using a system wallet
 * 
 * ⚠️ SECURITY: This function should only be used for admin/system operations.
 * Private keys must be stored securely (HSM, AWS KMS, etc.) and never in code.
 * 
 * @param unsignedTx - Unsigned transaction
 * @param privateKey - Private key (should come from secure key management, not hardcoded)
 * @returns Signed transaction
 * 
 * @example
 * ```typescript
 * // ONLY for admin/system wallets
 * const privateKey = await getPrivateKeyFromHSM(walletId);
 * const signedTx = await signTxServerSide(unsignedTx, privateKey);
 * ```
 */
export async function signTxServerSide(
  unsignedTx: string,
  privateKey: string // Should come from HSM/KMS, never hardcoded
): Promise<string> {
  // TODO: Implement server-side signing ONLY if absolutely necessary
  // 
  // ⚠️ SECURITY REQUIREMENTS:
  // 1. Private key must come from secure key management (HSM, AWS KMS, HashiCorp Vault)
  // 2. Log all signing operations for audit
  // 3. Use hardware security modules when possible
  // 4. Implement key rotation
  // 5. Require multi-signature for sensitive operations
  // 
  // Example using Lucid:
  // import { Lucid, PrivateKey } from "lucid-cardano";
  // const lucid = await Lucid.new(provider, network);
  // lucid.selectWalletFromPrivateKey(privateKey);
  // const signedTx = await lucid.signTx(unsignedTx);
  // return signedTx.toString();

  throw new Error(
    "TODO: Implement signTxServerSide ONLY if required for admin operations. " +
    "Ensure private keys are stored in HSM/KMS, not in code."
  );
}

// TypeScript declaration for window.cardano (if using wallet extensions)
declare global {
  interface Window {
    cardano?: {
      nami?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
      eternl?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
      flint?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
      lace?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
      gero?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

