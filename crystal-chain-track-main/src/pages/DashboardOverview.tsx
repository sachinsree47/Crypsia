import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence } from "framer-motion";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import ManufacturerDashboard from "./ManufacturerDashboard";
import DistributorDashboard from "./DistributorDashboard";
import RetailerDashboard from "./RetailerDashboard";
import AdminDashboard from "./AdminDashboard";

const ONBOARDING_KEY = "crypsia_onboarding_complete";

const DashboardOverview = () => {
  const { role, user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user || !role || loading) return;
    const key = `${ONBOARDING_KEY}_${user.id}`;
    const completed = localStorage.getItem(key);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, [user, role, loading]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, "true");
    }
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-8 w-8 rounded-lg bg-hero-gradient animate-pulse-glow" />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showOnboarding && role && (
          <OnboardingGuide
            role={role as "manufacturer" | "distributor" | "retailer" | "admin"}
            onComplete={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      {(() => {
        switch (role) {
          case "admin":
            return <AdminDashboard />;
          case "manufacturer":
            return <ManufacturerDashboard />;
          case "distributor":
            return <DistributorDashboard />;
          case "retailer":
            return <RetailerDashboard />;
          default:
            return (
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">No dashboard available for your role.</p>
              </div>
            );
        }
      })()}
    </>
  );
};

export default DashboardOverview;
