import { Data, toHex } from "lucid-cardano";

const PrescriptionDatumSchema = Data.Enum([
  Data.Object({
    prescriptionId: Data.Bytes(),
    patientHash: Data.Bytes(),
    drugId: Data.Bytes(),
    dosage: Data.Bytes(),
    quantity: Data.Integer(),
    doctorPubKeyHash: Data.Bytes(),
    issuedAt: Data.Integer(),
    expiryAt: Data.Integer(),
    refillsRemaining: Data.Integer(),
    meta: Data.Nullable(Data.Bytes()),
  }),
]);

export type PrescriptionDatum = {
  prescriptionId: string;
  patientHash: string;
  drugId: string;
  dosage: string;
  quantity: number;
  doctorPubKeyHash: string;
  issuedAt: number;
  expiryAt: number;
  refillsRemaining: number;
  meta?: string;
};

export function decodeDatum(datumData: string): PrescriptionDatum {
  const decoded = Data.from(datumData, PrescriptionDatumSchema) as any;

  return {
    prescriptionId: typeof decoded.prescriptionId === "string" ? decoded.prescriptionId : toHex(decoded.prescriptionId),
    patientHash: typeof decoded.patientHash === "string" ? decoded.patientHash : toHex(decoded.patientHash),
    drugId: typeof decoded.drugId === "string" ? decoded.drugId : toHex(decoded.drugId),
    dosage: typeof decoded.dosage === "string" ? decoded.dosage : toHex(decoded.dosage),
    quantity: Number(decoded.quantity),
    doctorPubKeyHash: typeof decoded.doctorPubKeyHash === "string" ? decoded.doctorPubKeyHash : toHex(decoded.doctorPubKeyHash),
    issuedAt: Number(decoded.issuedAt),
    expiryAt: Number(decoded.expiryAt),
    refillsRemaining: Number(decoded.refillsRemaining),
    meta: decoded.meta ? (typeof decoded.meta === "string" ? decoded.meta : toHex(decoded.meta)) : undefined,
  };
}

