/**
 * Cardano EUTxO Types for Prescription Verification System
 * 
 * This file defines the TypeScript types that correspond to on-chain Plutus types.
 * These types must match the Plutus validator's datum and redeemer schemas.
 * 
 * SECURITY NOTE: Never put raw patient PII (Personally Identifiable Information) on-chain.
 * Always hash patient identifiers using SHA-256 + salt before including in datum.
 * Consider GDPR/HIPAA compliance - store sensitive PII in encrypted Supabase storage.
 */

/**
 * Prescription Datum - represents the state stored in a prescription UTxO
 * 
 * This datum is attached to each prescription UTxO and contains all information
 * needed to validate prescription redemption and refills.
 * 
 * @example
 * ```json
 * {
 *   "prescriptionId": "550e8400-e29b-41d4-a716-446655440000",
 *   "patientHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
 *   "drugId": "DRUG-12345",
 *   "dosage": "500mg twice daily",
 *   "quantity": 30,
 *   "doctorPubKeyHash": "abc123...",
 *   "issuedAt": 1699123456,
 *   "expiryAt": 1701715456,
 *   "refillsRemaining": 2,
 *   "meta": "optional-encrypted-metadata-pointer"
 * }
 * ```
 */
export type PrescriptionDatum = {
  /** Unique prescription identifier (UUID) - used for correlation with Supabase records */
  prescriptionId: string;
  
  /** 
   * Hashed patient identifier (SHA-256 hash of patient ID + salt)
   * NEVER store raw patient identifiers on-chain for privacy/compliance
   */
  patientHash: string;
  
  /** Drug identifier (e.g., NDC code or internal drug ID) */
  drugId: string;
  
  /** Dosage instructions as text (e.g., "500mg twice daily") */
  dosage: string;
  
  /** Quantity of medication units */
  quantity: number;
  
  /** 
   * Doctor's public key hash (or address) - used to verify doctor signature
   * This identifies who issued the prescription
   */
  doctorPubKeyHash: string;
  
  /** Unix timestamp (epoch seconds) when prescription was issued */
  issuedAt: number;
  
  /** Unix timestamp (epoch seconds) when prescription expires */
  expiryAt: number;
  
  /** Number of refills remaining (0 = no refills, single-use) */
  refillsRemaining: number;
  
  /** 
   * Optional metadata pointer (e.g., encrypted reference to Supabase record)
   * Can be used to link to off-chain encrypted patient data
   */
  meta?: string;
};

/**
 * Redeemer Actions - actions that can be performed on a prescription UTxO
 * 
 * The validator script checks the redeemer to determine what action is being performed
 * and validates it according to the business rules.
 */
export enum RedeemerAction {
  /** 
   * CREATE - Initial creation of prescription UTxO
   * Validator checks: transaction signed by doctor, datum is valid
   */
  CREATE = "CREATE",
  
  /** 
   * REDEEM - Pharmacy redeems (spends) the prescription
   * Validator checks: 
   *   - Transaction signed by authorized pharmacy OR includes patient consent proof
   *   - current_time <= expiryAt
   *   - If refillsRemaining === 0, do not create new UTxO (single-use)
   */
  REDEEM = "REDEEM",
  
  /** 
   * REFILL - Create a new prescription UTxO with decremented refills
   * Validator checks:
   *   - Only allowed when doctor signed refill instruction OR initial datum allowed refills
   *   - refillsRemaining > 0
   *   - Creates new UTxO with refillsRemaining - 1
   */
  REFILL = "REFILL",
}

/**
 * Redeemer - the action being performed on a prescription UTxO
 */
export type PrescriptionRedeemer = {
  /** The action to perform */
  action: RedeemerAction;
  
  /** 
   * Optional patient consent code (OTP) for redemption
   * Used when pharmacy needs patient verification
   */
  patientConsentCode?: string;
  
  /** 
   * Optional pharmacy identifier (public key hash)
   * Used to verify pharmacy authorization
   */
  pharmacyPubKeyHash?: string;
};

/**
 * Prescription UTxO Reference
 * 
 * Represents a reference to a specific UTxO on-chain
 */
export type PrescriptionUTxO = {
  /** Transaction hash where the UTxO was created */
  txHash: string;
  
  /** Output index within the transaction */
  outputIndex: number;
  
  /** The datum attached to this UTxO */
  datum: PrescriptionDatum;
  
  /** 
   * UTxO reference string in format "txHash#index"
   * Used for querying and building transactions
   */
  utxoRef: string;
  
  /** Current ADA value locked in this UTxO (minimum required for UTxO existence) */
  lovelace: bigint;
  
  /** Script address where this UTxO is locked */
  scriptAddress: string;
};

/**
 * Prescription Status - mirrors on-chain state in off-chain database
 */
export enum PrescriptionStatus {
  /** Prescription UTxO created and locked at script address */
  ISSUED = "issued",
  
  /** Prescription UTxO fully redeemed (spent) */
  REDEEMED = "redeemed",
  
  /** Prescription partially redeemed (if multi-use, some refills remaining) */
  PARTIALLY_REDEEMED = "partially_redeemed",
  
  /** Prescription expired (expiryAt < current_time) */
  EXPIRED = "expired",
}

/**
 * Helper type for building transactions
 */
export type PrescriptionTxInput = {
  /** The UTxO to spend */
  utxo: PrescriptionUTxO;
  
  /** The redeemer action */
  redeemer: PrescriptionRedeemer;
};

/**
 * Helper type for transaction outputs
 */
export type PrescriptionTxOutput = {
  /** The datum to attach */
  datum: PrescriptionDatum;
  
  /** ADA value to lock (minimum ~2 ADA for UTxO existence) */
  lovelace: bigint;
  
  /** Script address where to lock the UTxO */
  scriptAddress: string;
};

