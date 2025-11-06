/*
  # Create Jobs Management Schema

  1. New Tables
    - `jobs_inspection`
      - `id` (uuid, primary key)
      - `vehicle_no` (text) - Vehicle registration number
      - `party_name` (text) - Owner/customer name
      - `date` (date) - Inspection date
      - `branch` (text) - Branch location
      - `status` (text) - 'in-progress', 'complete', 'hold'
      - `items` (jsonb) - Inspection items data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid) - Reference to auth.users

    - `jobs_estimate`
      - `id` (uuid, primary key)
      - `inspection_id` (uuid) - Foreign key to jobs_inspection
      - `vehicle_no` (text)
      - `party_name` (text)
      - `date` (date)
      - `branch` (text)
      - `status` (text) - 'in-progress', 'complete', 'hold'
      - `items` (jsonb) - Estimate items
      - `discount` (numeric)
      - `total` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid)

    - `jobs_jobsheet`
      - `id` (uuid, primary key)
      - `estimate_id` (uuid) - Foreign key to jobs_estimate
      - `vehicle_no` (text)
      - `party_name` (text)
      - `date` (date)
      - `branch` (text)
      - `status` (text)
      - `tasks` (jsonb) - Job sheet tasks
      - `extra_work` (jsonb) - Extra work items
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid)

    - `jobs_chalan`
      - `id` (uuid, primary key)
      - `jobsheet_id` (uuid) - Foreign key to jobs_jobsheet
      - `vehicle_no` (text)
      - `party_name` (text)
      - `date` (date)
      - `branch` (text)
      - `status` (text)
      - `items` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid)

    - `jobs_invoice`
      - `id` (uuid, primary key)
      - `chalan_id` (uuid) - Foreign key to jobs_chalan
      - `vehicle_no` (text)
      - `party_name` (text)
      - `date` (date)
      - `branch` (text)
      - `status` (text)
      - `items` (jsonb)
      - `subtotal` (numeric)
      - `gst_rate` (numeric)
      - `gst_amount` (numeric)
      - `discount` (numeric)
      - `final_total` (numeric)
      - `payment_type` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own records
    - Add policies for viewing, inserting, updating, and deleting

  3. Important Notes
    - All tables use JSONB for flexible item storage
    - Status can be: 'in-progress', 'complete', 'hold'
    - Timestamps are automatically managed
    - Each table links to the previous step for workflow tracking
*/

-- Create jobs_inspection table
CREATE TABLE IF NOT EXISTS jobs_inspection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_no text NOT NULL,
  party_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  branch text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'complete', 'hold')),
  items jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create jobs_estimate table
CREATE TABLE IF NOT EXISTS jobs_estimate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES jobs_inspection(id) ON DELETE CASCADE,
  vehicle_no text NOT NULL,
  party_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  branch text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'complete', 'hold')),
  items jsonb DEFAULT '[]'::jsonb,
  discount numeric DEFAULT 0,
  total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create jobs_jobsheet table
CREATE TABLE IF NOT EXISTS jobs_jobsheet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid REFERENCES jobs_estimate(id) ON DELETE CASCADE,
  vehicle_no text NOT NULL,
  party_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  branch text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'complete', 'hold')),
  tasks jsonb DEFAULT '[]'::jsonb,
  extra_work jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create jobs_chalan table
CREATE TABLE IF NOT EXISTS jobs_chalan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jobsheet_id uuid REFERENCES jobs_jobsheet(id) ON DELETE CASCADE,
  vehicle_no text NOT NULL,
  party_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  branch text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'complete', 'hold')),
  items jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create jobs_invoice table
CREATE TABLE IF NOT EXISTS jobs_invoice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chalan_id uuid REFERENCES jobs_chalan(id) ON DELETE CASCADE,
  vehicle_no text NOT NULL,
  party_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  branch text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'complete', 'hold')),
  items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric DEFAULT 0,
  gst_rate numeric DEFAULT 18,
  gst_amount numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  final_total numeric DEFAULT 0,
  payment_type text DEFAULT 'Full Payment',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE jobs_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_estimate ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_jobsheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_chalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_invoice ENABLE ROW LEVEL SECURITY;

-- Policies for jobs_inspection
CREATE POLICY "Users can view own inspection records"
  ON jobs_inspection FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inspection records"
  ON jobs_inspection FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inspection records"
  ON jobs_inspection FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inspection records"
  ON jobs_inspection FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for jobs_estimate
CREATE POLICY "Users can view own estimate records"
  ON jobs_estimate FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own estimate records"
  ON jobs_estimate FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own estimate records"
  ON jobs_estimate FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own estimate records"
  ON jobs_estimate FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for jobs_jobsheet
CREATE POLICY "Users can view own jobsheet records"
  ON jobs_jobsheet FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobsheet records"
  ON jobs_jobsheet FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobsheet records"
  ON jobs_jobsheet FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobsheet records"
  ON jobs_jobsheet FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for jobs_chalan
CREATE POLICY "Users can view own chalan records"
  ON jobs_chalan FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chalan records"
  ON jobs_chalan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chalan records"
  ON jobs_chalan FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chalan records"
  ON jobs_chalan FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for jobs_invoice
CREATE POLICY "Users can view own invoice records"
  ON jobs_invoice FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoice records"
  ON jobs_invoice FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoice records"
  ON jobs_invoice FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoice records"
  ON jobs_invoice FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_inspection_user_id ON jobs_inspection(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_inspection_vehicle_no ON jobs_inspection(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_jobs_inspection_date ON jobs_inspection(date);

CREATE INDEX IF NOT EXISTS idx_jobs_estimate_user_id ON jobs_estimate(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_estimate_vehicle_no ON jobs_estimate(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_jobs_estimate_inspection_id ON jobs_estimate(inspection_id);

CREATE INDEX IF NOT EXISTS idx_jobs_jobsheet_user_id ON jobs_jobsheet(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_jobsheet_vehicle_no ON jobs_jobsheet(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_jobs_jobsheet_estimate_id ON jobs_jobsheet(estimate_id);

CREATE INDEX IF NOT EXISTS idx_jobs_chalan_user_id ON jobs_chalan(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_chalan_vehicle_no ON jobs_chalan(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_jobs_chalan_jobsheet_id ON jobs_chalan(jobsheet_id);

CREATE INDEX IF NOT EXISTS idx_jobs_invoice_user_id ON jobs_invoice(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_vehicle_no ON jobs_invoice(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_chalan_id ON jobs_invoice(chalan_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_inspection_updated_at BEFORE UPDATE ON jobs_inspection FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_estimate_updated_at BEFORE UPDATE ON jobs_estimate FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_jobsheet_updated_at BEFORE UPDATE ON jobs_jobsheet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_chalan_updated_at BEFORE UPDATE ON jobs_chalan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_invoice_updated_at BEFORE UPDATE ON jobs_invoice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
