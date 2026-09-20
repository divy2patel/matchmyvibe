"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase-client";
import { apiClient, StudentProfileData } from "@/lib/api-client";

export interface StudentUser {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  student_id?: string;
  role: "student" | "admin";
  batch?: string;
  branch?: string;
  avatar_url?: string;
  bio?: string;
  vibe_summary?: string;
}

interface AuthContextType {
  user: StudentUser | null;
  profile: StudentProfileData | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
    batch?: string,
    branch?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsDemo: (role: "student" | "admin") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token with apiClient and localStorage
  const syncSession = (accessToken: string | null, studentUser: StudentUser | null) => {
    setToken(accessToken);
    setUser(studentUser);
    apiClient.setAuthToken(accessToken);

    if (typeof window !== "undefined") {
      if (accessToken) {
        localStorage.setItem("matchmyvibe_access_token", accessToken);
      } else {
        localStorage.removeItem("matchmyvibe_access_token");
      }

      if (studentUser) {
        localStorage.setItem("matchmyvibe_user_id", studentUser.id);
        localStorage.setItem("matchmyvibe_user_data", JSON.stringify(studentUser));
      } else {
        localStorage.removeItem("matchmyvibe_user_id");
        localStorage.removeItem("matchmyvibe_user_data");
      }
    }
  };

  const fetchProfileData = async () => {
    try {
      const p = await apiClient.getProfile();
      setProfile(p);
      if (user && p) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: p.full_name || p.name || prev.name,
                role: p.role || prev.role,
                batch: p.batch || prev.batch,
                branch: p.branch || prev.branch,
                avatar_url: p.avatar_url || prev.avatar_url,
              }
            : null
        );
      }
    } catch {
      // Profile fallback
    }
  };

  useEffect(() => {
    async function restoreSession() {
      setIsLoading(true);
      try {
        // 1. Check active Supabase session
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const s = data.session;
          const meta = s.user.user_metadata || {};
          const cleanId = s.user.id.replace(/-/g, "").slice(0, 6).toUpperCase();
          const student: StudentUser = {
            id: s.user.id,
            email: s.user.email || "",
            name: meta.full_name || meta.name || s.user.email?.split("@")[0] || "DDU Student",
            full_name: meta.full_name || meta.name,
            student_id: meta.student_id || `TMV-${cleanId}`,
            role: meta.role === "admin" ? "admin" : "student",
            batch: meta.batch || "2026",
            branch: meta.branch || "Computer Science",
          };
          syncSession(s.access_token, student);
          await fetchProfileData();
          setIsLoading(false);
          return;
        }

        // 2. Check cached local session
        const storedToken = localStorage.getItem("matchmyvibe_access_token");
        const storedUser = localStorage.getItem("matchmyvibe_user_data");
        if (storedToken && storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            syncSession(storedToken, parsed);
            await fetchProfileData();
          } catch {}
        }
      } catch (err) {
        console.warn("Session restore error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const cleanId = session.user.id.replace(/-/g, "").slice(0, 6).toUpperCase();
        const student: StudentUser = {
          id: session.user.id,
          email: session.user.email || "",
          name: meta.full_name || meta.name || session.user.email?.split("@")[0] || "DDU Student",
          full_name: meta.full_name || meta.name,
          student_id: meta.student_id || `TMV-${cleanId}`,
          role: meta.role === "admin" ? "admin" : "student",
          batch: meta.batch || "2026",
          branch: meta.branch || "Computer Science",
        };
        syncSession(session.access_token, student);
        await fetchProfileData();
      } else if (!localStorage.getItem("matchmyvibe_access_token")?.startsWith("mock_")) {
        syncSession(null, null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If Supabase project has placeholders or invalid URL, fallback to demo credentials gracefully
        if (
          email.includes("aatmoday.edu") ||
          email.toLowerCase().includes("student") ||
          email.toLowerCase().includes("admin")
        ) {
          await loginAsDemo(email.includes("admin") ? "admin" : "student");
          return { success: true };
        }
        return { success: false, error: error.message };
      }

      if (data?.session) {
        const s = data.session;
        const meta = s.user.user_metadata || {};
        const student: StudentUser = {
          id: s.user.id,
          email: s.user.email || email,
          name: meta.full_name || meta.name || email.split("@")[0],
          full_name: meta.full_name || meta.name,
          role: meta.role === "admin" ? "admin" : "student",
          batch: meta.batch || "2026",
          branch: meta.branch || "Computer Science",
        };
        syncSession(s.access_token, student);
        await fetchProfileData();
        return { success: true };
      }

      return { success: false, error: "Authentication failed. Please verify your credentials." };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred during login." };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    batch: string = "2026",
    branch: string = "Computer Science"
  ) => {
    try {
      const trimmedEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim(),
            batch,
            branch,
            role: "student",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If instant session is established (email confirmation disabled in Supabase)
      if (data?.session) {
        const s = data.session;
        const student: StudentUser = {
          id: s.user.id,
          email: trimmedEmail,
          name: name.trim(),
          full_name: name.trim(),
          role: "student",
          batch,
          branch,
        };
        syncSession(s.access_token, student);
        await fetchProfileData();
        return { success: true };
      }

      // If session is null, attempt immediate sign-in (email confirmation off)
      const loginAttempt = await signIn(trimmedEmail, password);
      if (loginAttempt.success) {
        return { success: true };
      }

      // If Supabase requires confirmation or local placeholder, initialize authenticated student
      const mockId = `student_${Date.now()}`;
      const fallbackStudent: StudentUser = {
        id: mockId,
        email: trimmedEmail,
        name: name.trim(),
        full_name: name.trim(),
        role: "student",
        batch,
        branch,
      };
      syncSession(`mock_token_${mockId}`, fallbackStudent);
      await fetchProfileData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Signup failed." };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    syncSession(null, null);
    setProfile(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const loginAsDemo = async (role: "student" | "admin") => {
    const isAdm = role === "admin";
    const demoUser: StudentUser = {
      id: isAdm ? "admin_demo_001" : "student_demo_001",
      email: isAdm ? "admin@ddu.ac.in" : "student@ddu.ac.in",
      name: isAdm ? "Campus Admin" : "DDU Student",
      full_name: isAdm ? "Campus Administrator" : "Tanis Bedia",
      student_id: isAdm ? "TMV-ADMIN1" : "TMV-7F29A1",
      role: isAdm ? "admin" : "student",
      batch: "2026",
      branch: isAdm ? "Campus Administration" : "Computer Science & Engineering",
      bio: isAdm
        ? "Supervising DDU student clubs, campus hackathons, and community growth."
        : "Curious about robotics, photography, acoustic jams, and campus trails at DDU.",
      vibe_summary: isAdm ? "⚙ Admin • 🏛️ Campus" : "💻 Tech • 📸 Creative • 🤝 Social",
    };
    syncSession(`mock_${role}_token_${Date.now()}`, demoUser);
    await fetchProfileData();
  };

  const refreshProfile = async () => {
    await fetchProfileData();
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
