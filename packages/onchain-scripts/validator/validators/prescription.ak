use aiken/collection/list
use cardano/transaction.{Transaction, OutputReference}

fn max_quantity() -> Int { 10000 }
fn max_refills() -> Int { 12 }

pub type PrescriptionDatum {
  PrescriptionDatum(
    ByteArray,
    ByteArray,
    ByteArray,
    ByteArray,
    Int,
    ByteArray,
    Int,
    Int,
    Int,
    Option<ByteArray>
  )
}

pub type PrescriptionRedeemer { Create Redeem Refill }

fn is_non_empty(bytes: ByteArray) -> Bool { bytes != #"" }

fn validate_datum_fields(
  PrescriptionDatum(
    pid,
    pat,
    drug,
    dosage,
    qty,
    _doc,
    issued,
    expiry,
    refills,
    _meta
  )
) -> Bool {
  is_non_empty(pid) &&
  is_non_empty(pat) &&
  is_non_empty(drug) &&
  is_non_empty(dosage) &&
  qty > 0 &&
  qty <= max_quantity() &&
  refills >= 0 &&
  refills <= max_refills() &&
  expiry > issued
}

fn is_signed_by(tx: Transaction, pkh: ByteArray) -> Bool {
  list.any(tx.extra_signatories, fn(s) { s == pkh })
}

fn has_other_signer(tx: Transaction, doc: ByteArray) -> Bool {
  list.any(tx.extra_signatories, fn(s) { s != doc })
}

validator prescription {
  spend(
    datum: Option<PrescriptionDatum>,
    redeemer: PrescriptionRedeemer,
    _utxo: OutputReference,
    self: Transaction
  ) -> Bool {

    expect Some(data) = datum

    when redeemer is {
      Create -> {
        expect PrescriptionDatum(
          pid,
          pat,
          drug,
          dosage,
          qty,
          doc,
          issued,
          expiry,
          refills,
          meta
        ) = data

        let signed_by_doc = is_signed_by(self, doc)
        let fields_ok = validate_datum_fields(data)
        signed_by_doc && fields_ok
      }

      Redeem -> {
        expect PrescriptionDatum(
          pid,
          pat,
          drug,
          dosage,
          qty,
          doc,
          issued,
          expiry,
          refills,
          meta
        ) = data

        let fields_ok = validate_datum_fields(data)
        let signed_by_patient = is_signed_by(self, pat)
        let has_pharm = has_other_signer(self, doc)
        fields_ok && (signed_by_patient || has_pharm)
      }

      Refill -> {
        expect PrescriptionDatum(
          pid,
          pat,
          drug,
          dosage,
          qty,
          doc,
          issued,
          expiry,
          refills,
          meta
        ) = data

        let can_refill = refills > 0
        let signed_by_doc = is_signed_by(self, doc)
        can_refill && signed_by_doc
      }
    }
  }
}
