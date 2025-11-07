import { create } from 'zustand';
import { localDB, STORES } from '@/utils/localDatabase';
import useAuthStore from './authStore';

const useLabourStore = create((set, get) => ({
  labours: [],
  loading: false,
  error: null,

  loadLabours: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const labours = await localDB.getAllRecords(STORES.labours, userId);
      set({ labours, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Load labours error:', error);
    }
  },

  addLabour: async (labourData) => {
    try {
      const userId = useAuthStore.getState().user?.id;
      const labour = await localDB.createRecord(STORES.labours, {
        ...labourData,
        user_id: userId,
        balance: 0,
        ledger: [],
        creditLimit: labourData.creditLimit || 0,
        email: labourData.email || '',
        notes: labourData.notes || '',
      });
      set((state) => ({ labours: [...state.labours, labour] }));
      return labour;
    } catch (error) {
      console.error('Add labour error:', error);
      throw error;
    }
  },

  updateLabour: async (id, updates) => {
    try {
      const updated = await localDB.updateRecord(STORES.labours, id, updates);
      set((state) => ({
        labours: state.labours.map((l) => (l.id === id ? updated : l)),
      }));
      return updated;
    } catch (error) {
      console.error('Update labour error:', error);
      throw error;
    }
  },

  deleteLabour: async (id) => {
    try {
      await localDB.deleteRecord(STORES.labours, id);
      set((state) => ({
        labours: state.labours.filter((l) => l.id !== id),
      }));
    } catch (error) {
      console.error('Delete labour error:', error);
      throw error;
    }
  },

  getLabourById: async (id) => {
    try {
      return await localDB.getRecord(STORES.labours, id);
    } catch (error) {
      console.error('Get labour error:', error);
      return null;
    }
  },

  searchLabours: (searchTerm) => {
    const { labours } = get();
    if (!searchTerm) return labours;

    const term = searchTerm.toLowerCase();
    return labours.filter(
      (l) =>
        l.name?.toLowerCase().includes(term) ||
        l.phone?.toLowerCase().includes(term) ||
        l.skill?.toLowerCase().includes(term)
    );
  },
}));

export default useLabourStore;
