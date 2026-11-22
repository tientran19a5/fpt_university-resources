import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Technician } from '@/types';
import { seedTechnicians } from '@/mocks/seedData';

interface TechnicianState {
  technicians: Technician[];
  getById: (id: string) => Technician | undefined;
  add: (technician: Omit<Technician, 'id'>) => Technician;
  update: (id: string, technician: Partial<Omit<Technician, 'id'>>) => void;
  remove: (id: string) => void;
  resetToSeed: () => void;
}

export const useTechnicianStore = create<TechnicianState>()(
  persist(
    (set, get) => ({
      technicians: seedTechnicians,
      getById: (id) => get().technicians.find((t) => t.id === id),
      add: (data) => {
        const newTech: Technician = {
          ...data,
          id: `tech-${Date.now().toString().slice(-4)}`,
        };
        set((state) => ({ technicians: [...state.technicians, newTech] }));
        return newTech;
      },
      update: (id, updateData) => {
        set((state) => ({
          technicians: state.technicians.map((t) =>
            t.id === id ? { ...t, ...updateData } : t
          ),
        }));
      },
      remove: (id) => {
        set((state) => ({
          technicians: state.technicians.filter((t) => t.id !== id),
        }));
      },
      resetToSeed: () => {
        set({ technicians: seedTechnicians });
      },
    }),
    {
      name: 'autocare_technicians_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
