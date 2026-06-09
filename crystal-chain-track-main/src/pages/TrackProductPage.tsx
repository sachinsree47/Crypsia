import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanLine, Search, ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const TrackProductPage = () => {
  const [productId, setProductId] = useState("");
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const id = productId.trim();
    if (id) navigate(`/trace/${id}`);
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-display font-bold">Track Product</h1>
          <p className="text-sm text-muted-foreground">Enter a product ID to view its supply chain journey</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><ScanLine className="h-5 w-5" /> Product Lookup</CardTitle>
              <CardDescription>Enter the product ID (e.g. PRD-XXXXXX-XXXX) or scan the QR code on the product packaging</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter Product ID..." className="pl-9" value={productId} onChange={(e) => setProductId(e.target.value)} required />
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="hero" type="submit">Track <ArrowRight className="h-4 w-4 ml-1" /></Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ScanLine className="h-10 w-10 mx-auto mb-3 opacity-40" />
              </motion.div>
              <p className="text-sm">You can also scan a product's QR code with your phone camera to go directly to its trace page.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default TrackProductPage;
