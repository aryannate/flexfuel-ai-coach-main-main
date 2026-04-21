import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TrainerDashboard from "./pages/TrainerDashboard";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/trainer" element={<TrainerDashboard />} />
            <Route path="/trainer/athletes" element={<Athletes />} />
            <Route path="/trainer/diet-planner" element={<DietPlanner />} />
            <Route path="/trainer/chat" element={<Chat />} />
            <Route path="/trainer/analytics" element={<Analytics />} />
            <Route path="/trainer/settings" element={<ProfileSettings />} />
            <Route path="/athlete" element={<AthleteDashboard />} />
            <Route path="/athlete/scan" element={<MealScanner />} />
            <Route path="/athlete/diet" element={<AthleteDiet />} />
            <Route path="/athlete/progress" element={<Progress />} />
            <Route path="/athlete/chat" element={<Chat />} />
            <Route path="/athlete/hydration" element={<Hydration />} />
            <Route path="/athlete/schedule" element={<Schedule />} />
            <Route path="/athlete/settings" element={<ProfileSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
