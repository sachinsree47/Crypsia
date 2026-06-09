import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package, Truck, Store, Shield, BarChart3, QrCode,
  ArrowRight, ArrowLeft, Sparkles, CheckCircle2, X
} from "lucide-react";

type AppRole = "manufacturer" | "distributor" | "retailer" | "admin";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const roleSteps: Record<AppRole, Step[]> = {
  manufacturer: [
    { icon: <Sparkles className="h-8 w-8" />, title: "Welcome, Manufacturer!", description: "You're now part of the Crypsia supply chain network. Let's walk you through your key capabilities." },
    { icon: <Package className="h-8 w-8" />, title: "Create Products", description: "Go to 'Create Product' to register new products with batch numbers, production dates, and factory locations. Each product gets a unique ID for tracing." },
    { icon: <QrCode className="h-8 w-8" />, title: "QR Codes & Blockchain", description: "Every product is recorded on the blockchain for tamper-proof traceability. Share QR codes so anyone can verify authenticity." },
    { icon: <BarChart3 className="h-8 w-8" />, title: "Track Your Products", description: "Use 'My Products' to monitor all your items as they move through distributors and retailers. Your dashboard shows real-time stats." },
    { icon: <CheckCircle2 className="h-8 w-8" />, title: "You're All Set!", description: "Head to your dashboard to start creating products. Visit Settings anytime to update your profile or company details." },
  ],
  distributor: [
    { icon: <Sparkles className="h-8 w-8" />, title: "Welcome, Distributor!", description: "You play a critical role in the supply chain. Let's show you how to manage shipments and logistics." },
    { icon: <Truck className="h-8 w-8" />, title: "Receive Products", description: "Go to 'Received Products' to view and accept products sent to you by manufacturers. Update their status as they arrive." },
    { icon: <Package className="h-8 w-8" />, title: "Transport Updates", description: "Log transport details like vehicle info, route notes, and temperature data. This creates a complete chain of custody." },
    { icon: <BarChart3 className="h-8 w-8" />, title: "Monitor Shipments", description: "Your dashboard gives you an overview of all active shipments, pending deliveries, and completed transfers." },
    { icon: <CheckCircle2 className="h-8 w-8" />, title: "Ready to Go!", description: "Check your dashboard for incoming products. Visit Settings to update your company information anytime." },
  ],
  retailer: [
    { icon: <Sparkles className="h-8 w-8" />, title: "Welcome, Retailer!", description: "You're the final link in the supply chain. Let's explore how to manage products at your store." },
    { icon: <Store className="h-8 w-8" />, title: "Buy & Receive Products", description: "Browse available products in 'Buy Products' and receive items from distributors. Track everything in 'Received Products'." },
    { icon: <Package className="h-8 w-8" />, title: "Retail Details", description: "Add shelf locations, storage conditions, pricing, and display notes. This information is visible to customers via QR codes." },
    { icon: <QrCode className="h-8 w-8" />, title: "Customer Verification", description: "Customers can scan QR codes to see the full journey of any product — from manufacturer to your shelf." },
    { icon: <CheckCircle2 className="h-8 w-8" />, title: "All Done!", description: "Your dashboard is ready. Start by browsing available products. Update your profile in Settings anytime." },
  ],
  admin: [
    { icon: <Sparkles className="h-8 w-8" />, title: "Welcome, Admin!", description: "You have full access to the Crypsia platform. Let's walk through your management capabilities." },
    { icon: <Shield className="h-8 w-8" />, title: "User Management", description: "View all manufacturers, distributors, and retailers. Monitor their activities and manage the supply chain network." },
    { icon: <BarChart3 className="h-8 w-8" />, title: "Platform Overview", description: "Your dashboard provides comprehensive analytics — total products, active users, blockchain events, and more." },
    { icon: <CheckCircle2 className="h-8 w-8" />, title: "You're Ready!", description: "Explore the full platform from your admin dashboard. All data is available for review and management." },
  ],
};

interface OnboardingGuideProps {
  role: AppRole;
  onComplete: () => void;
}

export const OnboardingGuide = ({ role, onComplete }: OnboardingGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = roleSteps[role] || roleSteps.retailer;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(0, s - 1));
  const handleSkip = () => onComplete();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-border shadow-glow overflow-hidden">
          <CardContent className="p-0">
            {/* Progress bar */}
            <div className="flex gap-1 p-4 pb-0">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Skip button */}
            <div className="flex justify-end px-4 pt-2">
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground text-xs">
                <X className="h-3 w-3 mr-1" /> Skip tour
              </Button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 min-h-[250px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {steps[currentStep].icon}
                  </motion.div>
                  <h3 className="text-xl font-display font-bold">{steps[currentStep].title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentStep === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="hero" size="sm" onClick={handleNext}>
                  {isLast ? "Get Started" : "Next"} {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
