export function getValidatorScriptAddress(): string {
  const scriptAddress = process.env.NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS;
  
  if (!scriptAddress) {
    throw new Error(
      "NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS environment variable is required. Run the compile script to generate it."
    );
  }

  return scriptAddress;
}

