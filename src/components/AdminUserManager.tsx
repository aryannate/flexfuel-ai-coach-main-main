import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Crown, ArrowRight, Shield, Search, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import AddUserModal from "@/components/AddUserModal";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  trainer_id: string | null;
  coach_id: string | null;
  created_at: string;
}

interface RoleRow {
  user_id: string;
  role: string;
}

export default function AdminUserManager() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<ProfileRow[]>([]);
  const [allAthletes, setAllAthletes] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  
  // Search states
  const [searchAthlete, setSearchAthlete] = useState("");
  const [searchCoach, setSearchCoach] = useState("");

  const [addModal, setAddModal] = useState<"trainer" | "athlete" | null>(null);
  const [assigningAthlete, setAssigningAthlete] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, trainer_id, coach_id, created_at");
    const { data: userRoles } = await supabase.from("user_roles").select("user_id, role");

    if (profiles && userRoles) {
      setRoles(userRoles);
      const roleMap = new Map(userRoles.map((r) => [r.user_id, r.role]));

      const coachList = profiles.filter((p) => {
        const r = roleMap.get(p.user_id);
        return r === "coach" || r === "trainer" || r === "admin";
      });
      setCoaches(coachList);

      const athleteList = profiles.filter((p) => {
        const r = roleMap.get(p.user_id);
        return r === "athlete";
      });
      setAllAthletes(athleteList);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const getRoleBadge = (userId: string) => {
    const r = roles.find((ro) => ro.user_id === userId)?.role;
    if (r === "admin") return { label: "Admin", bg: "bg-red-100 text-red-700" };
    if (r === "coach") return { label: "Coach", bg: "bg-purple-100 text-purple-700" };
    if (r === "trainer") return { label: "Trainer", bg: "bg-blue-100 text-blue-700" };
    return { label: "Athlete", bg: "bg-green-100 text-green-700" };
  };

  const assignAthleteToCoach = async (athleteId: string, coachId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ trainer_id: coachId } as any)
      .eq("user_id", athleteId);

    if (error) { toast.error("Failed to assign athlete"); return; }
    toast.success("Athlete assigned successfully!");
    setAssigningAthlete(null);
    loadAll();
  };

  const unassignAthlete = async (athleteId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ trainer_id: null } as any)
      .eq("user_id", athleteId);

    if (error) { toast.error("Failed to unassign athlete"); return; }
    toast.success("Athlete unassigned");
    loadAll();
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(true);
    try {
      // Get the session to pass Authorization token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { targetUserId: userId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw new Error(error.message || "Failed to delete user");

      toast.success("User permanently deleted.");
      setDeletingUser(null);
      loadAll();
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error(err.message || "Ensure the Edge Function 'delete-user' is deployed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const avatar = (name: string | null) => (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  // Filters
  const filteredAthletes = allAthletes.filter((a) => (a.display_name || "").toLowerCase().includes(searchAthlete.toLowerCase()));
  const filteredCoaches = coaches.filter((c) => (c.display_name || "").toLowerCase().includes(searchCoach.toLowerCase()));

  const unassigned = filteredAthletes.filter((a) => !a.trainer_id);
  const coachGroups = filteredCoaches.map((c) => ({
    coach: c,
    athletes: filteredAthletes.filter((a) => a.trainer_id === c.user_id),
  }));

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading user management...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> System User Management
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => setAddModal("trainer")} variant="outline" className="rounded-full gap-2 text-xs h-9">
            <Crown className="w-4 h-4" /> Add Coach
          </Button>
          <Button onClick={() => setAddModal("athlete")} className="rounded-full gap-2 text-xs h-9">
            <UserPlus className="w-4 h-4" /> Add Athlete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchCoach} onChange={(e) => setSearchCoach(e.target.value)} placeholder="Search coaches/admins..." className="h-10 rounded-xl pl-9 text-sm" />
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchAthlete} onChange={(e) => setSearchAthlete(e.target.value)} placeholder="Search athletes..." className="h-10 rounded-xl pl-9 text-sm" />
        </div>
      </div>

      {/* Unassigned Athletes */}
      {unassigned.length > 0 && (
        <div className="bg-pastel-yellow/30 rounded-3xl p-5 border border-yellow-200">
          <h3 className="font-bold font-heading text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Unassigned Athletes ({unassigned.length})
            {searchAthlete && <span className="opacity-50 font-normal ml-2">matching '{searchAthlete}'</span>}
          </h3>
          <div className="grid lg:grid-cols-2 gap-2">
            {unassigned.map((a) => (
              <div key={a.user_id} className="bg-card rounded-2xl p-3 flex items-center gap-3 border border-border shadow-sm">
                <div className="w-9 h-9 rounded-full bg-pastel-pink flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {avatar(a.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{a.display_name || "Athlete"}</p>
                </div>

                {assigningAthlete === a.user_id ? (
                  <div className="flex items-center gap-2">
                    <select
                      className="text-xs rounded-xl border border-border px-2 py-1 bg-card"
                      onChange={(e) => { if (e.target.value) assignAthleteToCoach(a.user_id, e.target.value); }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Coach...</option>
                      {coaches.map((c) => (
                        <option key={c.user_id} value={c.user_id}>{c.display_name || "Coach"}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => setAssigningAthlete(null)} className="h-7 text-xs px-2">Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => setAssigningAthlete(a.user_id)} className="rounded-xl h-7 px-3 text-[10px] gap-1">
                      <ArrowRight className="w-3 h-3" /> Assign
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeletingUser(a.user_id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaches Logic */}
      <div className="space-y-4">
        {coachGroups.map(({ coach, athletes }) => {
          const badge = getRoleBadge(coach.user_id);
          const isMe = coach.user_id === user?.id;
          
          return (
            <div key={coach.user_id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-pastel-lavender/40 to-transparent flex flex-wrap items-center justify-between gap-4 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pastel-lavender flex items-center justify-center font-bold text-sm shadow-sm">
                    {avatar(coach.display_name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{coach.display_name || "Coach"}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${badge.bg}`}>{badge.label}</span>
                      {isMe && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary text-primary-foreground">YOU</span>}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5">{athletes.length} Active Athlete{athletes.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <select
                      className="text-xs font-medium rounded-xl border border-border/60 shadow-sm px-3 py-2 bg-background hover:bg-secondary/50 cursor-pointer transition-colors max-w-[140px]"
                      onChange={(e) => {
                        if (e.target.value) {
                          assignAthleteToCoach(e.target.value, coach.user_id);
                          e.target.value = ""; 
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add Athlete...</option>
                      {allAthletes.filter(a => a.trainer_id !== coach.user_id).map((a) => (
                        <option key={a.user_id} value={a.user_id}>
                          {a.display_name} {a.trainer_id ? `(Move from Coach)` : `(Unassigned)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!isMe && (
                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 outline-none" onClick={() => setDeletingUser(coach.user_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Athletes under coach */}
              <div className="p-2 sm:p-4 bg-background/50">
                {athletes.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground font-medium py-4">No athletes assigned to this coach yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {athletes.map((a) => (
                      <motion.div key={a.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-3 bg-card border border-border shadow-sm rounded-2xl group hover:border-primary/20 transition-all">
                        <div className="w-10 h-10 rounded-full bg-pastel-sage/50 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {avatar(a.display_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{a.display_name || "Athlete"}</p>
                          <Link to={`/coach/athlete/${a.user_id}`} className="text-[10px] sm:text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5">
                            <ExternalLink className="w-3 h-3" /> View Dashboard
                          </Link>
                        </div>

                        <div className="flex flex-col gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {assigningAthlete === a.user_id ? (
                            <select
                              className="text-[10px] p-1 rounded border absolute right-2 bg-card shadow-sm z-10"
                              onChange={(e) => {
                                if (e.target.value === "__unassign") unassignAthlete(a.user_id);
                                else if (e.target.value) assignAthleteToCoach(a.user_id, e.target.value);
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Move...</option>
                              <option value="__unassign">🚫 Unassign</option>
                              {coaches.filter(c => c.user_id !== coach.user_id).map(c => (
                                <option key={c.user_id} value={c.user_id}>{c.display_name}</option>
                              ))}
                            </select>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setAssigningAthlete(a.user_id)} className="h-6 w-full text-[10px] px-2 hover:bg-secondary">
                              Reassign
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setDeletingUser(a.user_id)} className="h-6 w-full text-[10px] px-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {coachGroups.length === 0 && <p className="text-center text-muted-foreground py-10 font-medium">No coaches match that search.</p>}
      </div>

      <AddUserModal open={addModal !== null} onClose={() => setAddModal(null)} onCreated={() => loadAll()} accountType={addModal || "athlete"} />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto text-red-600">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold font-heading text-center mb-2">Delete User?</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Are you absolutely sure? This will instantly wipe out this user, all their profiles, and all their meals forever. This action <strong>cannot be undone.</strong>
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-2xl h-11" onClick={() => setDeletingUser(null)} disabled={isDeleting}>Cancel</Button>
                <Button className="flex-1 rounded-2xl h-11 border-none font-bold" variant="destructive" onClick={() => handleDeleteUser(deletingUser)} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
