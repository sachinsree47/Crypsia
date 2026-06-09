import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, CheckCircle, Clock } from "lucide-react";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";

const DistributorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [recentShipments, setRecentShipments] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const { data: shipments } = await supabase.from("shipments").select("*").eq("distributor_id", user.id).order("created_at", { ascending: false });
    if (shipments) {
      setStats({
        total: shipments.length,
        pending: shipments.filter((s) => s.status === "Pending").length,
        inTransit: shipments.filter((s) => s.status === "In Transit").length,
        delivered: shipments.filter((s) => s.status === "Delivered to Retailer").length,
      });
      setRecentShipments(shipments.slice(0, 5));
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useRealtimeSubscription({ table: "shipments", onChanged: fetchData });
  useRealtimeSubscription({ table: "products", onChanged: fetchData });

  const statCards = [
    { label: "Total Shipments", value: stats.total, icon: Package, color: "text-primary" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-chain-customer" },
    { label: "In Transit", value: stats.inTransit, icon: Truck, color: "text-chain-distributor" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-primary" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-display font-bold">Distributor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage shipments and transportation</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer} initial="initial" animate="animate">
          {statCards.map((s, i) => (
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
            <CardHeader><CardTitle className="font-display">Recent Shipments</CardTitle></CardHeader>
            <CardContent>
              {recentShipments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No shipments yet. Accept products from manufacturers to get started.</p>
              ) : (
                <div className="space-y-3">
                  {recentShipments.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div>
                        <p className="font-medium font-mono text-sm">{s.shipment_id}</p>
                        <p className="text-xs text-muted-foreground">Product: {s.product_id}</p>
                      </div>
                      <Badge variant="secondary">{s.status}</Badge>
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

export default DistributorDashboard;
