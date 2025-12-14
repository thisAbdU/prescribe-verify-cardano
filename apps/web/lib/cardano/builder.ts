import { Data, fromText, toHex } from "lucid-cardano";
import { getProvider } from "./provider";
import type {
  PrescriptionDatum,
  PrescriptionRedeemer,
  PrescriptionUTxO,
  PrescriptionTxInput,
} from "./types";
import { RedeemerAction } from "./types";

/**
 * Build a transaction to create a new prescription UTxO
 * 
 * This function constructs a transaction that:
 * 1. Takes inputs from the doctor's wallet (for fees and UTxO value)
 * 2. Creates an output locked at the prescription validator script address
 * 3. Attaches the prescription datum
 * 4. Returns an unsigned transaction ready for wallet signing
 * 
 * @param datum - The prescription datum to attach to the UTxO
 * @param scriptAddress - The validator script address where UTxO will be locked
 * @param walletAddress - Doctor's wallet address (for inputs and change)
 * @param minLovelace - Minimum ADA to lock (default: 2 ADA = 2,000,000 lovelace)
 * @returns Unsigned transaction that can be signed by wallet adapter
 * 
 * @example
 * ```typescript
 * const datum: PrescriptionDatum = {
 *   prescriptionId: "550e8400-e29b-41d4-a716-446655440000",
 *   patientHash: hashPatientId(patientId, salt),
 *   drugId: "DRUG-12345",
 *   dosage: "500mg twice daily",
 *   quantity: 30,
 *   doctorPubKeyHash: doctorPubKeyHash,
 *   issuedAt: Math.floor(Date.now() / 1000),
 *   expiryAt: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
 *   refillsRemaining: 2,
 * };
 * 
 * const unsignedTx = await buildCreatePrescriptionTx(
 *   datum,
 *   validatorScriptAddress,
 *   doctorWalletAddress
 * );
 * 
 * // Sign with wallet adapter
 * const signedTx = await walletAdapter.signTx(unsignedTx);
 * // Submit to network
 * const txHash = await submitTx(signedTx);
 * ```
 */
export async function buildCreatePrescriptionTx(
  datum: PrescriptionDatum,
  scriptAddress: string,
  walletAddress: string,
  minLovelace: bigint = BigInt(2000000)
): Promise<string> {
  const lucid = await getProvider();

  if (!lucid) {
    throw new Error("Failed to initialize Lucid provider");
  }

  const encodedDatum = encodeDatum(datum);

  const tx = await lucid
    .newTx()
    .payToContract(scriptAddress, { inline: encodedDatum }, { lovelace: minLovelace })
    .complete();

  return tx.toString();
}

/**
 * Build a transaction to redeem (spend) a prescription UTxO
 * 
 * This function constructs a transaction that:
 * 1. Spends the prescription UTxO (consumes it)
 * 2. Applies the redeemer action
 * 3. If refills remaining, optionally creates a new UTxO with decremented refills
 * 4. Returns an unsigned transaction ready for wallet signing
 * 
 * @param input - The prescription UTxO to spend and redeemer action
 * @param pharmacyWalletAddress - Pharmacy's wallet address (for signing and change)
 * @param validatorScript - The compiled validator script (for spending)
 * @param newDatum - Optional new datum if creating refill UTxO (for REFILL action)
 * @returns Unsigned transaction that can be signed by wallet adapter
 * 
 * @example
 * ```typescript
 * const redeemer: PrescriptionRedeemer = {
 *   action: RedeemerAction.REDEEM,
 *   pharmacyPubKeyHash: pharmacyPubKeyHash,
 *   patientConsentCode: "123456", // OTP from patient
 * };
 * 
 * const unsignedTx = await buildRedeemPrescriptionTx(
 *   { utxo: prescriptionUTxO, redeemer },
 *   pharmacyWalletAddress,
 *   validatorScript
 * );
 * 
 * // Sign with wallet adapter
 * const signedTx = await walletAdapter.signTx(unsignedTx);
 * // Submit to network
 * const txHash = await submitTx(signedTx);
 * ```
 */
export async function buildRedeemPrescriptionTx(
  input: PrescriptionTxInput,
  pharmacyWalletAddress: string,
  validatorScript: any,
  scriptAddress: string,
  newDatum?: PrescriptionDatum,
  minLovelace: bigint = BigInt(2000000)
): Promise<string> {
  const lucid = await getProvider();

  if (!lucid) {
    throw new Error("Failed to initialize Lucid provider");
  }

  const redeemerData = encodeRedeemer(input.redeemer);

  const utxo = {
    txHash: input.utxo.txHash,
    outputIndex: input.utxo.outputIndex,
    address: input.utxo.scriptAddress,
    datum: encodeDatum(input.utxo.datum),
    assets: { lovelace: input.utxo.lovelace },
  };

  let tx = lucid
    .newTx()
    .collectFrom([utxo], redeemerData)
    .attachSpendingValidator(validatorScript);

  if (input.redeemer.action === RedeemerAction.REFILL && newDatum) {
    const newDatumEncoded = encodeDatum(newDatum);
    tx = tx.payToContract(scriptAddress, { inline: newDatumEncoded }, { lovelace: minLovelace });
  }

  const completedTx = await tx.complete();
  return completedTx.toString();
}

function encodeRedeemer(redeemer: PrescriptionRedeemer): string {
  let redeemerData: any;

  if (redeemer.action === RedeemerAction.CREATE) {
    redeemerData = { action: "CREATE" };
  } else if (redeemer.action === RedeemerAction.REDEEM) {
    redeemerData = {
      action: "REDEEM",
      pharmacyPubKeyHash: redeemer.pharmacyPubKeyHash
        ? (redeemer.pharmacyPubKeyHash.startsWith("0x") ? redeemer.pharmacyPubKeyHash.slice(2) : redeemer.pharmacyPubKeyHash)
        : null,
      patientConsentCode: redeemer.patientConsentCode ? fromText(redeemer.patientConsentCode) : null,
    };
  } else if (redeemer.action === RedeemerAction.REFILL) {
    redeemerData = { action: "REFILL" };
  } else {
    throw new Error(`Unknown redeemer action: ${redeemer.action}`);
  }

  return Data.to(redeemerData, RedeemerSchema);
}

export async function submitTx(signedTxHex: string): Promise<string> {
  const lucid = await getProvider();

  if (!lucid) {
    throw new Error("Failed to initialize Lucid provider");
  }

  const txHash = await (lucid as any).submitTx(signedTxHex);
  await lucid.awaitTx(txHash);
  return txHash;
}

const PrescriptionDatumSchema = Data.Object({
  prescriptionId: Data.Bytes(),
  patientHash: Data.Bytes(),
  drugId: Data.Bytes(),
  dosage: Data.Bytes(),
  quantity: Data.Integer(),
  doctorPubKeyHash: Data.Bytes(),
  issuedAt: Data.Integer(),
  expiryAt: Data.Integer(),
  refillsRemaining: Data.Integer(),
  meta: Data.Nullable(Data.Bytes()),
});

const RedeemerSchema = Data.Enum([
  Data.Object({ action: Data.Literal("CREATE") }),
  Data.Object({ action: Data.Literal("REDEEM"), pharmacyPubKeyHash: Data.Nullable(Data.Bytes()), patientConsentCode: Data.Nullable(Data.Bytes()) }),
  Data.Object({ action: Data.Literal("REFILL") }),
]);

export function encodeDatum(datum: PrescriptionDatum): string {
  const hexToBytes = (hex: string): string => {
    const cleaned = hex.startsWith("0x") ? hex.slice(2) : hex;
    return cleaned;
  };

  const datumData = {
    prescriptionId: fromText(datum.prescriptionId),
    patientHash: hexToBytes(datum.patientHash),
    drugId: fromText(datum.drugId),
    dosage: fromText(datum.dosage),
    quantity: BigInt(datum.quantity),
    doctorPubKeyHash: hexToBytes(datum.doctorPubKeyHash),
    issuedAt: BigInt(datum.issuedAt),
    expiryAt: BigInt(datum.expiryAt),
    refillsRemaining: BigInt(datum.refillsRemaining),
    meta: datum.meta ? fromText(datum.meta) : null,
  };

  return Data.to(datumData as any, PrescriptionDatumSchema) as string;
}

export function decodeDatum(datumData: string): PrescriptionDatum {
  const decoded = Data.from(datumData, PrescriptionDatumSchema) as any;

  return {
    prescriptionId: typeof decoded.prescriptionId === "string" ? decoded.prescriptionId : toHex(decoded.prescriptionId),
    patientHash: typeof decoded.patientHash === "string" ? decoded.patientHash : toHex(decoded.patientHash),
    drugId: typeof decoded.drugId === "string" ? decoded.drugId : toHex(decoded.drugId),
    dosage: typeof decoded.dosage === "string" ? decoded.dosage : toHex(decoded.dosage),
    quantity: Number(decoded.quantity),
    doctorPubKeyHash: typeof decoded.doctorPubKeyHash === "string" ? decoded.doctorPubKeyHash : toHex(decoded.doctorPubKeyHash),
    issuedAt: Number(decoded.issuedAt),
    expiryAt: Number(decoded.expiryAt),
    refillsRemaining: Number(decoded.refillsRemaining),
    meta: decoded.meta ? (typeof decoded.meta === "string" ? decoded.meta : toHex(decoded.meta)) : undefined,
  };
}

