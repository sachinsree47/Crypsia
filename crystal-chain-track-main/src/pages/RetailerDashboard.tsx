import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, DollarSign } from "lucide-react";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";

const RetailerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, received: 0, forSale: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("retail_details").select("*").eq("retailer_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setStats({ total: data.length, received: data.filter((r) => r.status === "Received").length, forSale: data.filter((r) => r.status === "Available for Sale").length });
      setRecent(data.slice(0, 5));
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeSubscription({ table: "retail_details", onChanged: fetchData });
  useRealtimeSubscription({ table: "products", onChanged: fetchData });

  const statCards = [
    { label: "Total Products", value: stats.total, icon: Package, color: "text-primary" },
    { label: "Received", value: stats.received, icon: Clock, color: "text-chain-customer" },
    { label: "Available for Sale", value: stats.forSale, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-display font-bold">Retailer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage received products and retail details</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={staggerContainer} initial="initial" animate="animate">
          {statCards.map((s) => (
            <motion.div key={s.label} variants={fadeInUp}>
              <Card className="hover:shadow-glow transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-3xl font-display font-bold">{s.value}</p>
                    </div>
                    <s.icon className={`h-8 w-8 ${s.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="font-display">Recent Products</CardTitle></CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <p className="text-muted-foreground text-sm">No products yet. Confirm arrivals from distributors to get started.</p>
              ) : (
                <div className="space-y-3">
                  {recent.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div>
                        <p className="font-medium font-mono text-sm">{r.product_id}</p>
                        {r.retail_price && <p className="text-xs text-muted-foreground">${Number(r.retail_price).toFixed(2)}</p>}
                      </div>
                      <Badge variant="secondary">{r.status}</Badge>
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

export default RetailerDashboard;
