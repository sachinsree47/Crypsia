
-- Add manufacturer_type and company_name to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS manufacturer_type text DEFAULT '',
ADD COLUMN IF NOT EXISTS company_name text DEFAULT '';
