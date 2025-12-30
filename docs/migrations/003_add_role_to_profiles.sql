-- Migration: Add role column to profiles table
-- Date: 2025-01
-- Description: Adds role field to support user roles (admin, user) for authorization

-- Add role column to profiles table with default value 'user'
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Create index on role for efficient role-based queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Update existing dev user (petermvita@hotmail.com) to admin role and set username
UPDATE profiles
SET role = 'admin', username = 'pmvita'
WHERE email = 'petermvita@hotmail.com';

-- Add comment to column for documentation
COMMENT ON COLUMN profiles.role IS 'User role: admin (full system access) or user (standard access)';

