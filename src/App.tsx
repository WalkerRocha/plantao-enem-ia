
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MatematicaDashboard from "./pages/MatematicaDashboard";
import PortuguesDashboard from "./pages/PortuguesDashboard";
import CienciasDashboard from "./pages/CienciasDashboard";
import HumanasDashboard from "./pages/HumanasDashboard";
import ProvasAnterioresDashboard from "./pages/ProvasAnterioresDashboard";
import Redacao from "./pages/Redacao";
import Plans from "./pages/Plans";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentPending from "./pages/PaymentPending";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMatematica from "./pages/AdminMatematica";
import AdminPortugues from "./pages/AdminPortugues";
import AdminCiencias from "./pages/AdminCiencias";
import AdminHumanas from "./pages/AdminHumanas";
import AdminProvasAnteriores from "./pages/AdminProvasAnteriores";
import AdminRedacao from "./pages/AdminRedacao";
import AdminSettings from "./pages/AdminSettings";
import AdminUpload from "./pages/AdminUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <AdminProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/matematica" element={<MatematicaDashboard />} />
                <Route path="/portugues" element={<PortuguesDashboard />} />
                <Route path="/ciencias" element={<CienciasDashboard />} />
                <Route path="/humanas" element={<HumanasDashboard />} />
                <Route path="/provas-anteriores" element={<ProvasAnterioresDashboard />} />
                <Route path="/redacao" element={<Redacao />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failure" element={<PaymentFailure />} />
                <Route path="/payment-pending" element={<PaymentPending />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/matematica" element={<AdminMatematica />} />
                <Route path="/admin/portugues" element={<AdminPortugues />} />
                <Route path="/admin/ciencias" element={<AdminCiencias />} />
                <Route path="/admin/humanas" element={<AdminHumanas />} />
                <Route path="/admin/provas-anteriores" element={<AdminProvasAnteriores />} />
                <Route path="/admin/redacao" element={<AdminRedacao />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/upload" element={<AdminUpload />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
