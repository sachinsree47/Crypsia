
-- Tighten INSERT policy: only users with a supply chain role can insert blockchain events
DROP POLICY "Authenticated users can insert blockchain_events" ON public.blockchain_events;

CREATE POLICY "Supply chain actors can insert blockchain_events"
  ON public.blockchain_events FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'manufacturer') OR
    has_role(auth.uid(), 'distributor') OR
    has_role(auth.uid(), 'retailer') OR
    has_role(auth.uid(), 'admin')
  );
