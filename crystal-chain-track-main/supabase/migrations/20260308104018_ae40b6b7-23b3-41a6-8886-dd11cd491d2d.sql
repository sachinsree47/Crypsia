
-- Create retail_details table
CREATE TABLE public.retail_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  retailer_id uuid NOT NULL,
  storage_conditions text NOT NULL DEFAULT '',
  shelf_location text NOT NULL DEFAULT '',
  retail_price numeric(10,2),
  display_notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Received',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_details ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_retail_details_updated_at
  BEFORE UPDATE ON public.retail_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies
CREATE POLICY "Retailers can insert retail_details"
  ON public.retail_details FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = retailer_id AND has_role(auth.uid(), 'retailer'));

CREATE POLICY "Retailers can view their retail_details"
  ON public.retail_details FOR SELECT TO authenticated
  USING (auth.uid() = retailer_id);

CREATE POLICY "Retailers can update their retail_details"
  ON public.retail_details FOR UPDATE TO authenticated
  USING (auth.uid() = retailer_id AND has_role(auth.uid(), 'retailer'));

CREATE POLICY "Admins can manage all retail_details"
  ON public.retail_details FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view retail_details for tracing"
  ON public.retail_details FOR SELECT
  USING (true);

-- Allow retailers to update product status
CREATE POLICY "Retailers can update product status"
  ON public.products FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'retailer'));
