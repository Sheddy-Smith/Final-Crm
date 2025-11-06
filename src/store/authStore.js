import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      loading: false,
      error: null,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            set({
              isAuthenticated: true,
              user: profile || {
                id: session.user.id,
                email: session.user.email,
                name: session.user.email.split('@')[0],
                role: 'Employee'
              },
              session
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) throw error;

          let profile = null;
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!existingProfile) {
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                name: data.user.email.split('@')[0],
                username: data.user.email.split('@')[0],
                role: 'Super Admin',
                status: 'Active'
              })
              .select()
              .single();
            profile = newProfile;
          } else {
            profile = existingProfile;
            await supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', data.user.id);
          }

          set({
            isAuthenticated: true,
            user: profile,
            session: data.session,
            loading: false
          });

          return { success: true };
        } catch (error) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({
            isAuthenticated: false,
            user: null,
            session: null,
            error: null
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      updateProfile: async (updates) => {
        const userId = get().user?.id;
        if (!userId) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;

          set({ user: data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  }
});

export default useAuthStore;
