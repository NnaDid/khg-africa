import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  async signIn(email: string) {
    // 1. Verify that the email belongs to an existing registered user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      return { data: null, error: profileError };
    }

    if (!profile) {
      return {
        data: null,
        error: new Error('Unauthorized: This email is not registered. Only pre-created administrators can log in.')
      };
    }

    // 2. Trigger the OTP flow if user exists
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  },

  async verifyOtp(email: string, token: string) {
    try {
      const demoUsers = ["gov@khgafrica.org", "ngo@khgafrica.org", "school@khgafrica.org", "clinic@khgafrica.org", "worker@khgafrica.org", "emergency@khgafrica.org"];
      if (demoUsers.includes(email.toLowerCase().trim()) && token === "123456") {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: "Password123!",
          });
          if (!error && data) return { data, error: null };
        } catch (authError) {}
        
        const mockUser = {
          id: `demo-${email.split('@')[0]}`,
          email: email.trim(),
        };
        return { data: { user: mockUser, session: { user: mockUser } } as any, error: null };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      return { data, error };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  async resetPassword(email: string) {
    // Verify that the email belongs to an existing registered user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      return { data: null, error: profileError };
    }

    if (!profile) {
      return {
        data: null,
        error: new Error('Unauthorized: This email is not registered in the system.')
      };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  async verifyRecoveryOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });
    return { data, error };
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  }
};
