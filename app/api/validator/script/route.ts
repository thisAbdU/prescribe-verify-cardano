import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const validatorPath = join(
      process.cwd(),
      "packages",
      "onchain-scripts",
      "compiled",
      "validator.plutus"
    );

    try {
      const validatorScript = readFileSync(validatorPath);
      const scriptHex = validatorScript.toString("hex");
      return NextResponse.json({ script: scriptHex });
    } catch (error) {
      return NextResponse.json(
        { error: "Could not read validator.plutus file. Please compile the validator first." },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get validator script" },
      { status: 500 }
    );
  }
}

