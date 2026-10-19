import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorkOrder, WorkOrderStatus } from '@/types';
import { seedWorkOrders } from '@/mocks/seedData';

interface WorkOrderState {
  workOrders: WorkOrder[];
  getById: (id: string) => WorkOrder | undefined;
  getByStatus: (status: WorkOrderStatus) => WorkOrder[];
  add: (order: Omit<WorkOrder, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => WorkOrder;
  update: (id: string, order: Partial<Omit<WorkOrder, 'id' | 'createdAt'>>) => void;
  updateStatus: (id: string, status: WorkOrderStatus) => void;
  remove: (id: string) => void;
  resetToSeed: () => void;
}

export const useWorkOrderStore = create<WorkOrderState>()(
  persist(
    (set, get) => ({
      workOrders: seedWorkOrders,
      getById: (id) => get().workOrders.find((w) => w.id === id),
      getByStatus: (status) => get().workOrders.filter((w) => w.status === status),
      add: (data) => {
        const now = new Date().toISOString();
        const codeNum = Math.floor(100 + Math.random() * 900);
        const codeDate = now.slice(0, 7).replace('-', '');
        const newOrder: WorkOrder = {
          ...data,
          id: `wo-${Date.now().toString().slice(-6)}`,
          code: `WO-${codeDate}-${codeNum}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ workOrders: [newOrder, ...state.workOrders] }));
        return newOrder;
      },
      update: (id, updateData) => {
        set((state) => ({
          workOrders: state.workOrders.map((w) =>
            w.id === id
              ? { ...w, ...updateData, updatedAt: new Date().toISOString() }
              : w
          ),
        }));
      },
      updateStatus: (id, status) => {
        set((state) => ({
          workOrders: state.workOrders.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status,
                  actualDeliveryDate: status === 'completed' ? new Date().toISOString() : w.actualDeliveryDate,
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }));
      },
      remove: (id) => {
        set((state) => ({
          workOrders: state.workOrders.filter((w) => w.id !== id),
        }));
      },
      resetToSeed: () => {
        set({ workOrders: seedWorkOrders });
      },
    }),
    {
      name: 'autocare_work_orders_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
