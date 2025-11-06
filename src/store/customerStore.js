import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useCustomerStore = create(
  persist(
    (set) => ({
      customers: [],
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, {
          id: uuidv4(),
          ledger: [],
          creditLimit: 0,
          email: '',
          notes: '',
          ...customer
        }],
      })),
      updateCustomer: (updatedCustomer) => set((state) => ({
        customers: state.customers.map((c) => c.id === updatedCustomer.id ? updatedCustomer : c),
      })),
      deleteCustomer: (customerId) => set((state) => ({
        customers: state.customers.filter((c) => c.id !== customerId),
      })),
    }),
    { name: 'customer-storage' }
  )
);
export default useCustomerStore;
