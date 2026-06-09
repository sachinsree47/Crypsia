
-- Create blockchain_events table to store on-chain transaction records
CREATE TABLE public.blockchain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  event_type text NOT NULL,
  stage text NOT NULL,
  actor_address text NOT NULL DEFAULT '',
  tx_hash text NOT NULL DEFAULT '',
  product_hash text NOT NULL DEFAULT '',
  block_number bigint,
  network text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view for tracing
CREATE POLICY "Anyone can view blockchain_events"
  ON public.blockchain_events FOR SELECT
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert blockchain_events"
  ON public.blockchain_events FOR INSERT TO authenticated
  WITH CHECK (true);

-- Admins can manage all
CREATE POLICY "Admins can manage blockchain_events"
  ON public.blockchain_events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));
