import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockUsers, mockProfiles } from "@/utils/mockAuth";
import { getErrorMessage, logError } from "@/utils/errorHandling";

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

    // Safeguard: Force loading to false after 15 seconds maximum
    const maxLoadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn(
          "⚠️ Maximum loading timeout reached, forcing loading to false",
        );
        setLoading(false);
      }
    }, 15000);

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

            // Don't wait for profile fetch - do it in background
            fetchUserProfile(supabaseUser.id).catch((error) => {
              console.warn("⚠️ Background profile fetch failed:", error);
            });
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

            // Don't wait for profile fetch in auth state changes
            fetchUserProfile(supabaseUser.id).catch((error) => {
              console.warn("⚠️ Auth state profile fetch failed:", error);
            });
          } else {
            // Only clear user if not using mock auth
            const mockUser = localStorage.getItem("mock_user");
            if (!mockUser) {
              setUser(null);
              setProfile(null);
            }
          }

          // Always clear loading state
          if (mounted) {
            setLoading(false);
          }
        },
      );
      subscription = data.subscription;
    } catch (error) {
      console.warn("⚠️ Could not set up auth state listener:", error);
    }

    return () => {
      mounted = false;
      clearTimeout(maxLoadingTimeout);
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

      // Try to find mock profile first for faster loading
      const mockProfile = mockProfiles.find((p) => p.user_id === userId);

      // Set mock profile immediately if available, then try to fetch real one
      if (mockProfile) {
        console.log("📝 Setting mock profile immediately for user:", userId);
        setProfile(mockProfile);
      }

      // Try to fetch from database with shorter timeout (3 seconds)
      try {
        const profilePromise = supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timeout")), 3000),
        );

        const { data, error } = (await Promise.race([
          profilePromise,
          timeoutPromise,
        ])) as any;

        if (!error && data) {
          console.log("✅ Profile loaded from database, updating...");
          setProfile(data);
          return;
        } else if (error && error.code !== "PGRST116") {
          console.warn("⚠️ Profile fetch error:", error.message);
        }
      } catch (fetchError) {
        console.warn("⚠️ Profile fetch failed:", fetchError.message);
      }

      // If database fetch failed and we don't have a mock profile, create a default one
      if (!mockProfile) {
        console.log("🔄 Creating default profile...");
        const defaultProfile = {
          id: `profile-${userId}`,
          user_id: userId,
          age: undefined,
          weight: undefined,
          height: undefined,
          blood_type: undefined,
          medical_conditions: [],
          medications: [],
          allergies: [],
          emergency_contact_name: undefined,
          emergency_contact_phone: undefined,
          stress_threshold_low: 30,
          stress_threshold_medium: 60,
          stress_threshold_high: 80,
          preferred_notification_time: undefined,
          activity_level: undefined,
          sleep_target_hours: 8,
          water_intake_target: 2000,
        };

        setProfile(defaultProfile);
        console.log("✅ Default profile created");
      }
    } catch (error) {
      console.error("❌ Profile error:", error);

      // Always ensure we have some profile, even if it's minimal
      const fallbackProfile = {
        id: `profile-${userId}`,
        user_id: userId,
        stress_threshold_low: 30,
        stress_threshold_medium: 60,
        stress_threshold_high: 80,
        sleep_target_hours: 8,
        water_intake_target: 2000,
      };

      setProfile(fallbackProfile);
      console.log("📝 Using minimal fallback profile");
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
    console.log("🔄 Attempting login for:", email);

    try {
      // Try Supabase auth first with timeout
      try {
        console.log("🔄 Trying Supabase authentication...");
        const loginPromise = supabase.auth.signInWithPassword({
          email,
          password,
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Login timeout")), 10000),
        );

        const { data: supabaseData, error: supabaseError } =
          (await Promise.race([loginPromise, timeoutPromise])) as any;

        if (!supabaseError && supabaseData.user) {
          console.log("✅ Supabase login successful");
          return { success: true };
        } else if (supabaseError) {
          console.warn("⚠️ Supabase login failed:", supabaseError.message);
        }
      } catch (error) {
        console.warn("⚠️ Supabase login error:", error.message);
      }

      // Fallback to mock authentication for testing
      console.log("🔄 Trying mock authentication...");
      const passwordHash = btoa(password);
      const mockUser = mockUsers.find(
        (u) => u.email === email && u.password_hash === passwordHash,
      );

      if (mockUser) {
        console.log("✅ Mock authentication successful:", mockUser.email);

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
          console.log("✅ Mock profile loaded");
        } else {
          console.warn("⚠️ No mock profile found for user, creating default");
          const defaultProfile = {
            id: `profile-${mockUser.id}`,
            user_id: mockUser.id,
            stress_threshold_low: 30,
            stress_threshold_medium: 60,
            stress_threshold_high: 80,
            sleep_target_hours: 8,
            water_intake_target: 2000,
          };
          setProfile(defaultProfile);
        }

        return { success: true };
      }

      console.log("❌ No matching credentials found");
      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      logError("Login failed", error);
      return { success: false, error: getErrorMessage(error) };
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
        console.log("📝 Updating mock profile...");
        setProfile((prev) => (prev ? { ...prev, ...profileData } : null));
        return { success: true };
      }

      console.log("🔄 Updating profile in database...");
      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        logError("Profile update error", error);
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      console.log("✅ Profile updated successfully");
      await fetchUserProfile(user.id);
      return { success: true };
    } catch (error) {
      logError("Profile update exception", error);
      return { success: false, error: getErrorMessage(error) };
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
