import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowLeft, Moon, Sun, Building } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { PasswordStrengthIndicator, validatePassword } from "@/components/PasswordStrengthIndicator";

const roles = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "distributor", label: "Distributor" },
  { value: "retailer", label: "Retailer" },
] as const;

const manufacturerTypes = [
  "Food & Beverage", "Pharmaceuticals", "Electronics", "Textiles & Apparel",
  "Automotive Parts", "Agriculture & Farming", "Chemicals & Materials", "Consumer Goods", "Other",
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [manufacturerType, setManufacturerType] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim() || !normalizedEmail || !password.trim() || !role) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password doesn't meet strength requirements");
      return;
    }
    if (!companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }
    if (role === "manufacturer" && !manufacturerType) {
      toast.error("Please select your manufacturer type");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            company_name: companyName.trim(),
            manufacturer_type: role === "manufacturer" ? manufacturerType : "",
            onboarding_complete: false,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Update profile with company details
        await supabase.from("profiles").update({
          company_name: companyName.trim(),
          manufacturer_type: role === "manufacturer" ? manufacturerType : "",
        }).eq("user_id", data.user.id);

        toast.success("Account created! Signing you in...");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) {
          toast.error("Account created but couldn't sign in. Please log in manually.");
          navigate("/login");
        } else {
          navigate("/dashboard");
        }
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <Button variant="ghost" size="icon" onClick={toggleTheme} className="absolute top-4 right-4">
        <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.div>
      </Button>

      <motion.div className="w-full max-w-md relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <motion.div className="text-center mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="h-10 w-10 rounded-lg bg-hero-gradient flex items-center justify-center shadow-glow">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-2xl font-bold">Crypsia</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border shadow-glow">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-xl">Create Account</CardTitle>
              <CardDescription>Join the Crypsia supply chain network</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Strong password required" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => { setRole(v); if (v !== "manufacturer") setManufacturerType(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" /> Company Name
                  </Label>
                  <Input id="companyName" placeholder="Your company or organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required maxLength={200} />
                </div>
                {role === "manufacturer" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                    <Label>Manufacturer Type</Label>
                    <Select value={manufacturerType} onValueChange={setManufacturerType}>
                      <SelectTrigger><SelectValue placeholder="Select manufacturer type" /></SelectTrigger>
                      <SelectContent>
                        {manufacturerTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="hero" className="w-full" type="submit" disabled={loading || !validatePassword(password)}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </motion.div>
              </form>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="text-center mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
