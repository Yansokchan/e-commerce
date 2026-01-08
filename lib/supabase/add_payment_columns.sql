-- Add payment-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'telegram',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bakong_md5 TEXT,
ADD COLUMN IF NOT EXISTS bakong_hash TEXT,
ADD COLUMN IF NOT EXISTS qr_string TEXT,
ADD COLUMN IF NOT EXISTS bakong_data JSONB;
