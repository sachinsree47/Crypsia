import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { blockchainService, hashProductData } from "@/services/blockchain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Link2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition, fadeInUp } from "@/components/PageTransition";

const generateProductId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRD-${timestamp}-${random}`;
};

const CreateProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [form, setForm] = useState({ productName: "", batchNumber: "", productionDate: "", quantity: 1, factoryLocation: "", imageUrl: "" });
  const updateField = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

  const connectWallet = async () => {
    try { await blockchainService.connect(); setWalletConnected(true); toast.success("Wallet connected!"); }
    catch (err: any) { toast.error(err.message || "Failed to connect wallet"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.productName.trim() || !form.batchNumber.trim() || !form.productionDate || !form.factoryLocation.trim()) { toast.error("Please fill in all required fields"); return; }
    if (form.quantity < 1) { toast.error("Quantity must be at least 1"); return; }
    setLoading(true);
    const productId = generateProductId();
    const qrCodeUrl = `${window.location.origin}/trace/${productId}`;
    let blockchainTxHash: string | null = null;

    if (walletConnected) {
      try {
        const productHash = hashProductData({ productId, productName: form.productName.trim(), batchNumber: form.batchNumber.trim(), productionDate: form.productionDate, quantity: form.quantity, factoryLocation: form.factoryLocation.trim() });
        const txResult = await blockchainService.registerProduct(productId, productHash);
        blockchainTxHash = txResult.txHash;
        await supabase.from("blockchain_events").insert({ product_id: productId, event_type: "registerProduct", stage: "Created at Manufacturer", actor_address: txResult.actorAddress, tx_hash: txResult.txHash, product_hash: productHash, block_number: txResult.blockNumber, network: txResult.network });
        toast.success("Product registered on blockchain!");
      } catch (err: any) { toast.error(`Blockchain error: ${err.message}`); setLoading(false); return; }
    }

    const { error } = await supabase.from("products").insert({ product_id: productId, product_name: form.productName.trim(), batch_number: form.batchNumber.trim(), production_date: form.productionDate, quantity: form.quantity, factory_location: form.factoryLocation.trim(), image_url: form.imageUrl.trim() || null, qr_code_url: qrCodeUrl, manufacturer_id: user.id, status: "Created at Manufacturer", blockchain_tx_hash: blockchainTxHash });
    setLoading(false);
    if (error) { toast.error(error.message); } else { toast.success(`Product batch ${productId} created successfully!`); navigate("/dashboard/my-products"); }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="icon" asChild><Link to="/dashboard/my-products"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Create Product Batch</h1>
            <p className="text-sm text-muted-foreground">Register a new product batch on the supply chain</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><Link2 className="h-5 w-5" /> Blockchain Verification</CardTitle>
              <CardDescription>Connect your wallet to register the product on-chain</CardDescription>
            </CardHeader>
            <CardContent>
              {walletConnected ? (
                <div className="flex items-center gap-2 text-sm text-primary"><Wallet className="h-4 w-4" /><span className="font-medium">Wallet connected — product will be registered on blockchain</span></div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={connectWallet} type="button"><Wallet className="h-4 w-4 mr-2" /> Connect Wallet</Button>
                  <span className="text-xs text-muted-foreground">Optional — product can be created without blockchain</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Product Details</CardTitle>
              <CardDescription>A unique product ID and QR code will be generated automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="productName">Product Name *</Label><Input id="productName" placeholder="e.g. Organic Coffee Beans" value={form.productName} onChange={(e) => updateField("productName", e.target.value)} required maxLength={200} /></div>
                  <div className="space-y-2"><Label htmlFor="batchNumber">Batch Number *</Label><Input id="batchNumber" placeholder="e.g. BATCH-2026-001" value={form.batchNumber} onChange={(e) => updateField("batchNumber", e.target.value)} required maxLength={100} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="productionDate">Production Date *</Label><Input id="productionDate" type="date" value={form.productionDate} onChange={(e) => updateField("productionDate", e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="quantity">Quantity *</Label><Input id="quantity" type="number" min={1} value={form.quantity} onChange={(e) => updateField("quantity", parseInt(e.target.value) || 1)} required /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="factoryLocation">Factory Location *</Label><Input id="factoryLocation" placeholder="e.g. São Paulo, Brazil" value={form.factoryLocation} onChange={(e) => updateField("factoryLocation", e.target.value)} required maxLength={300} /></div>
                <div className="space-y-2"><Label htmlFor="imageUrl">Product Image URL (optional)</Label><Input id="imageUrl" type="url" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} maxLength={500} /></div>
                <div className="flex gap-3 pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="hero" type="submit" disabled={loading}>{loading ? "Creating..." : walletConnected ? "Create & Register On-Chain" : "Create Product Batch"}</Button>
                  </motion.div>
                  <Button variant="outline" type="button" asChild><Link to="/dashboard/my-products">Cancel</Link></Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default CreateProductPage;
