import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useLabourStore = create(
  persist(
    (set) => ({
      labours: [],
      addLabour: (labour) => set((state) => ({ labours: [...state.labours, {
        id: uuidv4(),
        ledger: [],
        creditLimit: 0,
        email: '',
        notes: '',
        ...labour
      }] })),
      updateLabour: (updatedLabour) => set((state) => ({ labours: state.labours.map((l) => (l.id === updatedLabour.id ? updatedLabour : l)) })),
      deleteLabour: (labourId) => set((state) => ({ labours: state.labours.filter((l) => l.id !== labourId) })),
    }),
    { name: 'labour-storage' }
  )
);
export default useLabourStore;
