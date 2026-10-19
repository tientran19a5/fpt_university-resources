import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Vehicle } from '@/types';
import { seedVehicles } from '@/mocks/seedData';

interface VehicleState {
  vehicles: Vehicle[];
  getById: (id: string) => Vehicle | undefined;
  getByCustomerId: (customerId: string) => Vehicle[];
  add: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Vehicle;
  update: (id: string, vehicle: Partial<Omit<Vehicle, 'id' | 'createdAt'>>) => void;
  remove: (id: string) => void;
  resetToSeed: () => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      vehicles: seedVehicles,
      getById: (id) => get().vehicles.find((v) => v.id === id),
      getByCustomerId: (customerId) => get().vehicles.filter((v) => v.customerId === customerId),
      add: (data) => {
        const now = new Date().toISOString();
        const newVehicle: Vehicle = {
          ...data,
          id: `veh-${Date.now().toString().slice(-6)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ vehicles: [newVehicle, ...state.vehicles] }));
        return newVehicle;
      },
      update: (id, updateData) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id
              ? { ...v, ...updateData, updatedAt: new Date().toISOString() }
              : v
          ),
        }));
      },
      remove: (id) => {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        }));
      },
      resetToSeed: () => {
        set({ vehicles: seedVehicles });
      },
    }),
    {
      name: 'autocare_vehicles_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
