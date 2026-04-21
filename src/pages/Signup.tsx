import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/authContext";
import { toast } from "sonner";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"trainer" | "athlete">("athlete");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(email, password, name, role);
      toast.success("Account created! Welcome to Body Artist 🎉");
      navigate(role === "trainer" ? "/trainer" : "/athlete");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold font-heading">Body Artist</span>
        </Link>

        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
          <h1 className="text-2xl font-bold font-heading mb-2">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-8">Start your 14-day free trial</p>

          <div className="flex gap-2 mb-6">
            {(["athlete", "trainer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${role === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {r === "trainer" ? "Trainer" : "Athlete"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-2xl" required />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-2xl" required />
            <Input placeholder="Password (min 6 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-2xl" required minLength={6} />
            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-2xl text-base">
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
