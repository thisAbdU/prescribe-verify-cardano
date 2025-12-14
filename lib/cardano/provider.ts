import { Lucid, Blockfrost } from "lucid-cardano";

let lucidInstance: Lucid | null = null;

export async function getProvider(): Promise<Lucid> {
  if (lucidInstance) {
    return lucidInstance;
  }

  const blockfrostProjectId =
    process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID ||
    process.env.BLOCKFROST_PROJECT_ID;

  if (!blockfrostProjectId) {
    throw new Error(
      "BLOCKFROST_PROJECT_ID or NEXT_PUBLIC_BLOCKFROST_PROJECT_ID environment variable is required"
    );
  }

  const network =
    process.env.NEXT_PUBLIC_CARDANO_NETWORK ||
    process.env.CARDANO_NETWORK ||
    "Preview";

  const blockfrostUrl =
    network === "mainnet"
      ? "https://cardano-mainnet.blockfrost.io/api/v0"
      : "https://cardano-preview.blockfrost.io/api/v0";

  const blockfrost = new Blockfrost(blockfrostUrl, blockfrostProjectId);
  const lucidNetwork = network === "mainnet" ? "Mainnet" : "Preview";
  
  lucidInstance = await Lucid.new(blockfrost, lucidNetwork as "Preview" | "Mainnet");

  return lucidInstance;
}

export async function resetProvider(): Promise<void> {
  lucidInstance = null;
}

export async function getUTxOsAtAddress(address: string): Promise<any[]> {
  const lucid = await getProvider();
  return await lucid.utxosAt(address);
}

