import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMultiTableRealtime } from "@/hooks/useRealtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield, Factory, Truck, Store, User, ArrowLeft, CheckCircle,
  Thermometer, MapPin, ShoppingBag, Link2, Clock, Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const steps = [
  { key: "Created at Manufacturer", label: "Manufactured", icon: Factory, color: "bg-chain-manufacturer", desc: "Product created and registered by manufacturer" },
  { key: "Shipped to Distributor", label: "Picked Up by Distributor", icon: Truck, color: "bg-chain-distributor", desc: "Product batch accepted by distributor" },
  { key: "In Transit", label: "In Transit", icon: Truck, color: "bg-chain-distributor", desc: "Product is being transported" },
  { key: "Received by Retailer", label: "Delivered to Retailer", icon: Store, color: "bg-chain-retailer", desc: "Product received at retail location" },
  { key: "Available for Sale", label: "Available for Sale", icon: ShoppingBag, color: "bg-chain-retailer", desc: "Product verified and ready for purchase" },
  { key: "Purchased by Customer", label: "Purchased", icon: User, color: "bg-chain-customer", desc: "Product sold to customer" },
];

const TracePage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [retailDetail, setRetailDetail] = useState<any>(null);
  const [blockchainEvents, setBlockchainEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    if (!productId) return;
    const { data: prod } = await supabase
      .from("products")
      .select("*")
      .eq("product_id", productId)
      .single();

    setProduct(prod);

    if (prod) {
      const [shipRes, retailRes, bcRes] = await Promise.all([
        supabase.from("shipments").select("*").eq("product_id", productId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("retail_details").select("*").eq("product_id", productId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("blockchain_events").select("*").eq("product_id", productId).order("created_at", { ascending: true }),
      ]);
      setShipment(shipRes.data);
      setRetailDetail(retailRes.data);
      setBlockchainEvents(bcRes.data || []);
    }

    setLoading(false);
    setLastRefresh(new Date());
  }, [productId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: re-fetch when any related table changes
  useMultiTableRealtime(["products", "shipments", "retail_details", "blockchain_events"], fetchData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-lg bg-hero-gradient animate-pulse-glow" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-display font-bold">Product Not Found</h1>
        <p className="text-muted-foreground">No product with ID "{productId}" exists.</p>
        <Button variant="outline" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Home</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === product.status);
  const tempLogs = shipment?.temperature_logs && Array.isArray(shipment.temperature_logs)
    ? shipment.temperature_logs as Array<{ temp: string; note: string; recorded_at: string }>
    : [];
  const isBlockchainVerified = blockchainEvents.length > 0;

  // Build timestamp map
  const stageTimestamps: Record<string, string> = {};
  stageTimestamps["Created at Manufacturer"] = product.created_at;
  if (shipment) {
    stageTimestamps["Shipped to Distributor"] = shipment.created_at;
    if (shipment.status === "In Transit" || shipment.status === "Delivered to Retailer") {
      stageTimestamps["In Transit"] = shipment.updated_at;
    }
    if (shipment.status === "Delivered to Retailer") {
      stageTimestamps["Received by Retailer"] = shipment.updated_at;
    }
  }
  if (retailDetail) {
    stageTimestamps["Received by Retailer"] = retailDetail.created_at;
    if (retailDetail.status === "Available for Sale") {
      stageTimestamps["Available for Sale"] = retailDetail.updated_at;
    }
  }
  for (const evt of blockchainEvents) {
    stageTimestamps[evt.stage] = evt.created_at;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-hero-gradient flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Crypsia</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Product Trace</span>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3 text-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </nav>

      <div className="container max-w-3xl py-8 md:py-10 space-y-6 md:space-y-8 px-4">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl md:text-3xl font-display font-bold">{product.product_name}</h1>
          <p className="font-mono text-sm text-primary">{product.product_id}</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {isBlockchainVerified ? (
              <Badge className="bg-emerald-600 text-primary-foreground px-3 py-1 text-sm gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Blockchain Verified — {blockchainEvents.length} record{blockchainEvents.length > 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1 text-sm gap-1.5 text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                No blockchain records
              </Badge>
            )}
            <Badge variant="secondary" className="px-3 py-1 text-sm gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              Live · {format(lastRefresh, "HH:mm:ss")}
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Supply Chain Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => {
                const reached = i <= currentStepIndex;
                const bcEvent = blockchainEvents.find((e) => e.stage === step.key);
                const timestamp = stageTimestamps[step.key];
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          reached ? step.color : "bg-muted"
                        } transition-colors`}
                      >
                        {reached ? (
                          <CheckCircle className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <step.icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 h-16 ${reached ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-6 min-w-0">
                      <p className={`font-display font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      {reached && timestamp && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(timestamp), "MMM d, yyyy 'at' HH:mm")}
                        </p>
                      )}
                      {bcEvent && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <Link2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs font-mono text-emerald-600 truncate max-w-[200px]" title={bcEvent.tx_hash}>
                            {bcEvent.tx_hash.slice(0, 10)}...{bcEvent.tx_hash.slice(-8)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Product Details + QR */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Batch</span><span className="font-medium">{product.batch_number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{product.quantity}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Production Date</span><span className="font-medium">{format(new Date(product.production_date), "MMM d, yyyy")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Factory</span><span className="font-medium">{product.factory_location}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="secondary">{product.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Registered</span><span className="font-medium">{format(new Date(product.created_at), "MMM d, yyyy HH:mm")}</span></div>
              {product.blockchain_tx_hash && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Tx Hash</span>
                  <span className="font-mono text-xs truncate max-w-[180px]" title={product.blockchain_tx_hash}>{product.blockchain_tx_hash}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="bg-card p-3 rounded-xl border border-border">
                <QRCodeSVG
                  value={product.qr_code_url || `${window.location.origin}/trace/${product.product_id}`}
                  size={160}
                  level="H"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Permanent QR — always shows the latest product data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Verification History */}
        {blockchainEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Blockchain Verification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockchainEvents.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="h-8 w-8 rounded-full bg-emerald-600/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium">{evt.stage}</span>
                        <Badge variant="outline" className="text-xs">{evt.event_type}</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex gap-2">
                          <span className="shrink-0">Tx:</span>
                          <span className="font-mono truncate" title={evt.tx_hash}>{evt.tx_hash.slice(0, 16)}...{evt.tx_hash.slice(-8)}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="shrink-0">Actor:</span>
                          <span className="font-mono truncate" title={evt.actor_address}>{evt.actor_address.slice(0, 10)}...{evt.actor_address.slice(-6)}</span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <span>Block: {evt.block_number}</span>
                          <span>Network: {evt.network}</span>
                        </div>
                        {evt.product_hash && (
                          <div className="flex gap-2">
                            <span className="shrink-0">Hash:</span>
                            <span className="font-mono truncate" title={evt.product_hash}>{evt.product_hash.slice(0, 16)}...{evt.product_hash.slice(-8)}</span>
                          </div>
                        )}
                        <div>{format(new Date(evt.created_at), "MMM d, yyyy 'at' HH:mm:ss")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transport Details */}
        {shipment && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Truck className="h-4 w-4" /> Logistics & Transport
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Shipment ID</span><span className="font-mono font-medium">{shipment.shipment_id}</span></div>
              {shipment.vehicle_info && (
                <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{shipment.vehicle_info}</span></div>
              )}
              {shipment.route_notes && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Route Notes</span>
                  <p className="font-medium text-foreground">{shipment.route_notes}</p>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipment Status</span><Badge variant="secondary">{shipment.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accepted</span><span className="font-medium">{format(new Date(shipment.created_at), "MMM d, yyyy HH:mm")}</span></div>

              {tempLogs.length > 0 && (
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-muted-foreground flex items-center gap-1 mb-2"><Thermometer className="h-3 w-3" /> Temperature Logs</p>
                  <div className="space-y-2">
                    {tempLogs.map((log, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                        <span className="font-medium">{log.temp}°C</span>
                        <span className="text-xs text-muted-foreground">{log.note}</span>
                        <span className="text-xs text-muted-foreground">{new Date(log.recorded_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Retail Details */}
        {retailDetail && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Store className="h-4 w-4" /> Retail Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {retailDetail.storage_conditions && (
                <div className="flex justify-between"><span className="text-muted-foreground">Storage Conditions</span><span className="font-medium">{retailDetail.storage_conditions}</span></div>
              )}
              {retailDetail.shelf_location && (
                <div className="flex justify-between"><span className="text-muted-foreground">Shelf Location</span><span className="font-medium">{retailDetail.shelf_location}</span></div>
              )}
              {retailDetail.retail_price && (
                <div className="flex justify-between"><span className="text-muted-foreground">Retail Price</span><span className="font-medium">${Number(retailDetail.retail_price).toFixed(2)}</span></div>
              )}
              {retailDetail.display_notes && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Display Notes</span>
                  <p className="font-medium text-foreground">{retailDetail.display_notes}</p>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Retail Status</span><Badge variant="secondary">{retailDetail.status}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Received</span><span className="font-medium">{format(new Date(retailDetail.created_at), "MMM d, yyyy HH:mm")}</span></div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-display font-semibold text-foreground">Crypsia</span> — Blockchain-backed supply chain traceability
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Wifi className="h-3 w-3 text-emerald-500" /> Updates in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default TracePage;
