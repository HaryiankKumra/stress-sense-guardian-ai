import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockUsers, mockProfiles } from "@/utils/mockAuth";

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  age?: number;
  weight?: number;
  height?: number;
  blood_type?: string;
  medical_conditions?: string[];
  medications?: string[];
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  stress_threshold_low: number;
  stress_threshold_medium: number;
  stress_threshold_high: number;
  preferred_notification_time?: string;
  activity_level?: string;
  sleep_target_hours: number;
  water_intake_target: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    profileData: Partial<UserProfile>,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionToken = localStorage.getItem("session_token");
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      // Verify session with backend
      const { data, error } = await supabase
        .from("user_sessions")
        .select(
          `
          user_id,
          expires_at,
          auth_users(id, email, full_name)
        `,
        )
        .eq("session_token", sessionToken)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        localStorage.removeItem("session_token");
        setLoading(false);
        return;
      }

      const userData = data.auth_users as any;
      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
      });

      await fetchUserProfile(userData.id);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create default profile
        const defaultProfile = {
          user_id: userId,
          stress_threshold_low: 30,
          stress_threshold_medium: 60,
          stress_threshold_high: 80,
          sleep_target_hours: 8,
          water_intake_target: 2000,
        };

        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert(defaultProfile)
          .select()
          .single();

        if (!createError && newProfile) {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error("Profile error:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Hash password (in production, use proper bcrypt)
      const passwordHash = btoa(password); // Simple base64 encoding for demo

      const { data: userData, error } = await supabase
        .from("auth_users")
        .select("*")
        .eq("email", email)
        .eq("password_hash", passwordHash)
        .single();

      if (error || !userData) {
        return { success: false, error: "Invalid credentials" };
      }

      // Create session
      const sessionToken = btoa(userData.id + ":" + Date.now());
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await supabase.from("user_sessions").insert({
        user_id: userData.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

      localStorage.setItem("session_token", sessionToken);

      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
      });

      await fetchUserProfile(userData.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("auth_users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        return { success: false, error: "Email already exists" };
      }

      // Hash password (in production, use proper bcrypt)
      const passwordHash = btoa(password);

      const { data: newUser, error } = await supabase
        .from("auth_users")
        .insert({
          email,
          password_hash: passwordHash,
          full_name: fullName,
        })
        .select()
        .single();

      if (error || !newUser) {
        return { success: false, error: "Signup failed" };
      }

      // Auto-login after signup
      return await login(email, password);
    } catch (error) {
      return { success: false, error: "Signup failed" };
    }
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem("session_token");
      if (sessionToken) {
        await supabase
          .from("user_sessions")
          .delete()
          .eq("session_token", sessionToken);
      }

      localStorage.removeItem("session_token");
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        return { success: false, error: "Profile update failed" };
      }

      await fetchUserProfile(user.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Profile update failed" };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        signup,
        logout,
        updateProfile,
        refreshProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
