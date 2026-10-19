"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  useInvoiceStore, 
  useCustomerStore, 
  useWorkOrderStore 
} from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { Invoice } from "@/types";
import { formatVND, formatDateVN } from "@/lib/utils";
import { InvoicePrintSheet } from "@/components/invoices/invoice-print-sheet";

export default function InvoicesPage() {
  const isHydrated = useHydrated();

  const invoices = useInvoiceStore((s) => s.invoices);
  const customers = useCustomerStore((s) => s.customers);
  const workOrders = useWorkOrderStore((s) => s.workOrders);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [c.id, c]));
  }, [customers]);

  const workOrderMap = useMemo(() => {
    return new Map(workOrders.map((w) => [w.id, w]));
  }, [workOrders]);

  const filteredInvoices = useMemo(() => {
    if (!isHydrated) return [];
    let list = invoices;
    if (statusFilter !== "ALL") {
      list = list.filter((i) => i.paymentStatus === statusFilter);
    }
    return list;
  }, [invoices, statusFilter, isHydrated]);

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setSheetOpen(true);
  };

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Mã Hóa Đơn</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            {row.original.invoiceNumber}
          </span>
        ),
      },
      {
        id: "customer",
        header: "Khách Hàng",
        cell: ({ row }) => {
          const cust = customerMap.get(row.original.customerId);
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-slate-900">
                {cust?.fullName || "Khách vãng lai"}
              </span>
              <span className="text-[11px] text-slate-400">
                {cust?.phoneNumber || "-"}
              </span>
            </div>
          );
        },
      },
      {
        id: "workOrder",
        header: "Phiếu Sửa Chữa",
        cell: ({ row }) => {
          const wo = workOrderMap.get(row.original.workOrderId);
          return (
            <span className="font-mono text-xs text-slate-700">
              {wo ? wo.code : "Phiếu dịch vụ"}
            </span>
          );
        },
      },
      {
        accessorKey: "issuedAt",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Ngày Lập</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {formatDateVN(row.original.issuedAt)}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600 ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Tổng Tiền</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-bold text-xs tabular-nums text-slate-900">
            {formatVND(row.original.totalAmount)}
          </div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Trạng Thái",
        cell: ({ row }) => {
          const st = row.original.paymentStatus;
          if (st === "paid") {
            return (
              <Badge variant="success" className="text-xs">
                Đã thanh toán
              </Badge>
            );
          }
          if (st === "partial") {
            return (
              <Badge variant="warning" className="text-xs">
                Đặt cọc một phần
              </Badge>
            );
          }
          return (
            <Badge variant="danger" className="text-xs">
              Chưa thanh toán
            </Badge>
          );
        },
      },
    ],
    [customerMap, workOrderMap]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Hóa Đơn & Thu Ngân
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý thanh toán, phát hành hóa đơn và chứng từ dịch vụ gara
            </p>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredInvoices}
          searchPlaceholder="Tìm theo mã hóa đơn, tên khách, số điện thoại..."
          searchFilterFn={(inv, q) =>
            inv.invoiceNumber.toLowerCase().includes(q) ||
            Boolean(customerMap.get(inv.customerId)?.fullName.toLowerCase().includes(q)) ||
            Boolean(customerMap.get(inv.customerId)?.phoneNumber.includes(q)) ||
            Boolean(workOrderMap.get(inv.workOrderId)?.code.toLowerCase().includes(q))
          }
          onRowClick={handleRowClick}
          filterSlot={
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Lọc theo trạng thái thanh toán hóa đơn"
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              >
                <option value="ALL">Tất cả hóa đơn ({invoices.length})</option>
                <option value="paid">🟢 Đã thanh toán</option>
                <option value="partial">🟡 Đặt cọc một phần</option>
                <option value="unpaid">🔴 Chưa thanh toán</option>
              </select>
            </div>
          }
          emptyTitle="Chưa có hóa đơn nào phù hợp"
          emptyDescription="Thử chọn lại bộ lọc trạng thái thanh toán hoặc tìm kiếm từ khóa khác."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatusFilter("ALL")}
              className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Hiển thị tất cả hóa đơn
            </Button>
          }
          renderMobileCard={(inv) => {
            const cust = customerMap.get(inv.customerId);
            const wo = workOrderMap.get(inv.workOrderId);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                    {inv.invoiceNumber}
                  </span>
                  {inv.paymentStatus === "paid" ? (
                    <Badge variant="success" className="text-xs">Đã TT</Badge>
                  ) : inv.paymentStatus === "partial" ? (
                    <Badge variant="warning" className="text-xs">Cọc 1 phần</Badge>
                  ) : (
                    <Badge variant="danger" className="text-xs">Chưa TT</Badge>
                  )}
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  {cust?.fullName || "Khách lẻ"}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  Phiếu SC: {wo?.code || "-"} • Ngày: {formatDateVN(inv.issuedAt)}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Tổng tiền:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatVND(inv.totalAmount)}
                  </span>
                </div>
              </div>
            );
          }}
        />

        {/* Sheet Chi Tiết Hóa Đơn In Được */}
        <InvoicePrintSheet
          invoiceId={selectedInvoiceId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </AppLayout>
  );
}
