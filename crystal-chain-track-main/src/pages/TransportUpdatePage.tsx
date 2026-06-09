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
import { Truck, Thermometer, MapPin, CheckCircle, Wallet, Warehouse } from "lucide-react";

const TransportUpdatePage = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ vehicleInfo: "", storageInfo: "", routeNotes: "", temperature: "", temperatureNote: "" });
  const [saving, setSaving] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [purchasedMap, setPurchasedMap] = useState<Record<string, any>>({});

  const fetchShipments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("shipments")
      .select("*")
      .eq("distributor_id", user.id)
      .order("created_at", { ascending: false });
    setShipments(data || []);

    const productIds = (data || []).map((s) => s.product_id);
    const { data: purchases } = await supabase
      .from("retail_details")
      .select("*")
      .in("product_id", productIds.length > 0 ? productIds : ["__none__"]);
    const pMap: Record<string, any> = {};
    (purchases || []).forEach((d) => { pMap[d.product_id] = d; });
    setPurchasedMap(pMap);

    setLoading(false);
  };

  useEffect(() => { fetchShipments(); }, [user]);
  useRealtimeSubscription({ table: "shipments", onChanged: fetchShipments });
  useRealtimeSubscription({ table: "retail_details", onChanged: fetchShipments });

  const connectWallet = async () => {
    try {
      await blockchainService.connect();
      setWalletConnected(true);
      toast.success("Wallet connected!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const recordBlockchainEvent = async (productId: string, stage: string) => {
    if (!walletConnected) return;
    try {
      const txResult = await blockchainService.updateProductStage(productId, stage);
      await supabase.from("blockchain_events").insert({
        product_id: productId,
        event_type: "updateProductStage",
        stage,
        actor_address: txResult.actorAddress,
        tx_hash: txResult.txHash,
        block_number: txResult.blockNumber,
        network: txResult.network,
      });
    } catch (err: any) {
      toast.error(`Blockchain error: ${err.message}`);
      throw err;
    }
  };

  const openUpdate = (shipment: any) => {
    setSelected(shipment);
    setForm({
      vehicleInfo: shipment.vehicle_info || "",
      storageInfo: shipment.storage_info || "",
      routeNotes: shipment.route_notes || "",
      temperature: "",
      temperatureNote: "",
    });
  };

  const handleSave = async () => {
    if (!selected) return;

    if (!form.vehicleInfo.trim() || !form.storageInfo.trim()) {
      toast.error("Vehicle and storage details are required.");
      return;
    }
    setSaving(true);

    // While in transit we keep the In Transit status; before purchase the product
    // becomes "Ready for Retailer" so retailers can buy it.
    const inTransit = selected.status === "In Transit";
    const newShipmentStatus = inTransit ? "In Transit" : "Ready for Retailer";
    const newProductStatus = inTransit ? "In Transit" : "Ready for Retailer";

    if (walletConnected && inTransit) {
      try {
        await recordBlockchainEvent(selected.product_id, "In Transit");
      } catch {
        setSaving(false);
        return;
      }
    }

    const existingLogs = Array.isArray(selected.temperature_logs) ? selected.temperature_logs : [];
    const newLogs = form.temperature
      ? [...existingLogs, { temp: form.temperature, note: form.temperatureNote, recorded_at: new Date().toISOString() }]
      : existingLogs;

    const { error } = await supabase
      .from("shipments")
      .update({
        vehicle_info: form.vehicleInfo,
        storage_info: form.storageInfo,
        route_notes: form.routeNotes,
        temperature_logs: newLogs,
        status: newShipmentStatus,
      })
      .eq("id", selected.id);

    if (!error) {
      await supabase
        .from("products")
        .update({ status: newProductStatus })
        .eq("product_id", selected.product_id);
      toast.success(inTransit ? "Transit info updated!" : "Details saved — product is now available to retailers!");
      setSelected(null);
      fetchShipments();
    } else {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleDeliver = async (shipment: any) => {
    if (walletConnected) {
      try {
        await recordBlockchainEvent(shipment.product_id, "Received by Retailer");
      } catch {
        return;
      }
    }

    const { error } = await supabase
      .from("shipments")
      .update({ status: "Delivered to Retailer" })
      .eq("id", shipment.id);

    if (!error) {
      await supabase
        .from("products")
        .update({ status: "Received by Retailer" })
        .eq("product_id", shipment.product_id);
      toast.success("Product marked as delivered to retailer!");
      fetchShipments();
    } else {
      toast.error(error.message);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Pending": return "secondary";
      case "Ready for Retailer": return "outline";
      case "In Transit": return "default";
      case "Delivered to Retailer": return "outline";
      default: return "secondary";
    }
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-display font-bold">Transport Updates</h1>
        <p className="text-sm text-muted-foreground">Add vehicle & storage details, then manage delivery</p>
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
            <Truck className="h-5 w-5" /> My Shipments
          </CardTitle>
          <CardDescription>
            Add vehicle & storage details to make a product available. The product only goes In Transit once a retailer buys it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : shipments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No shipments yet. Accept products first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((s) => {
                  const purchased = !!purchasedMap[s.product_id];
                  const hasDetails = s.status !== "Pending";
                  return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.shipment_id}</TableCell>
                    <TableCell className="font-mono text-xs">{s.product_id}</TableCell>
                    <TableCell>{s.vehicle_info || "—"}</TableCell>
                    <TableCell className="text-xs">{s.storage_info || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={purchased ? "default" : "secondary"}>
                        {purchased ? "Purchased" : "Awaiting buyer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(s.status)}>{s.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!hasDetails && (
                          <Button size="sm" variant="hero" onClick={() => openUpdate(s)}>
                            <Warehouse className="h-3 w-3 mr-1" /> Add Details
                          </Button>
                        )}
                        {s.status === "Ready for Retailer" && (
                          <Button size="sm" variant="outline" onClick={() => openUpdate(s)}>
                            <MapPin className="h-3 w-3 mr-1" /> Edit Details
                          </Button>
                        )}
                        {s.status === "In Transit" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openUpdate(s)}>
                              <MapPin className="h-3 w-3 mr-1" /> Update
                            </Button>
                            <Button size="sm" variant="hero" onClick={() => handleDeliver(s)}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Deliver
                            </Button>
                          </>
                        )}
                        {s.status === "Ready for Retailer" && !purchased && (
                          <span className="text-xs text-muted-foreground self-center">Waiting for retailer to buy</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {selected?.status === "In Transit" ? "Update Transit Info" : "Vehicle & Storage Details"}
            </DialogTitle>
            <DialogDescription>Shipment {selected?.shipment_id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleInfo">Vehicle Information *</Label>
              <Input
                id="vehicleInfo"
                placeholder="e.g. Truck #42 - Refrigerated"
                value={form.vehicleInfo}
                onChange={(e) => setForm((p) => ({ ...p, vehicleInfo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageInfo">Storage — where & how the product is stored *</Label>
              <Textarea
                id="storageInfo"
                placeholder="e.g. Cold storage warehouse B3, kept at 2–6°C on pallet racks"
                value={form.storageInfo}
                onChange={(e) => setForm((p) => ({ ...p, storageInfo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeNotes">Route Notes</Label>
              <Textarea
                id="routeNotes"
                placeholder="e.g. Highway A1 → Warehouse B3, ETA 6h"
                value={form.routeNotes}
                onChange={(e) => setForm((p) => ({ ...p, routeNotes: e.target.value }))}
              />
            </div>
            {selected?.status === "In Transit" && (
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Thermometer className="h-4 w-4" /> Add Temperature Log
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="temp">Temperature (°C)</Label>
                    <Input
                      id="temp"
                      type="number"
                      placeholder="e.g. 4.5"
                      value={form.temperature}
                      onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempNote">Note</Label>
                    <Input
                      id="tempNote"
                      placeholder="e.g. At departure"
                      value={form.temperatureNote}
                      onChange={(e) => setForm((p) => ({ ...p, temperatureNote: e.target.value }))}
                    />
                  </div>
                </div>
                {selected && Array.isArray(selected.temperature_logs) && selected.temperature_logs.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Previous logs:</p>
                    {(selected.temperature_logs as any[]).map((log: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {log.temp}°C — {log.note} ({new Date(log.recorded_at).toLocaleString()})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Button variant="hero" className="w-full" onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : selected?.status === "In Transit"
                ? "Save Transit Update"
                : "Save & Make Available to Retailers"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PageTransition>
  );
};

export default TransportUpdatePage;
