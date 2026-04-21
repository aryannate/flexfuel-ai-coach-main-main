import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";

export type Role = "admin" | "coach" | "trainer" | "athlete" | null;

const ADMIN_EMAIL = "libernest05@gmail.com";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextType {
  user: AppUser | null;
  role: Role;
  supabaseUser: SupaUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Build an AppUser from the Supabase auth user
async function buildUser(su: SupaUser): Promise<AppUser> {
  const email = su.email || "";

  // Fetch role from user_roles
  let role: Role = "athlete";
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", su.id)
    .maybeSingle();
  if (roleData?.role) {
    role = roleData.role as Role;
  }

  // Admin override: if email matches, always admin
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    role = "admin";
  }

  // Fetch profile for display name
  let displayName = email.split("@")[0];
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", su.id)
    .maybeSingle();
  if (profile?.display_name) {
    displayName = profile.display_name;
  }

  const avatar = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { id: su.id, name: displayName, email, role, avatar };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize: check existing session
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !cancelled) {
        setSupabaseUser(session.user);
        try {
          const appUser = await buildUser(session.user);
          if (!cancelled) setUser(appUser);
        } catch {
          // RLS might block — user stays null, will redirect to login
        }
      }
      if (!cancelled) setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          try {
            const appUser = await buildUser(session.user);
            setUser(appUser);
          } catch {
            setUser(null);
          }
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Login failed" };

    const appUser = await buildUser(data.user);
    setSupabaseUser(data.user);
    setUser(appUser);
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        supabaseUser,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
