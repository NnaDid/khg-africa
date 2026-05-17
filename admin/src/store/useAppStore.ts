import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: 'super_admin' | 'gov_admin' | 'ngo_admin' | 'school_admin' | 'clinic_staff' | 'emergency_officer' | 'data_analyst';
  region?: string;
  organization?: string;
}

interface AppState {
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
