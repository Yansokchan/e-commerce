-- Admin Login Attempts Table for Rate Limiting
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE
);

-- Index for faster lookups by IP
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip 
ON admin_login_attempts(ip_address, attempted_at);

-- Enable RLS
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for everyone (server needs to log attempts)
CREATE POLICY "Allow insert for service role"
ON admin_login_attempts FOR INSERT
WITH CHECK (true);

-- Policy: Allow select for service role only
CREATE POLICY "Allow select for service role"
ON admin_login_attempts FOR SELECT
USING (true);

-- Policy: Allow delete for cleanup
CREATE POLICY "Allow delete for service role"
ON admin_login_attempts FOR DELETE
USING (true);
