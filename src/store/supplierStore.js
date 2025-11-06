import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useSupplierStore = create(
  persist(
    (set) => ({
      suppliers: [],
      addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, {
        id: uuidv4(),
        ledger: [],
        creditLimit: 0,
        email: '',
        notes: '',
        ...supplier
      }] })),
      updateSupplier: (updatedSupplier) => set((state) => ({ suppliers: state.suppliers.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s)) })),
      deleteSupplier: (supplierId) => set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== supplierId) })),
    }),
    { name: 'supplier-storage' }
  )
);
export default useSupplierStore;
