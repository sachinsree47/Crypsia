import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Factory, Truck, Store, Users } from "lucide-react";
import { format } from "date-fns";
import { PageTransition } from "@/components/PageTransition";

const icons: Record<string, any> = { manufacturer: Factory, distributor: Truck, retailer: Store };
const labels: Record<string, string> = { manufacturer: "Manufacturers", distributor: "Distributors", retailer: "Retailers" };

interface Props { roleFilter: "manufacturer" | "distributor" | "retailer"; }

const SupplyChainActorsPage = ({ roleFilter }: Props) => {
  const [actors, setActors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const Icon = icons[roleFilter] || Users;

  const fetchActors = useCallback(async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", roleFilter);
    if (!roles || roles.length === 0) { setActors([]); setLoading(false); return; }
    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds).order("created_at", { ascending: false });
    setActors(profiles || []); setLoading(false);
  }, [roleFilter]);

  useEffect(() => { fetchActors(); }, [fetchActors]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Icon className="h-6 w-6" /> {labels[roleFilter]}</h1>
          <p className="text-sm text-muted-foreground">{actors.length} registered {labels[roleFilter].toLowerCase()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : actors.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground"><Icon className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No {labels[roleFilter].toLowerCase()} registered yet</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {actors.map((a) => (
                      <TableRow key={a.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{a.name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{a.email}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{a.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(a.created_at), "MMM d, yyyy")}</TableCell>
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

export default SupplyChainActorsPage;
