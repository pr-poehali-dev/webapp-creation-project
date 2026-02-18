import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Matrices from "./pages/Matrices";
import MatrixNew from "./pages/MatrixNew";
import MatrixEdit from "./pages/MatrixEdit";
import MatrixView from "./pages/MatrixView";
import Clients from "./pages/Clients";
import ClientNew from "./pages/ClientNew";
import ClientEdit from "./pages/ClientEdit";
import ClientsDeleted from "./pages/ClientsDeleted";
import Export from "./pages/Export";
import Import from "./pages/Import";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import TelegramLink from "./pages/TelegramLink";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrganizationTeam from "./pages/AdminOrganizationTeam";
import NotFound from "./pages/NotFound";
import FirstLoginPasswordModal from "./components/FirstLoginPasswordModal";
import OfflineBanner from "./components/OfflineBanner";
import PwaInstallPrompt from "./components/PwaInstallPrompt";

const queryClient = new QueryClient();

const App = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.password_change_required === true) {
          setShowPasswordModal(true);
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineBanner />
        <PwaInstallPrompt />
        <FirstLoginPasswordModal open={showPasswordModal} onSuccess={handlePasswordChangeSuccess} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/matrices" element={<Matrices />} />
            <Route path="/matrix/new" element={<MatrixNew />} />
            <Route path="/matrix/:id" element={<MatrixEdit />} />
            <Route path="/matrix/:id/view" element={<MatrixView />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/deleted" element={<ClientsDeleted />} />
            <Route path="/client/new" element={<ClientNew />} />
            <Route path="/client/:id" element={<ClientEdit />} />
            <Route path="/export" element={<Export />} />
            <Route path="/import" element={<Import />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/telegram-link" element={<TelegramLink />} />
            <Route path="/crmadminauth" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-organization-team/:orgId" element={<AdminOrganizationTeam />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;