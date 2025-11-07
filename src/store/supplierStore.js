import { create } from 'zustand';
import { localDB, STORES } from '@/utils/localDatabase';
import useAuthStore from './authStore';

const useSupplierStore = create((set, get) => ({
  suppliers: [],
  loading: false,
  error: null,

  loadSuppliers: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const suppliers = await localDB.getAllRecords(STORES.suppliers, userId);
      set({ suppliers, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Load suppliers error:', error);
    }
  },

  addSupplier: async (supplierData) => {
    try {
      const userId = useAuthStore.getState().user?.id;
      const supplier = await localDB.createRecord(STORES.suppliers, {
        ...supplierData,
        user_id: userId,
        balance: 0,
        ledger: [],
        creditLimit: supplierData.creditLimit || 0,
        email: supplierData.email || '',
        notes: supplierData.notes || '',
      });
      set((state) => ({ suppliers: [...state.suppliers, supplier] }));
      return supplier;
    } catch (error) {
      console.error('Add supplier error:', error);
      throw error;
    }
  },

  updateSupplier: async (id, updates) => {
    try {
      const updated = await localDB.updateRecord(STORES.suppliers, id, updates);
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
      }));
      return updated;
    } catch (error) {
      console.error('Update supplier error:', error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      await localDB.deleteRecord(STORES.suppliers, id);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
      }));
    } catch (error) {
      console.error('Delete supplier error:', error);
      throw error;
    }
  },

  getSupplierById: async (id) => {
    try {
      return await localDB.getRecord(STORES.suppliers, id);
    } catch (error) {
      console.error('Get supplier error:', error);
      return null;
    }
  },

  searchSuppliers: (searchTerm) => {
    const { suppliers } = get();
    if (!searchTerm) return suppliers;

    const term = searchTerm.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)
    );
  },
}));

export default useSupplierStore;
