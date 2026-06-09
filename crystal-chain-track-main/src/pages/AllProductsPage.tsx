import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { PageTransition } from "@/components/PageTransition";

const statusColor = (s: string) => {
  if (s.includes("Manufacturer")) return "bg-chain-manufacturer/10 text-chain-manufacturer border-chain-manufacturer/30";
  if (s.includes("Transit") || s.includes("Distributor")) return "bg-chain-distributor/10 text-chain-distributor border-chain-distributor/30";
  if (s.includes("Retailer") || s.includes("Sale")) return "bg-chain-retailer/10 text-chain-retailer border-chain-retailer/30";
  return "bg-muted text-muted-foreground";
};

const AllProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []); setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useRealtimeSubscription({ table: "products", onChanged: fetchProducts });

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? products.filter((p) => p.product_name.toLowerCase().includes(q) || p.product_id.toLowerCase().includes(q) || p.batch_number.toLowerCase().includes(q)) : products);
  }, [search, products]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div className="flex items-center justify-between" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div>
            <h1 className="text-2xl font-display font-bold">All Products</h1>
            <p className="text-sm text-muted-foreground">{products.length} products in the supply chain</p>
          </div>
        </motion.div>

        <motion.div className="relative max-w-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or batch..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No products found</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead><TableHead>Name</TableHead><TableHead>Batch</TableHead><TableHead>Qty</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs">{p.product_id}</TableCell>
                        <TableCell className="font-medium">{p.product_name}</TableCell>
                        <TableCell>{p.batch_number}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell><Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" asChild><Link to={`/trace/${p.product_id}`}><ExternalLink className="h-4 w-4" /></Link></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AllProductsPage;
