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
import { toast } from "sonner";
import { format } from "date-fns";
import { Package, Store } from "lucide-react";

const RetailerReceivedProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;

    // Products purchased by this retailer (from retail_details)
    const { data: myDetails } = await supabase
      .from("retail_details")
      .select("product_id, status")
      .eq("retailer_id", user.id);

    const detailMap = new Map((myDetails || []).map((d) => [d.product_id, d.status]));
    const purchasedProductIds = (myDetails || []).map((d) => d.product_id);

    if (purchasedProductIds.length === 0) {
      setProducts([]);
      setConfirmedIds(new Set());
      setLoading(false);
      return;
    }

    const { data: purchased } = await supabase
      .from("products")
      .select("*")
      .in("product_id", purchasedProductIds)
      .order("created_at", { ascending: false });

    const confirmed = new Set(
      (myDetails || []).filter((d) => d.status === "Received").map((d) => d.product_id)
    );
    setConfirmedIds(confirmed);
    setProducts(purchased || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);
  useRealtimeSubscription({ table: "products", onChanged: fetchData });

  const handleConfirm = async (product: any) => {
    if (!user) return;
    setConfirming(product.product_id);

    // Update existing retail_details status to "Received"
    const { error } = await supabase
      .from("retail_details")
      .update({ status: "Received" })
      .eq("product_id", product.product_id)
      .eq("retailer_id", user.id);

    if (!error) {
      // Also update the product status
      await supabase
        .from("products")
        .update({ status: "Received by Retailer" })
        .eq("product_id", product.product_id);

      toast.success(`Product ${product.product_id} arrival confirmed!`);
      fetchData();
    } else {
      toast.error(error.message);
    }
    setConfirming(null);
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-display font-bold">My Purchased Products</h1>
        <p className="text-sm text-muted-foreground">Confirm arrival of products you've purchased</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Package className="h-5 w-5" /> Delivered Products
          </CardTitle>
          <CardDescription>Confirm arrival of your purchased products</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-sm">No purchased products yet. Buy products from distributors first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.product_id}</TableCell>
                    <TableCell>{p.product_name}</TableCell>
                    <TableCell>{p.batch_number}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{format(new Date(p.production_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {confirmedIds.has(p.product_id) ? (
                        <Badge variant="secondary">Confirmed</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="hero"
                          disabled={confirming === p.product_id}
                          onClick={() => handleConfirm(p)}
                        >
                          <Store className="h-3 w-3 mr-1" />
                          {confirming === p.product_id ? "Confirming..." : "Confirm Arrival"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </PageTransition>
  );
};

export default RetailerReceivedProductsPage;
