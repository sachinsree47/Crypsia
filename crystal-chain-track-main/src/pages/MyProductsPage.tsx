import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, QrCode, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface Product {
  id: string;
  product_id: string;
  product_name: string;
  batch_number: string;
  production_date: string;
  quantity: number;
  factory_location: string;
  status: string;
  qr_code_url: string | null;
  blockchain_tx_hash: string | null;
  created_at: string;
}

const MyProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("manufacturer_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useRealtimeSubscription({ table: "products", onChanged: fetchProducts });

  const statusColor = (status: string) => {
    if (status.includes("Manufacturer")) return "bg-chain-manufacturer text-primary-foreground";
    if (status.includes("Distributor")) return "bg-chain-distributor text-primary-foreground";
    if (status.includes("Retailer")) return "bg-chain-retailer text-primary-foreground";
    if (status.includes("Customer")) return "bg-chain-customer text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} product batch{products.length !== 1 ? "es" : ""} registered
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/create-product">
            <Plus className="h-4 w-4 mr-2" /> Create Batch
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="h-8 w-8 rounded-lg bg-hero-gradient animate-pulse-glow" />
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-lg mb-1">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first product batch to get started</p>
            <Button variant="hero" asChild>
              <Link to="/dashboard/create-product">
                <Plus className="h-4 w-4 mr-2" /> Create Product Batch
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Product Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs font-medium text-primary">
                        {product.product_id}
                      </TableCell>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell className="text-sm">{product.batch_number}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(product.production_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">{product.factory_location}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(product.status)} variant="secondary">
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="font-display">
                                QR Code — {product.product_id}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 py-4">
                              <div className="bg-card p-4 rounded-xl border border-border">
                                <QRCodeSVG
                                  value={product.qr_code_url || `${window.location.origin}/trace/${product.product_id}`}
                                  size={200}
                                  level="H"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground text-center break-all">
                                {product.qr_code_url}
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/trace/${product.product_id}`}>
                                  <ExternalLink className="h-3 w-3 mr-1" /> View Trace
                                </Link>
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </PageTransition>
  );
};

export default MyProductsPage;
