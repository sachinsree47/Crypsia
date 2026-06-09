import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Factory, TrendingUp, Clock } from "lucide-react";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";

const ManufacturerDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, totalQty: 0 });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: all } = await supabase.from("products").select("product_id, product_name, batch_number, quantity, status, created_at")
      .eq("manufacturer_id", user.id).order("created_at", { ascending: false });
    if (all) {
      const now = new Date();
      const thisMonth = all.filter((p) => { const d = new Date(p.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
      setStats({ total: all.length, thisMonth: thisMonth.length, totalQty: all.reduce((sum, p) => sum + (p.quantity || 0), 0) });
      setRecentProducts(all.slice(0, 5));
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription({ table: "products", onChanged: load });

  const cards = [
    { label: "Total Batches", value: stats.total, icon: Package, change: `${stats.thisMonth} this month` },
    { label: "Total Units", value: stats.totalQty.toLocaleString(), icon: TrendingUp, change: "across all batches" },
    { label: "Factory", value: profile?.name || "—", icon: Factory, change: "manufacturer account" },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <motion.div className="flex items-center justify-between" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div>
            <h1 className="text-2xl font-display font-bold">Manufacturer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.name || "Manufacturer"}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button variant="hero" asChild><Link to="/dashboard/create-product"><Plus className="h-4 w-4 mr-2" /> New Batch</Link></Button>
          </motion.div>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={staggerContainer} initial="initial" animate="animate">
          {cards.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <Card className="hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  <p className="text-xs text-primary mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><CardTitle className="font-display">Recent Batches</CardTitle></div>
              <Button variant="outline" size="sm" asChild><Link to="/dashboard/my-products">View All</Link></Button>
            </CardHeader>
            <CardContent>
              {recentProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No products yet. Create your first batch!</p>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((p, i) => (
                    <motion.div key={p.product_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="h-2.5 w-2.5 rounded-full bg-chain-manufacturer animate-pulse-glow" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate"><span className="font-display text-primary">{p.product_id}</span> — {p.product_name}</p>
                        <p className="text-xs text-muted-foreground">Batch {p.batch_number} · {p.quantity} units</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{p.status}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ManufacturerDashboard;
