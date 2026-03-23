import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const AuthPage = lazy(() => import("./pages/AuthPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AgendaPage = lazy(() => import("./pages/AgendaPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Carregando...</div>
  </div>
);

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
        <Route path="/pricing" element={<Suspense fallback={<PageLoader />}><PricingPage /></Suspense>} />
        <Route path="/orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
        <Route path="/inventory" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
        <Route path="/clients" element={<Suspense fallback={<PageLoader />}><ClientsPage /></Suspense>} />
        <Route path="/agenda" element={<Suspense fallback={<PageLoader />}><AgendaPage /></Suspense>} />
        <Route path="/finance" element={<Suspense fallback={<PageLoader />}><FinancePage /></Suspense>} />
        <Route path="/products" element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      <Route path="/landing" element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
      <Route path="/*" element={user ? <ProtectedRoutes /> : <Navigate to="/landing" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
