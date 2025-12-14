/**
 * Indexer Worker Service
 * 
 * This service monitors the Cardano blockchain for prescription-related UTxOs
 * and mirrors events into Supabase for fast queries.
 * 
 * Responsibilities:
 * 1. Poll Blockfrost/Koios for UTxOs at the prescription validator script address
 * 2. Detect new prescription creations (CREATE transactions)
 * 3. Detect prescription redemptions (REDEEM/REFILL transactions)
 * 4. Update Supabase prescriptions table with current status
 * 5. Emit events to notifications service
 * 
 * TODO: Install dependencies
 *   npm install @blockfrost/blockfrost-js @supabase/supabase-js dotenv
 */

import "dotenv/config";
import { Blockfrost } from "@blockfrost/blockfrost-js";
import { createClient } from "@supabase/supabase-js";
import { decodeDatum, type PrescriptionDatum } from "./datum";

if (!process.env.BLOCKFROST_PROJECT_ID) {
  throw new Error("BLOCKFROST_PROJECT_ID environment variable is required");
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are required");
}

if (!process.env.PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS) {
  throw new Error("PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS environment variable is required");
}

const blockfrost = new Blockfrost(
  process.env.CARDANO_NETWORK === "mainnet"
    ? "https://cardano-mainnet.blockfrost.io/api/v0"
    : "https://cardano-preview.blockfrost.io/api/v0",
  process.env.BLOCKFROST_PROJECT_ID
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SCRIPT_ADDRESS = process.env.PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "30000", 10);

/**
 * Main worker loop
 */
async function runWorker() {
  console.log("Starting indexer worker...");
  console.log(`Monitoring script address: ${SCRIPT_ADDRESS}`);

  while (true) {
    try {
      await syncPrescriptions();
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    } catch (error) {
      console.error("Error in worker loop:", error);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

/**
 * Sync prescriptions from blockchain to Supabase
 */
async function syncPrescriptions() {
  try {
    const utxos = await blockfrost.addressesUtxos(SCRIPT_ADDRESS);

    for (const utxo of utxos) {
      await processUTxO(utxo);
    }

    await checkSpentUTxOs();
  } catch (error: any) {
    if (error.status_code === 404) {
      console.log("No UTxOs found at script address (this is normal if no prescriptions exist yet)");
      return;
    }
    throw error;
  }
}

/**
 * Process a single UTxO and update Supabase
 */
async function processUTxO(utxo: any) {
  try {
    if (!utxo.inline_datum && !utxo.data_hash) {
      console.warn(`UTxO ${utxo.tx_hash}#${utxo.output_index} has no datum, skipping`);
      return;
    }

    const datumData = utxo.inline_datum || utxo.data_hash;
    const datum = decodeDatum(datumData);

    const now = Math.floor(Date.now() / 1000);
    const isExpired = datum.expiryAt < now;
    const status = isExpired ? "expired" : datum.refillsRemaining > 0 ? "partially_redeemed" : "issued";

    const { data: existing } = await supabase
      .from("prescriptions")
      .select("status")
      .eq("id", datum.prescriptionId)
      .single();

    const statusChanged = !existing || existing.status !== status;

    const { error: upsertError } = await supabase
      .from("prescriptions")
      .upsert(
        {
          id: datum.prescriptionId,
          script_address: SCRIPT_ADDRESS,
          tx_hash: utxo.tx_hash,
          utxo_reference: `${utxo.tx_hash}#${utxo.output_index}`,
          patient_hash: datum.patientHash,
          drug_id: datum.drugId,
          drug_name: datum.drugId,
          quantity: datum.quantity,
          dosage: datum.dosage,
          expiry: new Date(datum.expiryAt * 1000),
          refills_allowed: datum.refillsRemaining,
          refills_remaining: datum.refillsRemaining,
          status,
          last_event_at: new Date(),
        },
        {
          onConflict: "id",
        }
      );

    if (upsertError) {
      console.error(`Error upserting prescription ${datum.prescriptionId}:`, upsertError);
      return;
    }

    if (statusChanged && !existing) {
      await emitEvent(datum.prescriptionId, "prescription_issued", {
        utxoReference: `${utxo.tx_hash}#${utxo.output_index}`,
        status,
      });
    } else if (statusChanged) {
      await emitEvent(datum.prescriptionId, "prescription_status_changed", {
        oldStatus: existing.status,
        newStatus: status,
        utxoReference: `${utxo.tx_hash}#${utxo.output_index}`,
      });
    }
  } catch (error) {
    console.error(`Error processing UTxO ${utxo.tx_hash}#${utxo.output_index}:`, error);
  }
}

/**
 * Check for spent UTxOs and update status
 */
async function checkSpentUTxOs() {
  const { data: activePrescriptions } = await supabase
    .from("prescriptions")
    .select("id, utxo_reference, status")
    .in("status", ["issued", "partially_redeemed"]);

  if (!activePrescriptions) return;

  const utxos = await blockfrost.addressesUtxos(SCRIPT_ADDRESS);
  const activeUtxoRefs = new Set(
    utxos.map((utxo) => `${utxo.tx_hash}#${utxo.output_index}`)
  );

  for (const prescription of activePrescriptions) {
    if (!prescription.utxo_reference) continue;

    if (!activeUtxoRefs.has(prescription.utxo_reference)) {
      const { error } = await supabase
        .from("prescriptions")
        .update({
          status: "redeemed",
          last_event_at: new Date(),
        })
        .eq("id", prescription.id);

      if (!error) {
        await emitEvent(prescription.id, "prescription_redeemed", {
          utxoReference: prescription.utxo_reference,
        });
      }
    }
  }
}

/**
 * Emit event to notifications service
 */
async function emitEvent(
  prescriptionId: string,
  eventType: string,
  payload: Record<string, any>
) {
  const { error } = await supabase.from("events").insert({
    prescription_id: prescriptionId,
    type: eventType,
    payload,
    processed: false,
  });

  if (error) {
    console.error(`Error emitting event ${eventType} for prescription ${prescriptionId}:`, error);
  } else {
    console.log(`Emitted event ${eventType} for prescription ${prescriptionId}`);
  }

  if (process.env.NOTIFICATIONS_SERVICE_URL) {
    try {
      await fetch(`${process.env.NOTIFICATIONS_SERVICE_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId, eventType, payload }),
      });
    } catch (error) {
      console.warn("Failed to send event to notifications service:", error);
    }
  }
}

/**
 * Decode datum from UTxO
 */

// Start worker
if (import.meta.url === `file://${process.argv[1]}`) {
  runWorker().catch(console.error);
}

