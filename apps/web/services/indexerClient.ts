/**
 * Indexer Client
 * 
 * Client for querying Cardano blockchain data via Blockfrost or Koios.
 * This service provides functions to:
 * - Query UTxOs at script addresses
 * - Get transaction details
 * - Monitor prescription UTxOs
 * 
 * TODO: Install Blockfrost SDK
 *   npm install @blockfrost/blockfrost-js
 * 
 * Alternative: Use Koios API
 *   npm install @cardano-foundation/koios-sdk
 */

import { Blockfrost } from "@blockfrost/blockfrost-js";
import type { PrescriptionUTxO, PrescriptionDatum } from "../lib/cardano/types";
import { decodeDatum } from "../lib/cardano/builder";

function getBlockfrostClient() {
  const projectId =
    process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID ||
    process.env.BLOCKFROST_PROJECT_ID;

  if (!projectId) {
    throw new Error("BLOCKFROST_PROJECT_ID environment variable is required");
  }

  const network =
    process.env.NEXT_PUBLIC_CARDANO_NETWORK ||
    process.env.CARDANO_NETWORK ||
    "testnet";

  const blockfrost = new Blockfrost(
    network === "mainnet"
      ? "https://cardano-mainnet.blockfrost.io/api/v0"
      : "https://cardano-preview.blockfrost.io/api/v0",
    projectId
  );

  return blockfrost;
}

/**
 * Get prescription UTxO by reference
 * 
 * @param utxoReference - UTxO reference in format "txHash#index"
 * @returns Prescription UTxO with decoded datum
 */
export async function getPrescriptionUTxO(
  utxoReference: string
): Promise<PrescriptionUTxO> {
  const [txHash, outputIndex] = utxoReference.split("#");

  if (!txHash || !outputIndex) {
    throw new Error(`Invalid UTxO reference format: ${utxoReference}`);
  }

  const blockfrost = getBlockfrostClient();
  const utxo = await blockfrost.txsUtxos(txHash);
  const output = utxo.outputs[parseInt(outputIndex)];

  if (!output) {
    throw new Error(`UTxO not found: ${utxoReference}`);
  }

  if (!output.inline_datum && !output.data_hash) {
    throw new Error(`UTxO has no datum: ${utxoReference}`);
  }

  const datum = decodeDatum(output.inline_datum || output.data_hash);

  return {
    txHash,
    outputIndex: parseInt(outputIndex),
    datum: datum as PrescriptionDatum,
    utxoRef: utxoReference,
    lovelace: BigInt(output.amount[0]?.quantity || "0"),
    scriptAddress: output.address,
  };
}

/**
 * Get all UTxOs at a script address
 * 
 * @param scriptAddress - Script address to query
 * @returns Array of prescription UTxOs
 */
export async function getUTxOsAtAddress(
  scriptAddress: string
): Promise<PrescriptionUTxO[]> {
  const blockfrost = getBlockfrostClient();
  const utxos = await blockfrost.addressesUtxos(scriptAddress);

  return Promise.all(
    utxos
      .filter((utxo) => utxo.inline_datum || utxo.data_hash)
      .map(async (utxo) => {
        const datum = decodeDatum(utxo.inline_datum || utxo.data_hash || "");
        return {
          txHash: utxo.tx_hash,
          outputIndex: utxo.output_index,
          datum: datum as PrescriptionDatum,
          utxoRef: `${utxo.tx_hash}#${utxo.output_index}`,
          lovelace: BigInt(utxo.amount[0]?.quantity || "0"),
          scriptAddress,
        };
      })
  );
}

/**
 * Get transaction details
 * 
 * @param txHash - Transaction hash
 * @returns Transaction details
 */
export async function getTransaction(txHash: string): Promise<any> {
  const blockfrost = getBlockfrostClient();
  return await blockfrost.txs(txHash);
}

/**
 * Check if a UTxO has been spent
 * 
 * @param utxoReference - UTxO reference
 * @returns Whether the UTxO has been spent
 */
export async function isUTxOSpent(utxoReference: string): Promise<boolean> {
  try {
    await getPrescriptionUTxO(utxoReference);
    return false;
  } catch (error: any) {
    if (error.status_code === 404 || error.message?.includes("not found")) {
      return true;
    }
    throw error;
  }
}

/**
 * Get block height (for checking confirmation status)
 * 
 * @returns Current block height
 */
export async function getCurrentBlockHeight(): Promise<number> {
  const blockfrost = getBlockfrostClient();
  const latestBlock = await blockfrost.blocksLatest();
  return latestBlock.height;
}

