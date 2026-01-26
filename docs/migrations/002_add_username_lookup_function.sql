-- Migration: Add username lookup function for login
-- Date: 2024-12-22
-- Description: Allows unauthenticated users to look up email and phone by username for login
--              Uses SECURITY DEFINER to bypass RLS while keeping the query secure

-- Create a function that allows looking up email and phone by username
-- This function runs with elevated privileges (SECURITY DEFINER) to bypass RLS
-- It only returns email and phone, not sensitive data
CREATE OR REPLACE FUNCTION public.get_user_credentials_by_username(username_lookup TEXT)
RETURNS TABLE (
  email TEXT,
  phone TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return email and phone for the matching username
  -- This is safe because usernames are used for login and are somewhat public
  RETURN QUERY
  SELECT 
    p.email,
    p.phone
  FROM profiles p
  WHERE p.username = username_lookup
  LIMIT 1;
END;
$$;

-- Grant execute permission to anonymous users (for login)
GRANT EXECUTE ON FUNCTION public.get_user_credentials_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_credentials_by_username(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_credentials_by_username(TEXT) IS 
'Allows unauthenticated users to look up email and phone by username for login purposes. Only returns non-sensitive data needed for authentication.';

