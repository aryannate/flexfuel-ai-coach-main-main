import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser, Session } from "@supabase/supabase-js";

type Role = "trainer" | "athlete" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (email: string, password: string, role: Role) => Promise<void>;
  signup: (email: string, password: string, name: string, role: "trainer" | "athlete") => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const buildUser = async (supaUser: SupaUser): Promise<User | null> => {
    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", supaUser.id)
      .maybeSingle();

    // Get role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", supaUser.id)
      .maybeSingle();

    const name = profile?.display_name || supaUser.email?.split("@")[0] || "User";
    const role = (roleData?.role as Role) || null;

    return {
      id: supaUser.id,
      name,
      email: supaUser.email || "",
      role,
      avatar: getInitials(name),
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, _role: Role) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, name: string, role: "trainer" | "athlete") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");

    // Create profile and role
    await supabase.from("profiles").insert({
      user_id: data.user.id,
      display_name: name,
    });
    await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: role,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, signup, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
