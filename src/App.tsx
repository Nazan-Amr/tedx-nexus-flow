import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Training from "./pages/Training";
import Calendar from "./pages/Calendar";
import Chat from "./pages/Chat";
import Innovation from "./pages/Innovation";
import Feedback from "./pages/Feedback";
import Tools from "./pages/Tools";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import ResetPassword from "./pages/ResetPassword";
import ProtectedLayout from "./components/layouts/ProtectedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Tasks />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Reports />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/training" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Training />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Calendar />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Chat />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/innovation" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Innovation />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Feedback />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tools" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Tools />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requiredRole="management_board">
                <ProtectedLayout>
                  <Analytics />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Users />
                </ProtectedLayout>
              </ProtectedRoute>
            } 
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
