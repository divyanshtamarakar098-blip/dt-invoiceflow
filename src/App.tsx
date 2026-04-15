import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Reminders from "./pages/Reminders";
import Analytics from "./pages/Analytics";
import Pricing from "./pages/Pricing";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SubscriptionProvider>
          <InvoiceProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Index />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/install" element={<Install />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </InvoiceProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
