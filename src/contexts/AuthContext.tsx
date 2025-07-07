
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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Handle Supabase auth user
          const supabaseUser = session.user;
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
          });
          await fetchUserProfile(supabaseUser.id);
        } else {
          // Check for custom auth
          await checkAuthStatus();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const supabaseUser = session.user;
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
        });
        await fetchUserProfile(supabaseUser.id);
        setLoading(false);
        return;
      }

      // Check custom auth session
      const sessionToken = localStorage.getItem("session_token");
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      // Check for mock user first
      const mockUser = localStorage.getItem("mock_user");
      if (mockUser) {
        try {
          const userData = JSON.parse(mockUser);
          setUser({
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
          });

          // Set mock profile
          const mockProfile = mockProfiles.find(
            (p) => p.user_id === userData.id,
          );
          if (mockProfile) {
            setProfile(mockProfile);
          }

          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem("mock_user");
        }
      }

      // Try custom auth session verification
      try {
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

        if (!error && data) {
          const userData = data.auth_users as any;
          setUser({
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
          });

          await fetchUserProfile(userData.id);
          setLoading(false);
          return;
        }
      } catch (supabaseError) {
        console.log("Custom auth session check failed:", supabaseError);
      }

      // Clean up invalid session
      localStorage.removeItem("session_token");
      localStorage.removeItem("mock_user");
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

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Google login failed" };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Try Supabase auth first
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!supabaseError && supabaseData.user) {
        // Supabase auth success - state will be updated by onAuthStateChange
        return { success: true };
      }

      // Fallback to custom auth
      const passwordHash = btoa(password);

      // Try custom auth database first
      try {
        const { data: userData, error } = await supabase
          .from("auth_users")
          .select("*")
          .eq("email", email)
          .eq("password_hash", passwordHash)
          .single();

        if (!error && userData) {
          // Create session
          const sessionToken = btoa(userData.id + ":" + Date.now());
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
        }
      } catch (customAuthError) {
        console.log("Custom auth failed, trying mock auth:", customAuthError);
      }

      // Fallback to mock authentication
      const mockUser = mockUsers.find(
        (u) => u.email === email && u.password_hash === passwordHash,
      );
      if (mockUser) {
        const sessionToken = btoa(mockUser.id + ":" + Date.now());
        localStorage.setItem("session_token", sessionToken);
        localStorage.setItem("mock_user", JSON.stringify(mockUser));

        setUser({
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
        });

        const mockProfile = mockProfiles.find((p) => p.user_id === mockUser.id);
        if (mockProfile) {
          setProfile(mockProfile);
        }

        return { success: true };
      }

      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      // Try Supabase auth first
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (!supabaseError && supabaseData.user) {
        // Supabase auth success
        return { success: true };
      }

      // Check if user exists in custom auth
      const { data: existingUser } = await supabase
        .from("auth_users")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        return { success: false, error: "Email already exists" };
      }

      // Create custom auth user
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

      if (!error && newUser) {
        // Auto-login after signup
        return await login(email, password);
      }

      return { success: false, error: "Signup failed" };
    } catch (error) {
      return { success: false, error: "Signup failed" };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clean up custom auth session
      const sessionToken = localStorage.getItem("session_token");
      if (sessionToken) {
        try {
          await supabase
            .from("user_sessions")
            .delete()
            .eq("session_token", sessionToken);
        } catch (error) {
          console.log("Session cleanup failed:", error);
        }
      }

      localStorage.removeItem("session_token");
      localStorage.removeItem("mock_user");
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) return { success: false, error: "Not authenticated" };

      // Check if using mock authentication
      const mockUser = localStorage.getItem("mock_user");
      if (mockUser) {
        setProfile((prev) => (prev ? { ...prev, ...profileData } : null));
        return { success: true };
      }

      // Try database update
      try {
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
      } catch (supabaseError) {
        console.log("Profile update failed:", supabaseError);
        setProfile((prev) => (prev ? { ...prev, ...profileData } : null));
        return { success: true };
      }
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
        loginWithGoogle,
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
