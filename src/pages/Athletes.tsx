import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Activity} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/integrations/supabase/client";
import AddUserModal from "@/components/AddUserModal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AthleteRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  trainer_id: string | null;
  created_at: string;
}

export default function Athletes() {
  const { user, role } = useAuth();
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const isCoach = role === "admin" || role === "coach";

  const loadAthletes = async () => {
    if (!user) return;
    setLoading(true);

    // Direct athletes
    const { data: direct } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, trainer_id, created_at")
      .eq("trainer_id", user.id);

    let all = direct || [];

    // If coach/admin, also get athletes from trainers
    if (isCoach) {
      const { data: trainers } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("coach_id", user.id);

      if (trainers && trainers.length > 0) {
        const trainerIds = trainers.map(t => t.user_id);
        const { data: indirectAthletes } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, trainer_id, created_at")
          .in("trainer_id", trainerIds);

        if (indirectAthletes) {
          const existing = new Set(all.map(a => a.user_id));
          const newOnes = indirectAthletes.filter(a => !existing.has(a.user_id));
          all = [...all, ...newOnes];
        }
      }
    }

    setAthletes(all);
    setLoading(false);
  };

  useEffect(() => { loadAthletes(); }, [user]);

  const filtered = athletes.filter((a) =>
    (a.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-heading">Athletes</h1>
          <Button onClick={() => setShowAdd(true)} className="rounded-full gap-2">
            <UserPlus className="w-4 h-4" /> Add Athlete
          </Button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search athletes..." className="h-12 rounded-2xl pl-10" />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading athletes...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-3xl p-12 border border-border text-center">
            <p className="font-bold font-heading text-lg mb-2">No athletes found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try a different search" : "Create athlete accounts to get started"}
            </p>
            {!search && (
              <Button onClick={() => setShowAdd(true)} className="rounded-full gap-2">
                <UserPlus className="w-4 h-4" /> Add Athlete
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const avatar = (a.display_name || "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <Link key={a.user_id} to={`/coach/athlete/${a.user_id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-3xl p-5 border border-border flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-pastel-lavender flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{a.display_name || "Athlete"}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        <AddUserModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onCreated={() => loadAthletes()}
          accountType="athlete"
        />
      </div>
    </DashboardLayout>
  );
}
