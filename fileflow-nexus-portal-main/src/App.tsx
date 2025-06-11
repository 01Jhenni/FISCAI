import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import ClientUpload from "./pages/client/Upload";
import ClientSupport from "./pages/client/Support";
import ClientFinancial from "./pages/client/Financial";
import StaffImportsList from "./pages/staff/ImportsList";
import StaffRegisterImport from "./pages/staff/RegisterImport";
import StaffChat from "./pages/staff/Chat";
import StaffSettings from "./pages/staff/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Cliente Routes */}
            <Route path="/cliente" element={<ProtectedRoute userType="client" />}>
              <Route index element={<Navigate to="/cliente/upload" replace />} />
              <Route path="upload" element={<ClientUpload />} />
            </Route>
            
            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute userType="staff" />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="importacoes">
                <Route index element={<StaffImportsList />} />
                <Route path="nova" element={<StaffRegisterImport />} />
              </Route>
              <Route path="chat" element={<StaffChat />} />
              <Route path="configuracoes" element={<StaffSettings />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
