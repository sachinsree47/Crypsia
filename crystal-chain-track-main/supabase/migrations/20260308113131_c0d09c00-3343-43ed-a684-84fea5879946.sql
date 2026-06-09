
-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own roles
CREATE POLICY "Users can delete their own roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
