import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import {
  LayoutDashboard, Users, UtensilsCrossed, MessageSquare, BarChart3,
  Camera, Settings, LogOut, Zap, CalendarDays, Activity, Droplets, ClipboardList
} from "lucide-react";

const coachLinks = [
  { to: "/coach", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/coach/scan", icon: Camera, label: "Meal Scanner" },
  { to: "/coach/tracker", icon: ClipboardList, label: "Daily Tracker" },
  { to: "/coach/athletes", icon: Users, label: "Athletes" },
  { to: "/coach/diet-planner", icon: UtensilsCrossed, label: "Diet Planner" },
  { to: "/coach/chat", icon: MessageSquare, label: "Chat" },
  { to: "/coach/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/coach/settings", icon: Settings, label: "Settings" },
];

const athleteLinks = [
  { to: "/athlete", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/athlete/scan", icon: Camera, label: "Meal Scanner" },
  { to: "/athlete/tracker", icon: ClipboardList, label: "Daily Tracker" },
  { to: "/athlete/diet", icon: UtensilsCrossed, label: "My Diet" },
  { to: "/athlete/progress", icon: Activity, label: "Progress" },
  { to: "/athlete/chat", icon: MessageSquare, label: "Chat" },
  { to: "/athlete/hydration", icon: Droplets, label: "Hydration" },
  { to: "/athlete/schedule", icon: CalendarDays, label: "Schedule" },
  { to: "/athlete/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = role === "athlete" ? athleteLinks : coachLinks;

  const handleLogout = () => { logout(); navigate("/login"); };

  const roleLabel = role === "admin" ? "Admin" : role === "coach" ? "Coach" : role === "trainer" ? "Trainer" : "Athlete";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card p-6">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading">Body Artist</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center text-sm font-bold">
              {user?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-heading">Body Artist</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center text-xs font-bold">
            {user?.avatar}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex items-center justify-around bg-primary text-primary-foreground p-2 rounded-t-3xl">
          {links.slice(0, 5).map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${active ? "bg-primary-foreground/20" : ""}`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-[10px]">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
