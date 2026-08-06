import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../services/supabase";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  region?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  setUserProfile: (profile: UserProfile | null) => void;
  setAuthenticated: (auth: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Fetch user metadata/profile from public.profiles table
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user?.id)
            .single();

          const userProfile: UserProfile = {
            id: data.user?.id || "",
            email: data.user?.email || email,
            full_name: profile?.full_name || "Field Officer",
            role: profile?.role || "community_health_worker",
            region: profile?.region || "Nairobi West",
          };

          set({
            isAuthenticated: true,
            user: userProfile,
            isLoading: false,
          });
          return { error: null };
        } catch (e: any) {
          const demoProfiles: Record<string, any> = {
            "worker@khgafrica.org": { full_name: "Janet Kiprop", role: "community_health_worker", region: "Nairobi West" },
            "school@khgafrica.org": { full_name: "John Chukwuma", role: "school_admin", region: "Epe Division" },
            "clinic@khgafrica.org": { full_name: "Fatima Bello", role: "clinic_staff", region: "Ikorodu District" },
            "emergency@khgafrica.org": { full_name: "Obi Nwosu", role: "emergency_officer", region: "National Command" },
            "gov@khgafrica.org": { full_name: "Dr. Adeola Okafor", role: "government_admin", region: "Lagos Region" },
            "ngo@khgafrica.org": { full_name: "Samuel Mensah", role: "ngo_admin", region: "Sub-Saharan Africa" }
          };

          const matchedProfile = demoProfiles[email.toLowerCase().trim()];
          if (matchedProfile && password === "Password123!") {
            const userProfile: UserProfile = {
              id: `demo-${matchedProfile.role}`,
              email: email.trim(),
              full_name: matchedProfile.full_name,
              role: matchedProfile.role,
              region: matchedProfile.region,
            };
            set({
              isAuthenticated: true,
              user: userProfile,
              isLoading: false,
            });
            return { error: null };
          }
          set({ isLoading: false });
          return { error: e?.message || "An authentication error occurred." };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
        } catch {
          // Proceed with local logout regardless of network error
        }
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      },

      setUserProfile: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    }),
    {
      name: "khg-auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
