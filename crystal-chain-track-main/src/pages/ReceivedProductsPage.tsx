import { useEffect, useState } from "react";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { blockchainService } from "@/services/blockchain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Package, Truck, Wallet } from "lucide-react";

const generateShipmentId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SHP-${ts}-${rand}`;
};

const ReceivedProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const { data: availableProducts } = await supabase
      .from("products")
      .select("*")
      .eq("status", "Created at Manufacturer")
      .order("created_at", { ascending: false });

    const { data: myShipments } = await supabase
      .from("shipments")
      .select("product_id")
      .eq("distributor_id", user.id);

    const accepted = new Set((myShipments || []).map((s) => s.product_id));
    setAcceptedIds(accepted);
    setProducts(availableProducts || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);
  useRealtimeSubscription({ table: "products", onChanged: fetchData });

  const connectWallet = async () => {
    try {
      await blockchainService.connect();
      setWalletConnected(true);
      toast.success("Wallet connected!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAccept = async (product: any) => {
    if (!user) return;
    setAccepting(product.product_id);

    // Blockchain stage update
    if (walletConnected) {
      try {
        const txResult = await blockchainService.updateProductStage(product.product_id, "Shipped to Distributor");
        await supabase.from("blockchain_events").insert({
          product_id: product.product_id,
          event_type: "updateProductStage",
          stage: "Shipped to Distributor",
          actor_address: txResult.actorAddress,
          tx_hash: txResult.txHash,
          block_number: txResult.blockNumber,
          network: txResult.network,
        });
      } catch (err: any) {
        toast.error(`Blockchain error: ${err.message}`);
        setAccepting(null);
        return;
      }
    }

    const shipmentId = generateShipmentId();
    const { error: shipErr } = await supabase.from("shipments").insert({
      shipment_id: shipmentId,
      product_id: product.product_id,
      distributor_id: user.id,
      status: "Pending",
    });

    if (shipErr) {
      toast.error(shipErr.message);
      setAccepting(null);
      return;
    }

    const { error: prodErr } = await supabase
      .from("products")
      .update({ status: "Shipped to Distributor" })
      .eq("product_id", product.product_id);

    if (prodErr) {
      toast.error(prodErr.message);
    } else {
      toast.success(`Product ${product.product_id} accepted! Shipment ${shipmentId} created.`);
      fetchData();
    }
    setAccepting(null);
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-display font-bold">Received Products</h1>
        <p className="text-sm text-muted-foreground">Accept product batches from manufacturers</p>
      </motion.div>

      <Card>
        <CardContent className="pt-6">
          {walletConnected ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">Wallet connected — stage changes will be recorded on-chain</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={connectWallet}>
                <Wallet className="h-4 w-4 mr-2" /> Connect Wallet
              </Button>
              <span className="text-xs text-muted-foreground">Optional blockchain verification</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Package className="h-5 w-5" /> Available Products
          </CardTitle>
          <CardDescription>Products ready for distribution pickup</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products available for pickup.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Production Date</TableHead>
                  <TableHead>Factory</TableHead>
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
                    <TableCell>{p.factory_location}</TableCell>
                    <TableCell>
                      {acceptedIds.has(p.product_id) ? (
                        <Badge variant="secondary">Accepted</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="hero"
                          disabled={accepting === p.product_id}
                          onClick={() => handleAccept(p)}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          {accepting === p.product_id ? "Accepting..." : "Accept"}
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

export default ReceivedProductsPage;
