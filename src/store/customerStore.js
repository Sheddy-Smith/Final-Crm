import { create } from 'zustand';
import { localDB, STORES } from '@/utils/localDatabase';
import useAuthStore from './authStore';

const useCustomerStore = create((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  loadCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const customers = await localDB.getAllRecords(STORES.customers, userId);
      set({ customers, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('Load customers error:', error);
    }
  },

  addCustomer: async (customerData) => {
    try {
      const userId = useAuthStore.getState().user?.id;
      const customer = await localDB.createRecord(STORES.customers, {
        ...customerData,
        user_id: userId,
        balance: 0,
        ledger: [],
        creditLimit: customerData.creditLimit || 0,
        email: customerData.email || '',
        notes: customerData.notes || '',
      });
      set((state) => ({ customers: [...state.customers, customer] }));
      return customer;
    } catch (error) {
      console.error('Add customer error:', error);
      throw error;
    }
  },

  updateCustomer: async (id, updates) => {
    try {
      const updated = await localDB.updateRecord(STORES.customers, id, updates);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updated : c)),
      }));
      return updated;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await localDB.deleteRecord(STORES.customers, id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Delete customer error:', error);
      throw error;
    }
  },

  getCustomerById: async (id) => {
    try {
      return await localDB.getRecord(STORES.customers, id);
    } catch (error) {
      console.error('Get customer error:', error);
      return null;
    }
  },

  searchCustomers: (searchTerm) => {
    const { customers } = get();
    if (!searchTerm) return customers;

    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  },
}));

export default useCustomerStore;
