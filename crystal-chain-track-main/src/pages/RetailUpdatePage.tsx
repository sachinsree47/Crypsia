import { useEffect, useState } from "react";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { blockchainService } from "@/services/blockchain";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Store, ShoppingBag, Edit, Wallet } from "lucide-react";

const RetailUpdatePage = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ storageConditions: "", shelfLocation: "", retailPrice: "", displayNotes: "" });
  const [saving, setSaving] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const fetchDetails = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("retail_details")
      .select("*")
      .eq("retailer_id", user.id)
      .order("created_at", { ascending: false });
    setDetails(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDetails(); }, [user]);
  useRealtimeSubscription({ table: "retail_details", onChanged: fetchDetails });

  const connectWallet = async () => {
    try {
      await blockchainService.connect();
      setWalletConnected(true);
      toast.success("Wallet connected!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (detail: any) => {
    setSelected(detail);
    setForm({
      storageConditions: detail.storage_conditions || "",
      shelfLocation: detail.shelf_location || "",
      retailPrice: detail.retail_price ? String(detail.retail_price) : "",
      displayNotes: detail.display_notes || "",
    });
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);

    const { error } = await supabase
      .from("retail_details")
      .update({
        storage_conditions: form.storageConditions,
        shelf_location: form.shelfLocation,
        retail_price: form.retailPrice ? parseFloat(form.retailPrice) : null,
        display_notes: form.displayNotes,
      })
      .eq("id", selected.id);

    if (!error) {
      toast.success("Retail details updated!");
      setSelected(null);
      fetchDetails();
    } else {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleMarkForSale = async (detail: any) => {
    // Blockchain stage update
    if (walletConnected) {
      try {
        const txResult = await blockchainService.updateProductStage(detail.product_id, "Available for Sale");
        await supabase.from("blockchain_events").insert({
          product_id: detail.product_id,
          event_type: "updateProductStage",
          stage: "Available for Sale",
          actor_address: txResult.actorAddress,
          tx_hash: txResult.txHash,
          block_number: txResult.blockNumber,
          network: txResult.network,
        });
      } catch (err: any) {
        toast.error(`Blockchain error: ${err.message}`);
        return;
      }
    }

    const { error: retErr } = await supabase
      .from("retail_details")
      .update({ status: "Available for Sale" })
      .eq("id", detail.id);

    if (!retErr) {
      await supabase
        .from("products")
        .update({ status: "Available for Sale" })
        .eq("product_id", detail.product_id);
      toast.success("Product marked as available for sale!");
      fetchDetails();
    } else {
      toast.error(retErr.message);
    }
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-display font-bold">Retail Details</h1>
        <p className="text-sm text-muted-foreground">Update storage, pricing, and mark products for sale</p>
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
            <Store className="h-5 w-5" /> My Retail Products
          </CardTitle>
          <CardDescription>Update details and mark products as available for sale</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : details.length === 0 ? (
            <p className="text-muted-foreground text-sm">No confirmed products. Confirm arrivals first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Shelf</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.product_id}</TableCell>
                    <TableCell>{d.storage_conditions || "—"}</TableCell>
                    <TableCell>{d.shelf_location || "—"}</TableCell>
                    <TableCell>{d.retail_price ? `$${Number(d.retail_price).toFixed(2)}` : "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        {d.status !== "Available for Sale" && (
                          <Button size="sm" variant="hero" onClick={() => handleMarkForSale(d)}>
                            <ShoppingBag className="h-3 w-3 mr-1" /> For Sale
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Update Retail Details</DialogTitle>
            <DialogDescription>Product {selected?.product_id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storageConditions">Storage Conditions</Label>
              <Input
                id="storageConditions"
                placeholder="e.g. Refrigerated at 4°C"
                value={form.storageConditions}
                onChange={(e) => setForm((p) => ({ ...p, storageConditions: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shelfLocation">Shelf Location</Label>
              <Input
                id="shelfLocation"
                placeholder="e.g. Aisle 3, Shelf B"
                value={form.shelfLocation}
                onChange={(e) => setForm((p) => ({ ...p, shelfLocation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price ($)</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 12.99"
                value={form.retailPrice}
                onChange={(e) => setForm((p) => ({ ...p, retailPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayNotes">Display Notes</Label>
              <Textarea
                id="displayNotes"
                placeholder="e.g. Feature in weekly promotion, end-cap display"
                value={form.displayNotes}
                onChange={(e) => setForm((p) => ({ ...p, displayNotes: e.target.value }))}
              />
            </div>
            <Button variant="hero" className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
};

export default RetailUpdatePage;
