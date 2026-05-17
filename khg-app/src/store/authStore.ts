import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KHGUser, AuthSession } from '../types';
import { supabase } from '../lib/supabase';

interface AuthStore {
  user: KHGUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setSession: (session: AuthSession | null) => void;
  setUser: (user: KHGUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      setSession: (session) =>
        set({ session, isAuthenticated: !!session }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) return { error: error.message };

          if (data.user && data.session) {
            // Fetch user profile from profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const khgUser: KHGUser = {
              id: data.user.id,
              email: data.user.email ?? '',
              full_name: profile?.full_name ?? data.user.email ?? 'User',
              role: profile?.role ?? 'teacher',
              phone: profile?.phone,
              language: profile?.language ?? 'en',
              assigned_school_ids: profile?.assigned_school_ids ?? [],
              assigned_clinic_ids: profile?.assigned_clinic_ids ?? [],
              region: profile?.region,
              avatar_url: profile?.avatar_url,
              created_at: data.user.created_at,
            };

            const authSession: AuthSession = {
              user: khgUser,
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at ?? 0,
            };

            set({ user: khgUser, session: authSession, isAuthenticated: true });
            return {};
          }

          return { error: 'Login failed. Please try again.' };
        } catch (e: any) {
          return { error: e?.message ?? 'Network error' };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            set((state) => ({
              user: {
                ...state.user!,
                full_name: profile.full_name,
                role: profile.role,
                region: profile.region,
              },
            }));
          }
        }
      },
    }),
    {
      name: 'khg-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
