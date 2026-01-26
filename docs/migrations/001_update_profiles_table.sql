-- Migration: Update profiles table to support username, first_name, last_name, and phone
-- Date: 2024
-- Description: Adds missing fields for user registration and login functionality

-- Add missing columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index on username for efficient lookups during login
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Create index on email if it doesn't exist (for faster lookups)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Add INSERT policy so users can create their own profile during signup
-- This allows authenticated users to insert their profile when they sign up
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: The existing SELECT and UPDATE policies are already in place
-- SELECT: Users can read their own profile
-- UPDATE: Users can update their own profile

-- Optional: Add a trigger to automatically create a profile when a user signs up
-- This is a backup in case the application code doesn't create the profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

