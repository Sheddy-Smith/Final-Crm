import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useVendorStore = create(
  persist(
    (set) => ({
      vendors: [],
      addVendor: (vendor) => set((state) => ({ vendors: [...state.vendors, {
        id: uuidv4(),
        ledger: [],
        creditLimit: 0,
        email: '',
        notes: '',
        ...vendor
      }] })),
      updateVendor: (updatedVendor) => set((state) => ({ vendors: state.vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)) })),
      deleteVendor: (vendorId) => set((state) => ({ vendors: state.vendors.filter((v) => v.id !== vendorId) })),
    }),
    { name: 'vendor-storage' }
  )
);
export default useVendorStore;
