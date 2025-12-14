import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabaseClient";
import { getPrescriptionUTxO } from "@/services/indexerClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;

    if (!prescriptionId) {
      return NextResponse.json(
        { error: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const { data: prescription, error } = await supabaseClient
      .from("prescriptions")
      .select("*")
      .eq("id", prescriptionId)
      .single();

    if (error || !prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    let onChainUTxO = null;
    try {
      if (prescription.utxo_reference) {
        onChainUTxO = await getPrescriptionUTxO(prescription.utxo_reference);
      }
    } catch (error) {
      console.warn("Failed to fetch on-chain UTxO:", error);
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = new Date(prescription.expiry).getTime() / 1000 < now;

    return NextResponse.json({
      prescription: {
        ...prescription,
        isExpired,
        onChainUTxO: onChainUTxO ? {
          txHash: onChainUTxO.txHash,
          outputIndex: onChainUTxO.outputIndex,
          utxoRef: onChainUTxO.utxoRef,
          datum: onChainUTxO.datum,
        } : null,
      },
    });
  } catch (error: any) {
    console.error("Failed to get prescription status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get prescription status" },
      { status: 500 }
    );
  }
}

