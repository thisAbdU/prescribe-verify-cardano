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
  // TODO: Implement wallet connection
  // 
  // Example for Nami:
  // if (provider === WalletProvider.NAMI) {
  //   if (typeof window !== "undefined" && window.cardano?.nami) {
  //     const api = await window.cardano.nami.enable();
  //     const address = (await api.getUsedAddresses())[0];
  //     return {
  //       provider,
  //       address,
  //       isConnected: true,
  //     };
  //   }
  //   throw new Error("Nami wallet not found. Please install Nami extension.");
  // }
  // 
  // Example for Eternl:
  // if (provider === WalletProvider.ETERNL) {
  //   if (typeof window !== "undefined" && window.cardano?.eternl) {
  //     const api = await window.cardano.eternl.enable();
  //     const address = (await api.getUsedAddresses())[0];
  //     return {
  //       provider,
  //       address,
  //       isConnected: true,
  //     };
  //   }
  //   throw new Error("Eternl wallet not found. Please install Eternl extension.");
  // }
  // 
  // Similar for other wallets...

  throw new Error(`TODO: Implement connectWallet for ${provider}`);
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
  // TODO: Implement transaction signing
  // 
  // Example for Nami:
  // if (walletInfo.provider === WalletProvider.NAMI) {
  //   if (typeof window !== "undefined" && window.cardano?.nami) {
  //     const api = await window.cardano.nami.enable();
  //     const signedTx = await api.signTx(unsignedTx, true); // true = partial sign
  //     return signedTx;
  //   }
  // }
  // 
  // Similar for other wallets...

  throw new Error(`TODO: Implement signTx for ${walletInfo.provider}`);
}

/**
 * Get the address from a connected wallet
 * 
 * @param walletInfo - Connected wallet information
 * @returns Wallet address (Bech32 format)
 */
export async function getAddress(walletInfo: WalletInfo): Promise<string> {
  // TODO: Implement get address
  // 
  // if (typeof window !== "undefined" && window.cardano?.[walletInfo.provider]) {
  //   const api = await window.cardano[walletInfo.provider].enable();
  //   const addresses = await api.getUsedAddresses();
  //   return addresses[0];
  // }

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
  // TODO: Check if wallet is available
  // 
  // if (typeof window === "undefined") return false;
  // 
  // switch (provider) {
  //   case WalletProvider.NAMI:
  //     return !!window.cardano?.nami;
  //   case WalletProvider.ETERNL:
  //     return !!window.cardano?.eternl;
  //   case WalletProvider.FLINT:
  //     return !!window.cardano?.flint;
  //   default:
  //     return false;
  // }

  return false;
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

