import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Customer } from '@/types';
import { seedCustomers } from '@/mocks/seedData';

interface CustomerState {
  customers: Customer[];
  getById: (id: string) => Customer | undefined;
  add: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalSpent'>) => Customer;
  update: (id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt'>>) => void;
  remove: (id: string) => void;
  resetToSeed: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: seedCustomers,
      getById: (id) => get().customers.find((c) => c.id === id),
      add: (data) => {
        const now = new Date().toISOString();
        const newCustomer: Customer = {
          ...data,
          id: `cust-${Date.now().toString().slice(-6)}`,
          totalSpent: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ customers: [newCustomer, ...state.customers] }));
        return newCustomer;
      },
      update: (id, updateData) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id
              ? { ...c, ...updateData, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
      },
      remove: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },
      resetToSeed: () => {
        set({ customers: seedCustomers });
      },
    }),
    {
      name: 'autocare_customers_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
