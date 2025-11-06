/*
  # Add Opening Balance Columns
  
  1. Changes
    - Add opening_balance column to customers table
    - Add opening_balance column to vendors table
    - Add opening_balance column to suppliers table
    - Add opening_balance column to labours table
    - Add opening_balance_date column to track when opening balance was set
    
  2. Notes
    - opening_balance: Starting balance for the account (can be positive/negative)
    - opening_balance_date: Date when the opening balance is effective from
    - Defaults to 0 for opening_balance
    - Current balance should be calculated as: opening_balance + (sum of credits - sum of debits)
*/

-- Add opening_balance to customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'opening_balance'
  ) THEN
    ALTER TABLE customers ADD COLUMN opening_balance numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'opening_balance_date'
  ) THEN
    ALTER TABLE customers ADD COLUMN opening_balance_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add opening_balance to vendors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'opening_balance'
  ) THEN
    ALTER TABLE vendors ADD COLUMN opening_balance numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vendors' AND column_name = 'opening_balance_date'
  ) THEN
    ALTER TABLE vendors ADD COLUMN opening_balance_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add opening_balance to suppliers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'opening_balance'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN opening_balance numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'opening_balance_date'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN opening_balance_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add opening_balance to labours
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'labours' AND column_name = 'opening_balance'
  ) THEN
    ALTER TABLE labours ADD COLUMN opening_balance numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'labours' AND column_name = 'opening_balance_date'
  ) THEN
    ALTER TABLE labours ADD COLUMN opening_balance_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN customers.opening_balance IS 'Opening balance for customer account (positive = customer owes us, negative = we owe customer)';
COMMENT ON COLUMN vendors.opening_balance IS 'Opening balance for vendor account (positive = vendor owes us, negative = we owe vendor)';
COMMENT ON COLUMN suppliers.opening_balance IS 'Opening balance for supplier account (positive = supplier owes us, negative = we owe supplier)';
COMMENT ON COLUMN labours.opening_balance IS 'Opening balance for labour account (positive = labour owes us, negative = we owe labour)';
