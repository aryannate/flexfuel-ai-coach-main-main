import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  accountType: "trainer" | "athlete";
}

export default function AddUserModal({ open, onClose, onCreated, accountType }: Props) {
  const { user, role } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [coaches, setCoaches] = useState<{ user_id: string; display_name: string | null }[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState("");

  const isAdmin = role === "admin";

  // Load coaches for assignment dropdown (admin creating athletes)
  useEffect(() => {
    if (!open || !isAdmin || accountType !== "athlete") return;
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      if (profiles && roles) {
        const coachIds = new Set(roles.filter(r => r.role === "coach" || r.role === "trainer").map(r => r.user_id));
        setCoaches(profiles.filter(p => coachIds.has(p.user_id)));
      }
    })();
  }, [open, isAdmin, accountType]);

  const handleCreate = async () => {
    if (!displayName || !username || !password || !user) {
      toast.error("Please fill all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const fakeEmail = `${username.toLowerCase().replace(/\s+/g, "")}@bodyartist.local`;

      // *** CRITICAL: Save admin session BEFORE signUp ***
      const { data: { session: adminSession } } = await supabase.auth.getSession();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      // *** CRITICAL: Restore admin session immediately ***
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error("Username already taken. Try a different one.");
        } else {
          toast.error(signUpError.message);
        }
        setLoading(false);
        return;
      }

      const newUserId = signUpData.user?.id;
      if (!newUserId) {
        toast.error("Failed to create account");
        setLoading(false);
        return;
      }

      // Insert role
      await supabase.from("user_roles").insert({
        user_id: newUserId,
        role: accountType,
      } as any);

      // Insert profile
      const profileData: any = {
        user_id: newUserId,
        display_name: displayName,
      };

      if (accountType === "trainer") {
        profileData.coach_id = user.id;
      } else if (accountType === "athlete") {
        profileData.trainer_id = (isAdmin && selectedCoachId) ? selectedCoachId : user.id;
      }

      await supabase.from("profiles").insert(profileData);

      setCreated({ email: fakeEmail, password });
      toast.success(`${accountType === "trainer" ? "Coach/Trainer" : "Athlete"} account created!`);
      onCreated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDisplayName("");
    setUsername("");
    setPassword("");
    setCreated(null);
    setSelectedCoachId("");
    onClose();
  };

  if (!open) return null;

  const typeLabel = accountType === "trainer" ? "Coach / Trainer" : "Athlete";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-3xl border border-border p-8 w-full max-w-md shadow-2xl"
        >
          {created ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-pastel-sage flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-heading">Account Created!</h2>
              <p className="text-sm text-muted-foreground">Share these credentials with the {typeLabel}:</p>

              <div className="bg-secondary rounded-2xl p-4 text-left space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Login Email</p>
                  <p className="font-mono text-sm font-bold">{created.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="font-mono text-sm font-bold">{created.password}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">⚠️ Save these credentials now — the password cannot be recovered later.</p>
              <Button onClick={handleClose} className="rounded-2xl w-full">Done</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add {typeLabel}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Rahul Sharma" className="h-12 rounded-2xl" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Username</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. rahul_sharma" className="h-12 rounded-2xl" />
                  <p className="text-xs text-muted-foreground mt-1">Login: {username ? `${username.toLowerCase().replace(/\s+/g, "")}@bodyartist.local` : "..."}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="h-12 rounded-2xl pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin: assign athlete to a specific coach */}
                {isAdmin && accountType === "athlete" && coaches.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Assign to Coach</label>
                    <select value={selectedCoachId} onChange={(e) => setSelectedCoachId(e.target.value)} className="w-full h-12 rounded-2xl border border-border bg-card px-4 text-sm">
                      <option value="">Assign to me (Admin)</option>
                      {coaches.map((c) => (
                        <option key={c.user_id} value={c.user_id}>{c.display_name || "Coach"}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full rounded-2xl h-12 gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                {loading ? "Creating..." : `Create ${typeLabel} Account`}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
