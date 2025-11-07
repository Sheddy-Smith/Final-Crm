import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localDB, STORES } from '@/utils/localDatabase';
import { v4 as uuidv4 } from 'uuid';

const SUPER_ADMIN = {
  email: 'Shahidmultaniii@gmail.com',
  password: 'S#d_8224',
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      initialize: async () => {
        const state = get();
        if (state.isAuthenticated && state.user) {
          console.log('User already authenticated');
        }
      },

      login: async (credentials) => {
        set({ loading: true, error: null });

        try {
          if (credentials.email !== SUPER_ADMIN.email ||
              credentials.password !== SUPER_ADMIN.password) {
            throw new Error('Invalid email or password');
          }

          await localDB.init();

          let userId = localStorage.getItem('malwa_user_id');
          if (!userId) {
            userId = uuidv4();
            localStorage.setItem('malwa_user_id', userId);
          }

          const userProfile = {
            id: userId,
            email: credentials.email,
            name: 'Super Admin',
            username: 'admin',
            role: 'Super Admin',
            status: 'Active',
            branch: 'Head Office',
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };

          await localDB.createRecord(STORES.profiles, userProfile);

          set({
            isAuthenticated: true,
            user: userProfile,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({
          isAuthenticated: false,
          user: null,
          error: null,
        });
      },

      updateProfile: async (updates) => {
        const userId = get().user?.id;
        if (!userId) return { success: false, error: 'No user logged in' };

        try {
          const updated = await localDB.updateRecord(STORES.profiles, userId, updates);
          set({ user: updated });
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

const STORES_KEY = 'profiles';
indexedDB.open('MalwaCRM_DB', 1).onsuccess = function(event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains(STORES_KEY)) {
    console.log('Database needs upgrade for profiles store');
  }
};

export default useAuthStore;
