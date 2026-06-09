import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, Factory, Truck, Store, Activity, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useMultiTableRealtime } from "@/hooks/useRealtime";
import { formatDistanceToNow } from "date-fns";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";

const statusColors: Record<string, string> = {
  "Created at Manufacturer": "bg-chain-manufacturer",
  "Shipped to Distributor": "bg-chain-distributor",
  "In Transit": "bg-chain-distributor",
  "Received by Retailer": "bg-chain-retailer",
  "Available for Sale": "bg-chain-retailer",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, shipments: 0, inTransit: 0, retail: 0, users: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const [prodRes, shipRes, retailRes, usersRes] = await Promise.all([
      supabase.from("products").select("product_id, product_name, status, updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(10),
      supabase.from("shipments").select("*", { count: "exact" }),
      supabase.from("retail_details").select("*", { count: "exact" }),
      supabase.from("profiles").select("*", { count: "exact" }),
    ]);
    const inTransit = (shipRes.data || []).filter((s) => s.status === "In Transit").length;
    setStats({ products: prodRes.count || 0, shipments: shipRes.count || 0, inTransit, retail: retailRes.count || 0, users: usersRes.count || 0 });
    setRecentActivity((prodRes.data || []).slice(0, 6).map((p) => ({ id: p.product_id, name: p.product_name, status: p.status, time: p.updated_at })));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useMultiTableRealtime(["products", "shipments", "retail_details"], fetchData);

  const statCards = [
    { label: "Total Products", value: stats.products, icon: Package, desc: "all batches" },
    { label: "Total Shipments", value: stats.shipments, icon: Truck, desc: "all shipments" },
    { label: "In Transit", value: stats.inTransit, icon: Factory, desc: "currently moving" },
    { label: "Retail Products", value: stats.retail, icon: Store, desc: "at retailers" },
    { label: "Registered Users", value: stats.users, icon: Users, desc: "all accounts" },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Full supply chain overview — real-time</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" variants={staggerContainer} initial="initial" animate="animate">
          {statCards.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp}>
              <Card className="hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  <p className="text-xs text-primary mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`h-2.5 w-2.5 rounded-full ${statusColors[item.status] || "bg-muted"} animate-pulse-glow`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate"><span className="font-display text-primary">{item.id}</span> — {item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.status}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(item.time), { addSuffix: true })}</span>
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

export default AdminDashboard;
