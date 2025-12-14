import { NextRequest, NextResponse } from "next/server";
import { buildRedeemPrescriptionTx } from "@/lib/cardano/builder";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { PrescriptionTxInput } from "@/lib/cardano/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      input,
      pharmacyWalletAddress,
      validatorScript,
      scriptAddress,
      pharmacyId,
      idempotencyKey,
      newDatum,
    } = body;

    if (!input || !pharmacyWalletAddress || !validatorScript || !scriptAddress || !pharmacyId) {
      return NextResponse.json(
        { error: "Missing required fields: input, pharmacyWalletAddress, validatorScript, scriptAddress, pharmacyId" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const txInput = input as PrescriptionTxInput;

    const { data: prescription } = await supabaseAdmin
      .from("prescriptions")
      .select("*")
      .eq("utxo_reference", txInput.utxo.utxoRef)
      .single();

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    if (prescription.status === "redeemed") {
      return NextResponse.json(
        { error: "Prescription already redeemed" },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (txInput.utxo.datum.expiryAt < now) {
      return NextResponse.json(
        { error: "Prescription has expired" },
        { status: 400 }
      );
    }

    const unsignedTx = await buildRedeemPrescriptionTx(
      txInput,
      pharmacyWalletAddress,
      validatorScript,
      scriptAddress,
      newDatum
    );

    await supabaseAdmin
      .from("prescriptions")
      .update({
        status: txInput.utxo.datum.refillsRemaining > 0 ? "partially_redeemed" : "redeemed",
        last_event_at: new Date(),
      })
      .eq("utxo_reference", txInput.utxo.utxoRef);

    await supabaseAdmin.from("events").insert({
      prescription_id: prescription.id,
      type: "prescription_redeemed",
      payload: {
        pharmacyId,
        utxoReference: txInput.utxo.utxoRef,
        idempotencyKey,
      },
    });

    return NextResponse.json({
      success: true,
      unsignedTx,
    });
  } catch (error: any) {
    console.error("Failed to create redeem transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create redeem transaction" },
      { status: 500 }
    );
  }
}

