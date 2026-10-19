import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Invoice, PaymentStatus, PaymentMethod } from '@/types';
import { seedInvoices } from '@/mocks/seedData';

interface InvoiceState {
  invoices: Invoice[];
  getById: (id: string) => Invoice | undefined;
  getByWorkOrderId: (workOrderId: string) => Invoice | undefined;
  add: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'issuedAt'>) => Invoice;
  update: (id: string, invoice: Partial<Omit<Invoice, 'id'>>) => void;
  recordPayment: (id: string, amount: number, method: PaymentMethod) => void;
  remove: (id: string) => void;
  resetToSeed: () => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: seedInvoices,
      getById: (id) => get().invoices.find((inv) => inv.id === id),
      getByWorkOrderId: (workOrderId) => get().invoices.find((inv) => inv.workOrderId === workOrderId),
      add: (data) => {
        const now = new Date().toISOString();
        const num = Math.floor(100 + Math.random() * 900);
        const codeDate = now.slice(0, 7).replace('-', '');
        const newInvoice: Invoice = {
          ...data,
          id: `inv-${Date.now().toString().slice(-6)}`,
          invoiceNumber: `INV-${codeDate}-${num}`,
          issuedAt: now,
        };
        set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
        return newInvoice;
      },
      update: (id, updateData) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updateData } : inv
          ),
        }));
      },
      recordPayment: (id, amount, method) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const newPaid = inv.paidAmount + amount;
            const newRemaining = Math.max(0, inv.totalAmount - newPaid);
            const status: PaymentStatus = newRemaining === 0 ? 'paid' : 'partial';
            return {
              ...inv,
              paidAmount: newPaid,
              remainingAmount: newRemaining,
              paymentStatus: status,
              paymentMethod: method,
              paidAt: newRemaining === 0 ? new Date().toISOString() : inv.paidAt,
            };
          }),
        }));
      },
      remove: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
      },
      resetToSeed: () => {
        set({ invoices: seedInvoices });
      },
    }),
    {
      name: 'autocare_invoices_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
