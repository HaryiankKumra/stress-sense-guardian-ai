
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for mock user first (for testing)
        const mockUser = localStorage.getItem("mock_user");
        if (mockUser && mounted) {
          try {
            const userData = JSON.parse(mockUser);
            setUser({
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
            });

            const mockProfile = mockProfiles.find(p => p.user_id === userData.id);
            if (mockProfile) {
              setProfile(mockProfile);
            }
            
            if (mounted) setLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem("mock_user");
          }
        }

        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const supabaseUser = session.user;
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
          });
          await fetchUserProfile(supabaseUser.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          const supabaseUser = session.user;
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email || '',
          });
          await fetchUserProfile(supabaseUser.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        return { success: true };
      }

      // Fallback to mock authentication for testing
      const passwordHash = btoa(password);
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
        return { success: true };
      }

      return { success: false, error: supabaseError?.message || "Signup failed" };
    } catch (error) {
      return { success: false, error: "Signup failed" };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
