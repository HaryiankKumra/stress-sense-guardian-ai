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
    let mounted = true;

    const initAuth = async () => {
      console.log("🔄 Initializing authentication...");

      try {
        // Check for mock user first (for testing)
        const mockUser = localStorage.getItem("mock_user");
        if (mockUser && mounted) {
          try {
            const userData = JSON.parse(mockUser);
            console.log("✅ Found mock user in localStorage:", userData.email);
            setUser({
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
            });

            const mockProfile = mockProfiles.find(
              (p) => p.user_id === userData.id,
            );
            if (mockProfile) {
              setProfile(mockProfile);
              console.log("✅ Loaded mock profile");
            }

            if (mounted) setLoading(false);
            return;
          } catch (e) {
            console.warn("⚠️ Invalid mock user data, removing...");
            localStorage.removeItem("mock_user");
          }
        }

        // Test Supabase connection with timeout
        console.log("🔄 Testing Supabase connection...");
        const connectionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 5000),
        );

        try {
          const {
            data: { session },
          } = (await Promise.race([connectionPromise, timeoutPromise])) as any;

          if (session?.user && mounted) {
            console.log("✅ Found Supabase session:", session.user.email);
            const supabaseUser = session.user;
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || "",
              full_name:
                supabaseUser.user_metadata?.full_name ||
                supabaseUser.email ||
                "",
            });
            await fetchUserProfile(supabaseUser.id);
          } else {
            console.log("ℹ️ No active Supabase session");
          }
        } catch (error) {
          console.warn("⚠️ Supabase connection failed:", error.message);
          console.log("📝 Using mock authentication only");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        if (mounted) {
          console.log("✅ Auth initialization complete");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes (with error handling)
    let subscription: any = null;

    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          console.log("🔄 Auth state change:", event);

          if (session?.user) {
            const supabaseUser = session.user;
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || "",
              full_name:
                supabaseUser.user_metadata?.full_name ||
                supabaseUser.email ||
                "",
            });
            await fetchUserProfile(supabaseUser.id);
          } else {
            // Only clear user if not using mock auth
            const mockUser = localStorage.getItem("mock_user");
            if (!mockUser) {
              setUser(null);
              setProfile(null);
            }
          }
          setLoading(false);
        },
      );
      subscription = data.subscription;
    } catch (error) {
      console.warn("⚠️ Could not set up auth state listener:", error);
    }

    return () => {
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.warn("Warning: Could not unsubscribe from auth changes");
        }
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("🔄 Fetching user profile for:", userId);

      const profilePromise = supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 10000),
      );

      const { data, error } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (error && error.code !== "PGRST116") {
        console.warn("⚠️ Profile fetch error:", error.message);

        // Fall back to mock profile if available
        const mockProfile = mockProfiles.find((p) => p.user_id === userId);
        if (mockProfile) {
          console.log("📝 Using mock profile as fallback");
          setProfile(mockProfile);
        }
        return;
      }

      if (data) {
        console.log("✅ Profile loaded from database");
        setProfile(data);
      } else {
        console.log("🔄 Creating default profile...");
        // Create default profile
        const defaultProfile = {
          user_id: userId,
          stress_threshold_low: 30,
          stress_threshold_medium: 60,
          stress_threshold_high: 80,
          sleep_target_hours: 8,
          water_intake_target: 2000,
        };

        try {
          const { data: newProfile, error: createError } = await supabase
            .from("user_profiles")
            .insert(defaultProfile)
            .select()
            .single();

          if (!createError && newProfile) {
            console.log("✅ Default profile created");
            setProfile(newProfile);
          } else {
            console.warn("⚠️ Could not create profile, using mock fallback");
            const mockProfile = mockProfiles.find((p) => p.user_id === userId);
            if (mockProfile) {
              setProfile(mockProfile);
            }
          }
        } catch (createError) {
          console.warn("⚠️ Profile creation failed:", createError);
          // Use mock profile as ultimate fallback
          const mockProfile = mockProfiles.find((p) => p.user_id === userId);
          if (mockProfile) {
            setProfile(mockProfile);
          }
        }
      }
    } catch (error) {
      console.error("❌ Profile error:", error);
      // Use mock profile as fallback
      const mockProfile = mockProfiles.find((p) => p.user_id === userId);
      if (mockProfile) {
        console.log("📝 Using mock profile as error fallback");
        setProfile(mockProfile);
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
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
      const { data: supabaseData, error: supabaseError } =
        await supabase.auth.signInWithPassword({
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
      const { data: supabaseData, error: supabaseError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

      if (!supabaseError && supabaseData.user) {
        return { success: true };
      }

      return {
        success: false,
        error: supabaseError?.message || "Signup failed",
      };
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
