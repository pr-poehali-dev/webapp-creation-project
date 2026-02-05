
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
import Export from "./pages/Export";
import Import from "./pages/Import";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route path="/client/new" element={<ClientNew />} />
          <Route path="/client/:id" element={<ClientEdit />} />
          <Route path="/export" element={<Export />} />
          <Route path="/import" element={<Import />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;