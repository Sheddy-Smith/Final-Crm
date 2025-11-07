import { create } from 'zustand';
import { localDB, STORES } from '@/utils/localDatabase';
import useAuthStore from './authStore';

const useVendorStore = create((set, get) => ({
  vendors: [],
  loading: false,
  error: null,

  loadVendors: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const vendors = await localDB.getAllRecords(STORES.vendors, userId);
      set({ vendors, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Load vendors error:', error);
    }
  },

  addVendor: async (vendorData) => {
    try {
      const userId = useAuthStore.getState().user?.id;
      const vendor = await localDB.createRecord(STORES.vendors, {
        ...vendorData,
        user_id: userId,
        balance: 0,
        ledger: [],
        creditLimit: vendorData.creditLimit || 0,
        email: vendorData.email || '',
        notes: vendorData.notes || '',
      });
      set((state) => ({ vendors: [...state.vendors, vendor] }));
      return vendor;
    } catch (error) {
      console.error('Add vendor error:', error);
      throw error;
    }
  },

  updateVendor: async (id, updates) => {
    try {
      const updated = await localDB.updateRecord(STORES.vendors, id, updates);
      set((state) => ({
        vendors: state.vendors.map((v) => (v.id === id ? updated : v)),
      }));
      return updated;
    } catch (error) {
      console.error('Update vendor error:', error);
      throw error;
    }
  },

  deleteVendor: async (id) => {
    try {
      await localDB.deleteRecord(STORES.vendors, id);
      set((state) => ({
        vendors: state.vendors.filter((v) => v.id !== id),
      }));
    } catch (error) {
      console.error('Delete vendor error:', error);
      throw error;
    }
  },

  getVendorById: async (id) => {
    try {
      return await localDB.getRecord(STORES.vendors, id);
    } catch (error) {
      console.error('Get vendor error:', error);
      return null;
    }
  },

  searchVendors: (searchTerm) => {
    const { vendors } = get();
    if (!searchTerm) return vendors;

    const term = searchTerm.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name?.toLowerCase().includes(term) ||
        v.phone?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term)
    );
  },
}));

export default useVendorStore;
