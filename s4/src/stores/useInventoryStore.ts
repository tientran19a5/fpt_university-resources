import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { InventoryItem } from '@/types';
import { seedInventoryItems } from '@/mocks/seedData';

interface InventoryState {
  items: InventoryItem[];
  getById: (id: string) => InventoryItem | undefined;
  getLowStockItems: () => InventoryItem[];
  add: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => InventoryItem;
  update: (id: string, item: Partial<Omit<InventoryItem, 'id'>>) => void;
  adjustStock: (id: string, deltaQuantity: number) => void;
  remove: (id: string) => void;
  resetToSeed: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: seedInventoryItems,
      getById: (id) => get().items.find((i) => i.id === id),
      getLowStockItems: () => get().items.filter((i) => i.quantityInStock <= i.minStockThreshold),
      add: (data) => {
        const newItem: InventoryItem = {
          ...data,
          id: `part-${Date.now().toString().slice(-4)}`,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ items: [newItem, ...state.items] }));
        return newItem;
      },
      update: (id, updateData) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, ...updateData, updatedAt: new Date().toISOString() }
              : i
          ),
        }));
      },
      adjustStock: (id, delta) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  quantityInStock: Math.max(0, i.quantityInStock + delta),
                  updatedAt: new Date().toISOString(),
                }
              : i
          ),
        }));
      },
      remove: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      resetToSeed: () => {
        set({ items: seedInventoryItems });
      },
    }),
    {
      name: 'autocare_inventory_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
