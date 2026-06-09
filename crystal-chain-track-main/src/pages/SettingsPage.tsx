import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings, User, Shield, Save, Trash2, Building } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";

const manufacturerTypes = ["Food & Beverage", "Pharmaceuticals", "Electronics", "Textiles & Apparel", "Automotive Parts", "Agriculture & Farming", "Chemicals & Materials", "Consumer Goods", "Other"];

const SettingsPage = () => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || "");
  const [companyName, setCompanyName] = useState("");
  const [manufacturerType, setManufacturerType] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (profile) setName(profile.name || ""); }, [profile]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("company_name, manufacturer_type").eq("user_id", user.id).single().then(({ data }) => {
      if (data) { setCompanyName(data.company_name || ""); setManufacturerType(data.manufacturer_type || ""); }
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    const updates: Record<string, any> = { name: name.trim(), company_name: companyName.trim() };
    if (role === "manufacturer") updates.manufacturer_type = manufacturerType;
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile updated!");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters with uppercase, lowercase, number, and special character"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast.error(error.message); else { toast.success("Password updated!"); setNewPassword(""); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") { toast.error('Type "DELETE" to confirm'); return; }
    setDeleting(true);
    const { error } = await supabase.from("profiles").delete().eq("user_id", user!.id);
    if (error) { toast.error("Failed to delete account: " + error.message); setDeleting(false); return; }
    await signOut(); toast.success("Account deleted successfully"); navigate("/");
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3"><Label className="w-28 text-muted-foreground">Email</Label><span className="text-sm">{user?.email}</span></div>
              <div className="flex items-center gap-3"><Label className="w-28 text-muted-foreground">Role</Label><Badge variant="secondary" className="capitalize">{role}</Badge></div>
              <div className="space-y-2"><Label htmlFor="name">Display Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
              <div className="space-y-2"><Label htmlFor="companyName">Company Name</Label><Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={200} placeholder="Your company or organization" /></div>
              {role === "manufacturer" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Building className="h-4 w-4" /> Manufacturer Type</Label>
                  <Select value={manufacturerType} onValueChange={setManufacturerType}>
                    <SelectTrigger><SelectValue placeholder="Select manufacturer type" /></SelectTrigger>
                    <SelectContent>{manufacturerTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleSaveProfile} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Profile"}</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="flex gap-2">
                  <Input id="newPassword" type="password" placeholder="Min. 8 characters, strong password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} />
                  <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword}>{changingPassword ? "Updating..." : "Update"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /> Danger Zone</CardTitle>
              <CardDescription>Permanently delete your account and all associated data</CardDescription>
            </CardHeader>
            <CardContent><Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>Delete My Account</Button></CardContent>
          </Card>
        </motion.div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Account</DialogTitle>
              <DialogDescription>This action is permanent and cannot be undone. All your data will be removed.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Type <strong>DELETE</strong> to confirm</Label><Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" /></div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== "DELETE"}>{deleting ? "Deleting..." : "Delete Account"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
