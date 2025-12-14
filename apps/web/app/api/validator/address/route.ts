import { NextResponse } from "next/server";
import { readFileSync, existsSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const scriptAddress = process.env.PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS || 
                         process.env.NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS;
    
    if (scriptAddress && scriptAddress !== "addr_test1..." && !scriptAddress.includes("...")) {
      return NextResponse.json({ address: scriptAddress });
    }

    const projectRoot = join(process.cwd(), "..", "..");
    const validatorPath = join(projectRoot, "packages", "onchain-scripts", "compiled", "validator.plutus");
    
    if (!existsSync(validatorPath)) {
      return NextResponse.json(
        { 
          error: "Validator file not found. Please compile the validator first.",
          suggestion: "Run: cd packages/onchain-scripts && ./scripts/compile.sh"
        },
        { status: 404 }
      );
    }

    const network = process.env.NEXT_PUBLIC_CARDANO_NETWORK || process.env.CARDANO_NETWORK || "Preview";
    const networkFlag = network === "mainnet" ? "--mainnet" : "--testnet-magic 1097911063";
    
    const validatorBinary = readFileSync(validatorPath);
    const validatorHex = validatorBinary.toString("hex");
    
    const validatorJson = {
      type: "PlutusScriptV3",
      description: "",
      cborHex: validatorHex
    };
    
    const tempJsonPath = join(projectRoot, "packages", "onchain-scripts", "compiled", "validator.json");
    writeFileSync(tempJsonPath, JSON.stringify(validatorJson, null, 2));
    
    try {
      const dockerCommand = `docker run --rm -v "${projectRoot}:/workspace" -w /workspace ghcr.io/intersectmbo/cardano-node:10.6.1 cli address build --payment-script-file packages/onchain-scripts/compiled/validator.json ${networkFlag}`;
      
      const { stdout, stderr } = await execAsync(dockerCommand, {
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });

      if (stderr && !stderr.includes("Warning")) {
        console.error("Docker stderr:", stderr);
      }

      const address = stdout.trim();
      
      if (!address || address.length === 0) {
        throw new Error("Docker command returned empty address");
      }

      if (!address.startsWith("addr_")) {
        throw new Error(`Invalid address format: ${address}`);
      }
      
      try {
        unlinkSync(tempJsonPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      return NextResponse.json({ address });
      
    } catch (dockerError: any) {
      console.error("Failed to generate address:", dockerError?.message);
      
      return NextResponse.json(
        { 
          error: "Failed to generate address",
          details: dockerError?.message || String(dockerError),
          suggestion: "Set PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS or NEXT_PUBLIC_PRESCRIPTION_VALIDATOR_SCRIPT_ADDRESS environment variable. Docker is not available in this environment (e.g., Vercel)."
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error getting validator address:", error?.message);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to get validator address"
      },
      { status: 500 }
    );
  }
}

