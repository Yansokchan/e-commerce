-- Admin OTP Codes Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_otp_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_otp_email 
ON admin_otp_codes(email, expires_at);

-- Enable RLS
ALTER TABLE admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow insert/select for authenticated users
CREATE POLICY "Allow insert for authenticated"
ON admin_otp_codes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow select for authenticated"
ON admin_otp_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow update for authenticated"
ON admin_otp_codes FOR UPDATE
TO authenticated
USING (true);

-- Clean up old codes (optional - run periodically)
-- DELETE FROM admin_otp_codes WHERE expires_at < NOW();
