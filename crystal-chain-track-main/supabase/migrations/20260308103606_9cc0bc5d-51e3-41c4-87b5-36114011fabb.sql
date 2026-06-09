
-- Create shipments table
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text NOT NULL UNIQUE,
  product_id text NOT NULL,
  distributor_id uuid NOT NULL,
  vehicle_info text NOT NULL DEFAULT '',
  route_notes text NOT NULL DEFAULT '',
  temperature_logs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies
CREATE POLICY "Distributors can insert shipments"
  ON public.shipments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = distributor_id AND has_role(auth.uid(), 'distributor'));

CREATE POLICY "Distributors can view their shipments"
  ON public.shipments FOR SELECT TO authenticated
  USING (auth.uid() = distributor_id);

CREATE POLICY "Distributors can update their shipments"
  ON public.shipments FOR UPDATE TO authenticated
  USING (auth.uid() = distributor_id AND has_role(auth.uid(), 'distributor'));

CREATE POLICY "Admins can manage all shipments"
  ON public.shipments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view shipments for tracing"
  ON public.shipments FOR SELECT
  USING (true);

-- Allow distributors to update product status
CREATE POLICY "Distributors can update product status"
  ON public.products FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'distributor'));
