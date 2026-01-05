-- Admin Full Access Policies
-- Run this in Supabase SQL Editor
-- ⚠️ IMPORTANT: Replace 'your-admin-email@example.com' with your actual admin email!

-- ============================================
-- ORDERS - Full Admin Access
-- ============================================

-- Admin can view ALL orders
CREATE POLICY "Admin can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Admin can update ALL orders
CREATE POLICY "Admin can update all orders"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Admin can delete ALL orders
CREATE POLICY "Admin can delete all orders"
ON orders FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- ============================================
-- PRODUCTS - Full Admin Access (already exists but adding explicit)
-- ============================================

-- Admin can view all products (already public, but explicit)
-- No change needed - products are already public for SELECT

-- Admin can insert products
-- Already exists: "Enable insert for authenticated users only"

-- Admin can update products  
-- Already exists: "Enable update for authenticated users only"

-- Admin can delete products
-- Already exists: "Enable delete for authenticated users only"

-- ============================================
-- USER_PROFILES - Admin Access (if needed)
-- ============================================

-- Check if user_profiles table exists before adding policies
-- Admin can view all user profiles
CREATE POLICY "Admin can view all user profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- ============================================
-- ADMIN_LOGIN_ATTEMPTS - Full Access
-- ============================================

-- Admin can view all login attempts
CREATE POLICY "Admin can view all login attempts"
ON admin_login_attempts FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);

-- Admin can delete login attempts (clear lockouts)
CREATE POLICY "Admin can delete login attempts"
ON admin_login_attempts FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'your-admin-email@example.com'
);
