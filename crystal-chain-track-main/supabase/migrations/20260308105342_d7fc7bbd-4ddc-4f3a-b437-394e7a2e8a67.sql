
-- Enable realtime for supply chain tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retail_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blockchain_events;
