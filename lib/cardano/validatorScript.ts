export async function getValidatorScript(): Promise<string> {
  try {
    const response = await fetch("/api/validator/script");
    if (response.ok) {
      const { script } = await response.json();
      return script;
    }
    throw new Error("Failed to fetch validator script");
  } catch (error) {
    throw new Error(`Could not load validator script: ${error}`);
  }
}

