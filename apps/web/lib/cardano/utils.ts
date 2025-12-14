import { getProvider } from "./provider";
import { fromHex, toHex } from "lucid-cardano";

export async function addressToPubKeyHash(address: string): Promise<string> {
  const lucid = await getProvider();
  const addressDetails = lucid.utils.getAddressDetails(address);
  if (!addressDetails.paymentCredential || addressDetails.paymentCredential.type !== "Key") {
    throw new Error("Address is not a PubKeyCredential address.");
  }
  return addressDetails.paymentCredential.hash;
}

export async function hashPatientId(patientId: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(patientId + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function getScriptAddressFromValidator(): Promise<string> {
  const scriptAddress = process.env.NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS;
  
  if (scriptAddress) {
    return scriptAddress;
  }

  try {
    const response = await fetch("/api/validator/address");
    if (response.ok) {
      const { address } = await response.json();
      return address;
    }
  } catch (error) {
    console.warn("Could not fetch script address from API:", error);
  }

  throw new Error(
    "NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS environment variable is required. Run ./scripts/generate-script-address.sh to generate it."
  );
}

