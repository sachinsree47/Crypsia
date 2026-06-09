import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import CreateProductPage from "./pages/CreateProductPage";
import MyProductsPage from "./pages/MyProductsPage";
import DistributorDashboard from "./pages/DistributorDashboard";
import ReceivedProductsPage from "./pages/ReceivedProductsPage";
import TransportUpdatePage from "./pages/TransportUpdatePage";
import RetailerDashboard from "./pages/RetailerDashboard";
import RetailerReceivedProductsPage from "./pages/RetailerReceivedProductsPage";
import RetailUpdatePage from "./pages/RetailUpdatePage";
import BuyProductsPage from "./pages/BuyProductsPage";
import TracePage from "./pages/TracePage";
import AllProductsPage from "./pages/AllProductsPage";
import TrackProductPage from "./pages/TrackProductPage";
import SupplyChainActorsPage from "./pages/SupplyChainActorsPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/trace/:productId" element={<TracePage />} />
              <Route path="/track" element={<TrackProductPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="manufacturer" element={<ManufacturerDashboard />} />
                <Route path="create-product" element={<CreateProductPage />} />
                <Route path="my-products" element={<MyProductsPage />} />
                <Route path="distributor" element={<DistributorDashboard />} />
                <Route path="received-products" element={<ReceivedProductsPage />} />
                <Route path="transport-updates" element={<TransportUpdatePage />} />
                <Route path="retailer" element={<RetailerDashboard />} />
                <Route path="buy-products" element={<BuyProductsPage />} />
                <Route path="retailer-received" element={<RetailerReceivedProductsPage />} />
                <Route path="retail-details" element={<RetailUpdatePage />} />
                <Route path="products" element={<AllProductsPage />} />
                <Route path="track" element={<TrackProductPage />} />
                <Route path="manufacturers" element={<SupplyChainActorsPage roleFilter="manufacturer" />} />
                <Route path="distributors" element={<SupplyChainActorsPage roleFilter="distributor" />} />
                <Route path="retailers" element={<SupplyChainActorsPage roleFilter="retailer" />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
