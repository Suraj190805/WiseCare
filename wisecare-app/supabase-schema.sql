-- WiseCare Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'caregiver')),
  age INTEGER,
  pin TEXT,
  avatar TEXT,
  email TEXT,
  phone TEXT,
  conditions JSONB DEFAULT '[]',
  emergency_contacts JSONB DEFAULT '[]',
  preferred_language TEXT DEFAULT 'English',
  location JSONB,
  linked_patients JSONB DEFAULT '[]',
  relation TEXT,
  specialization TEXT,
  license_no TEXT,
  patients JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Medications
CREATE TABLE IF NOT EXISTS medications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  med_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  times JSONB DEFAULT '[]',
  color TEXT,
  instructions TEXT,
  remaining INTEGER,
  total INTEGER,
  patient_id TEXT DEFAULT 'usr_patient_001',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Med Logs
CREATE TABLE IF NOT EXISTS med_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  log_id TEXT UNIQUE NOT NULL,
  med_id TEXT NOT NULL,
  time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('taken', 'pending', 'skipped')),
  date TEXT,
  patient_id TEXT DEFAULT 'usr_patient_001',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vitals
CREATE TABLE IF NOT EXISTS vitals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL,
  heart_rate JSONB,
  blood_pressure JSONB,
  blood_sugar JSONB,
  spo2 JSONB,
  temperature JSONB,
  weight JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  alert_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger')),
  read BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'system',
  timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  apt_id TEXT UNIQUE NOT NULL,
  doctor TEXT,
  patient TEXT,
  specialty TEXT,
  date TEXT,
  time TEXT,
  type TEXT DEFAULT 'video' CHECK (type IN ('video', 'in-person')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('upcoming', 'scheduled', 'completed', 'cancelled')),
  outcome TEXT,
  source TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  msg_id TEXT UNIQUE NOT NULL,
  from_role TEXT NOT NULL,
  from_name TEXT,
  to_role TEXT NOT NULL,
  to_name TEXT,
  text TEXT NOT NULL,
  timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Activities
CREATE TABLE IF NOT EXISTS activities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  act_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  role TEXT,
  icon TEXT,
  timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Doctor Notes
CREATE TABLE IF NOT EXISTS doctor_notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  note_id TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  doctor TEXT,
  patient_id TEXT DEFAULT 'usr_patient_001',
  date TEXT,
  timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  checkin_id TEXT UNIQUE NOT NULL,
  patient_id TEXT DEFAULT 'usr_patient_001',
  date TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  slot_label TEXT,
  timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (permissive for now — open access via anon key)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE med_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon role (demo app — tighten for production)
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON med_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON doctor_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON check_ins FOR ALL USING (true) WITH CHECK (true);
