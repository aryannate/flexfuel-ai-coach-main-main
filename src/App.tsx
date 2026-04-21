import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/authContext";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import CoachDashboard from "./pages/CoachDashboard";
import AthleteDashboard from "./pages/AthleteDashboard";
import MealScanner from "./pages/MealScanner";
import Chat from "./pages/Chat";
import DietPlanner from "./pages/DietPlanner";
import Analytics from "./pages/Analytics";
import ProfileSettings from "./pages/ProfileSettings";
import Progress from "./pages/Progress";
import Athletes from "./pages/Athletes";
import Hydration from "./pages/Hydration";
import Schedule from "./pages/Schedule";
import AthleteDiet from "./pages/AthleteDiet";
import DailyTracker from "./pages/DailyTracker";
import AthleteDetail from "./pages/AthleteDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route: redirects to login if not authenticated
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their correct dashboard
    if (role === "admin" || role === "coach" || role === "trainer") {
      return <Navigate to="/coach" replace />;
    }
    return <Navigate to="/athlete" replace />;
  }

  return <>{children}</>;
}

// Auto-redirect "/" based on auth state and role
function HomeRedirect() {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Landing />;

  if (role === "admin" || role === "coach" || role === "trainer") {
    return <Navigate to="/coach" replace />;
  }
  return <Navigate to="/athlete" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />

            {/* Coach/Trainer/Admin routes */}
            <Route path="/coach" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><CoachDashboard /></ProtectedRoute>} />
            <Route path="/coach/athletes" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><Athletes /></ProtectedRoute>} />
            <Route path="/coach/athlete/:athleteId" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><AthleteDetail /></ProtectedRoute>} />
            <Route path="/coach/diet-planner" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><DietPlanner /></ProtectedRoute>} />
            <Route path="/coach/chat" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><Chat /></ProtectedRoute>} />
            <Route path="/coach/analytics" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><Analytics /></ProtectedRoute>} />
            <Route path="/coach/scan" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><MealScanner /></ProtectedRoute>} />
            <Route path="/coach/tracker" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><DailyTracker /></ProtectedRoute>} />
            <Route path="/coach/settings" element={<ProtectedRoute allowedRoles={["admin", "coach", "trainer"]}><ProfileSettings /></ProtectedRoute>} />

            {/* Athlete routes */}
            <Route path="/athlete" element={<ProtectedRoute allowedRoles={["athlete"]}><AthleteDashboard /></ProtectedRoute>} />
            <Route path="/athlete/scan" element={<ProtectedRoute><MealScanner /></ProtectedRoute>} />
            <Route path="/athlete/tracker" element={<ProtectedRoute><DailyTracker /></ProtectedRoute>} />
            <Route path="/athlete/diet" element={<ProtectedRoute allowedRoles={["athlete"]}><AthleteDiet /></ProtectedRoute>} />
            <Route path="/athlete/progress" element={<ProtectedRoute allowedRoles={["athlete"]}><Progress /></ProtectedRoute>} />
            <Route path="/athlete/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/athlete/hydration" element={<ProtectedRoute allowedRoles={["athlete"]}><Hydration /></ProtectedRoute>} />
            <Route path="/athlete/schedule" element={<ProtectedRoute allowedRoles={["athlete"]}><Schedule /></ProtectedRoute>} />
            <Route path="/athlete/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
