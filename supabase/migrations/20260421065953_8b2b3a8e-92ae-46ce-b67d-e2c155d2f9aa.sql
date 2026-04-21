-- 1) Remove user-facing INSERT/UPDATE on subscriptions; only SELECT remains for users.
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- 2) Prevent users from changing their own subscription_tier on profiles.
-- Keep the existing UPDATE policy (auth.uid() = user_id), but enforce column immutability via a trigger.
CREATE OR REPLACE FUNCTION public.prevent_profile_tier_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow subscription_tier to change when invoked outside of a normal user session
  -- (i.e. by a SECURITY DEFINER server function or service role). For ordinary authenticated
  -- updates, force the value to remain the same as the existing row.
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    -- auth.role() returns 'authenticated' for logged-in users; service role bypasses RLS but
    -- still runs triggers. To keep this strict, simply reject any tier change made through
    -- the normal client path.
    IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
      NEW.subscription_tier := OLD.subscription_tier;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_subscription_tier ON public.profiles;
CREATE TRIGGER profiles_lock_subscription_tier
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_tier_change();

-- 3) Ensure the signup trigger that auto-creates a free subscription still exists
--    (handle_new_user runs as SECURITY DEFINER so the dropped INSERT policy doesn't affect it).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();