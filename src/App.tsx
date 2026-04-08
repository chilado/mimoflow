import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { lazy, Suspense, memo } from "react";

// Lazy loading para melhor performance
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
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const PlanPage = lazy(() => import("./pages/PlanPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
    <div className="animate-pulse text-muted-foreground">Carregando...</div>
  </div>
));
PageLoader.displayName = 'PageLoader';

const AppRoutes = memo(() => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rotas públicas específicas */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/mimo-painel-admin" element={<AdminPanelPage />} />
        
        {/* Rotas protegidas */}
        {user ? (
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/plan" element={<PlanPage />} />
          </Route>
        ) : (
          <Route path="/" element={<Navigate to="/landing" replace />} />
        )}
        
        {/* Rota do catálogo - deve ser a última para não capturar outras rotas */}
        <Route path="/:slug" element={<CatalogPage />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
});
AppRoutes.displayName = 'AppRoutes';

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
));
App.displayName = 'App';

export default App;
