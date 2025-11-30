-- Prescription Verification System - Database Schema Migration
-- This migration creates the tables for the Cardano-based prescription verification system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors table
-- Stores doctor information including wallet addresses for on-chain verification
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  license_id_hash TEXT UNIQUE NOT NULL, -- Hashed license ID for privacy
  wallet_address TEXT UNIQUE NOT NULL,  -- Cardano wallet address (Bech32)
  metadata JSONB, -- Additional doctor metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacies table
-- Stores pharmacy information including wallet addresses
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  wallet_address TEXT UNIQUE NOT NULL, -- Cardano wallet address (Bech32)
  metadata JSONB, -- Additional pharmacy metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
-- Mirrors on-chain prescription UTxOs for fast queries
-- The source of truth is on-chain; this is an index for performance
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY, -- Matches prescriptionId in on-chain datum
  script_address TEXT NOT NULL, -- Validator script address where UTxO is locked
  tx_hash TEXT NOT NULL, -- Transaction hash where prescription was created
  utxo_reference TEXT UNIQUE NOT NULL, -- Format: "txHash#index"
  patient_hash TEXT NOT NULL, -- Hashed patient identifier (SHA-256)
  drug_name TEXT NOT NULL, -- Drug name for display
  drug_id TEXT NOT NULL, -- Drug identifier (matches on-chain drugId)
  quantity INTEGER NOT NULL,
  dosage TEXT NOT NULL,
  doctor_id UUID REFERENCES doctors(id),
  expiry TIMESTAMP WITH TIME ZONE NOT NULL, -- Expiry timestamp
  refills_allowed INTEGER NOT NULL DEFAULT 0, -- Number of refills allowed
  refills_remaining INTEGER NOT NULL DEFAULT 0, -- Current refills remaining
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'partially_redeemed', 'expired')),
  last_event_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
-- Tracks prescription lifecycle events for notifications and audit
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Event type: 'prescription_issued', 'prescription_redeemed', 'prescription_expired', etc.
  payload JSONB NOT NULL, -- Event payload (flexible structure)
  processed BOOLEAN DEFAULT FALSE, -- Whether notification has been sent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_utxo_reference ON prescriptions(utxo_reference);
CREATE INDEX IF NOT EXISTS idx_prescriptions_script_address ON prescriptions(script_address);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_hash ON prescriptions(patient_hash);
CREATE INDEX IF NOT EXISTS idx_prescriptions_expiry ON prescriptions(expiry);
CREATE INDEX IF NOT EXISTS idx_events_prescription_id ON events(prescription_id);
CREATE INDEX IF NOT EXISTS idx_events_processed ON events(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_doctors_wallet_address ON doctors(wallet_address);
CREATE INDEX IF NOT EXISTS idx_pharmacies_wallet_address ON pharmacies(wallet_address);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies for doctors (users can view their own doctor record)
CREATE POLICY "Users can view their own doctor record" ON doctors
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own doctor record" ON doctors
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies for pharmacies (users can view their own pharmacy record)
CREATE POLICY "Users can view their own pharmacy record" ON pharmacies
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own pharmacy record" ON pharmacies
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies for prescriptions
-- Doctors can view their own prescriptions
CREATE POLICY "Doctors can view their prescriptions" ON prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors
      WHERE doctors.id = prescriptions.doctor_id
      AND doctors.id::text = auth.uid()::text
    )
  );

-- Pharmacies can view all prescriptions (for redemption)
CREATE POLICY "Pharmacies can view prescriptions" ON prescriptions
  FOR SELECT USING (true); -- Pharmacies need to view prescriptions to redeem them

-- Service role can manage all prescriptions (for indexer)
CREATE POLICY "Service role can manage prescriptions" ON prescriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for events
-- Service role can manage events (for indexer and notifications)
CREATE POLICY "Service role can manage events" ON events
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view events for their prescriptions
CREATE POLICY "Users can view events for their prescriptions" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = events.prescription_id
      AND (
        prescriptions.doctor_id::text = auth.uid()::text
        OR prescriptions.patient_hash = auth.uid()::text -- If patient hash matches user ID
      )
    )
  );

-- Comments for documentation
COMMENT ON TABLE prescriptions IS 'Index of on-chain prescription UTxOs. Source of truth is on-chain; this table provides fast queries.';
COMMENT ON COLUMN prescriptions.utxo_reference IS 'UTxO reference in format "txHash#index" for querying on-chain data';
COMMENT ON COLUMN prescriptions.patient_hash IS 'SHA-256 hash of patient identifier. Never store raw PII on-chain or in this table.';
COMMENT ON COLUMN prescriptions.status IS 'Current status: issued (UTxO exists), redeemed (UTxO spent), partially_redeemed (refills remaining), expired (past expiry)';
COMMENT ON TABLE events IS 'Event log for prescription lifecycle. Used by notifications service and audit trail.';

