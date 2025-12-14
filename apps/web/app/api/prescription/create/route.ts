import { NextRequest, NextResponse } from "next/server";
import { buildCreatePrescriptionTx } from "@/lib/cardano/builder";
import { supabaseAdmin } from "@/lib/supabaseClient";
import type { PrescriptionDatum } from "@/lib/cardano/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      datum,
      scriptAddress,
      walletAddress,
      doctorId,
      idempotencyKey,
    } = body;

    if (!datum || !scriptAddress || !walletAddress || !doctorId || !idempotencyKey) {
      return NextResponse.json(
        { error: "Missing required fields: datum, scriptAddress, walletAddress, doctorId, idempotencyKey" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const prescriptionDatum = datum as PrescriptionDatum;

    const { data: existing } = await supabaseAdmin
      .from("prescriptions")
      .select("id")
      .eq("id", prescriptionDatum.prescriptionId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Prescription with this ID already exists" },
        { status: 409 }
      );
    }

    const unsignedTx = await buildCreatePrescriptionTx(
      prescriptionDatum,
      scriptAddress,
      walletAddress
    );

    await supabaseAdmin.from("prescriptions").insert({
      id: prescriptionDatum.prescriptionId,
      script_address: scriptAddress,
      patient_hash: prescriptionDatum.patientHash,
      drug_id: prescriptionDatum.drugId,
      drug_name: prescriptionDatum.drugId,
      quantity: prescriptionDatum.quantity,
      dosage: prescriptionDatum.dosage,
      doctor_id: doctorId,
      expiry: new Date(prescriptionDatum.expiryAt * 1000),
      refills_allowed: prescriptionDatum.refillsRemaining,
      refills_remaining: prescriptionDatum.refillsRemaining,
      status: "issued",
    });

    return NextResponse.json({
      success: true,
      unsignedTx,
      prescriptionId: prescriptionDatum.prescriptionId,
    });
  } catch (error: any) {
    console.error("Failed to create prescription transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create prescription transaction" },
      { status: 500 }
    );
  }
}

