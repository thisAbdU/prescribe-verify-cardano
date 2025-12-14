/**
 * Blockchain Explorer Utilities
 * 
 * Functions to generate explorer URLs for viewing transactions and addresses
 * on Cardano blockchain explorers.
 */

export function getTransactionExplorerUrl(txHash: string, network: string = "Preview"): string {
  const isMainnet = network === "mainnet" || network === "Mainnet";
  
  if (isMainnet) {
    // Mainnet explorers
    return `https://cardanoscan.io/transaction/${txHash}`;
  } else {
    // Preview testnet explorer
    return `https://preview.cardanoscan.io/transaction/${txHash}`;
  }
}

export function getAddressExplorerUrl(address: string, network: string = "Preview"): string {
  const isMainnet = network === "mainnet" || network === "Mainnet";
  
  if (isMainnet) {
    return `https://cardanoscan.io/address/${address}`;
  } else {
    return `https://preview.cardanoscan.io/address/${address}`;
  }
}

export function getBlockfrostExplorerUrl(txHash: string, network: string = "Preview"): string {
  const isMainnet = network === "mainnet" || network === "Mainnet";
  const baseUrl = isMainnet 
    ? "https://blockfrost.io/mainnet/tx"
    : "https://blockfrost.io/preview/tx";
  
  return `${baseUrl}/${txHash}`;
}

export function getAllExplorerUrls(txHash: string, network: string = "Preview"): {
  cardanoscan: string;
  blockfrost: string;
} {
  return {
    cardanoscan: getTransactionExplorerUrl(txHash, network),
    blockfrost: getBlockfrostExplorerUrl(txHash, network)
  };
}

