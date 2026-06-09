
-- Products table for supply chain tracking
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  production_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  factory_location TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Created at Manufacturer',
  qr_code_url TEXT,
  blockchain_tx_hash TEXT,
  manufacturer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Manufacturers can view and manage their own products
CREATE POLICY "Manufacturers can view their own products"
  ON public.products FOR SELECT TO authenticated
  USING (auth.uid() = manufacturer_id);

CREATE POLICY "Manufacturers can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = manufacturer_id
    AND public.has_role(auth.uid(), 'manufacturer')
  );

CREATE POLICY "Manufacturers can update their own products"
  ON public.products FOR UPDATE TO authenticated
  USING (auth.uid() = manufacturer_id AND public.has_role(auth.uid(), 'manufacturer'));

-- Admins can do everything
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can view products for tracing (public trace page)
CREATE POLICY "Anyone can view products for tracing"
  ON public.products FOR SELECT
  USING (true);

-- Distributors and retailers can view products
CREATE POLICY "Distributors can view products"
  ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'distributor'));

CREATE POLICY "Retailers can view products"
  ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'retailer'));

-- Index for fast lookups
CREATE INDEX idx_products_product_id ON public.products(product_id);
CREATE INDEX idx_products_manufacturer_id ON public.products(manufacturer_id);
CREATE INDEX idx_products_batch_number ON public.products(batch_number);

-- Timestamp trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
