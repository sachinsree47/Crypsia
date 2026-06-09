import { useEffect, useState } from "react";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ShoppingCart, Package, Truck, DollarSign } from "lucide-react";

const BuyProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [shipmentMap, setShipmentMap] = useState<Record<string, any>>({});
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchData = async () => {
    if (!user) return;

    // Products that the distributor has prepared (vehicle & storage details added)
    const { data: available } = await supabase
      .from("products")
      .select("*")
      .eq("status", "Ready for Retailer")
      .order("created_at", { ascending: false });

    // Get shipment info for these products
    const productIds = (available || []).map((p) => p.product_id);
    const { data: shipments } = await supabase
      .from("shipments")
      .select("*")
      .in("product_id", productIds.length > 0 ? productIds : ["__none__"]);

    const sMap: Record<string, any> = {};
    (shipments || []).forEach((s) => { sMap[s.product_id] = s; });
    setShipmentMap(sMap);

    // Products already purchased by this retailer
    const { data: myDetails } = await supabase
      .from("retail_details")
      .select("product_id")
      .eq("retailer_id", user.id);

    setOwnedIds(new Set((myDetails || []).map((d) => d.product_id)));
    setProducts(available || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);
  useRealtimeSubscription({ table: "products", onChanged: fetchData });
  useRealtimeSubscription({ table: "retail_details", onChanged: fetchData });

  const handleBuy = async (product: any) => {
    if (!user) return;
    setBuying(product.product_id);

    // Create retail_details entry (purchase record)
    const { error } = await supabase.from("retail_details").insert({
      product_id: product.product_id,
      retailer_id: user.id,
      status: "Purchased",
    });

    if (error) {
      toast.error(error.message);
      setBuying(null);
      return;
    }

    // Update product status — product goes In Transit only after purchase
    await supabase
      .from("products")
      .update({ status: "In Transit" })
      .eq("product_id", product.product_id);

    // Move the matching shipment to In Transit
    await supabase
      .from("shipments")
      .update({ status: "In Transit" })
      .eq("product_id", product.product_id);

    toast.success(`Product ${product.product_id} purchased successfully!`);
    setBuying(null);
    fetchData();
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-display font-bold">Buy Products</h1>
        <p className="text-sm text-muted-foreground">Browse and purchase products from distributors</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Available Products
          </CardTitle>
          <CardDescription>Products held by distributors, ready to purchase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products available for purchase yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const shipment = shipmentMap[p.product_id];
                  const alreadyOwned = ownedIds.has(p.product_id);

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.product_id}</TableCell>
                      <TableCell className="font-medium">{p.product_name}</TableCell>
                      <TableCell>{p.batch_number}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{format(new Date(p.production_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-xs">
                        {shipment ? (
                          <span className="text-muted-foreground">{shipment.shipment_id}</span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={alreadyOwned ? "default" : "secondary"}>
                          {alreadyOwned ? "Purchased" : p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alreadyOwned ? (
                          <Button size="sm" variant="outline" onClick={() => setSelectedProduct(p)}>
                            <Package className="h-3 w-3 mr-1" /> Details
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="hero"
                            disabled={buying === p.product_id}
                            onClick={() => handleBuy(p)}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            {buying === p.product_id ? "Buying..." : "Buy"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Product detail dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Product Details</DialogTitle>
            <DialogDescription>Details for {selectedProduct?.product_id}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Name:</span> {selectedProduct.product_name}</div>
                <div><span className="text-muted-foreground">Batch:</span> {selectedProduct.batch_number}</div>
                <div><span className="text-muted-foreground">Quantity:</span> {selectedProduct.quantity}</div>
                <div><span className="text-muted-foreground">Factory:</span> {selectedProduct.factory_location}</div>
                <div><span className="text-muted-foreground">Production:</span> {format(new Date(selectedProduct.production_date), "MMM d, yyyy")}</div>
                <div><span className="text-muted-foreground">Status:</span> {selectedProduct.status}</div>
              </div>
              {shipmentMap[selectedProduct.product_id] && (
                <div className="border-t border-border pt-3">
                  <p className="font-medium flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4" /> Shipment Info
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Shipment:</span> {shipmentMap[selectedProduct.product_id].shipment_id}</div>
                    <div><span className="text-muted-foreground">Vehicle:</span> {shipmentMap[selectedProduct.product_id].vehicle_info || "—"}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Storage:</span> {shipmentMap[selectedProduct.product_id].storage_info || "—"}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Route:</span> {shipmentMap[selectedProduct.product_id].route_notes || "—"}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
};

export default BuyProductsPage;
