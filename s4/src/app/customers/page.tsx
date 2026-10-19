"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { 
  UserPlus, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Car, 
  Phone, 
  Mail
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useCustomerStore, useVehicleStore } from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { Customer } from "@/types";
import { formatVND } from "@/lib/utils";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";

export default function CustomersPage() {
  const router = useRouter();
  const isHydrated = useHydrated();

  const customers = useCustomerStore((s) => s.customers);
  const vehicles = useVehicleStore((s) => s.vehicles);

  const [dialogOpen, setDialogOpen] = useState(false);

  // Map counting vehicles per customer
  const vehicleCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) {
      map.set(v.customerId, (map.get(v.customerId) || 0) + 1);
    }
    return map;
  }, [vehicles]);

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Họ và Tên</span>
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
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-sky-700 hover:underline">
              {row.original.fullName}
            </span>
            {row.original.nationalId && (
              <span className="text-[11px] text-slate-400 font-mono">
                CCCD: {row.original.nationalId}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Số Điện Thoại",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-700">
            {row.original.phoneNumber}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {row.original.email || "-"}
          </span>
        ),
      },
      {
        id: "vehiclesCount",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Xe Sở Hữu</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        sortingFn: (rowA, rowB) => {
          const countA = vehicleCountMap.get(rowA.original.id) || 0;
          const countB = vehicleCountMap.get(rowB.original.id) || 0;
          return countA - countB;
        },
        cell: ({ row }) => {
          const count = vehicleCountMap.get(row.original.id) || 0;
          return (
            <Badge variant="outline" className="text-xs gap-1 font-medium bg-slate-50">
              <Car className="h-3 w-3 text-sky-600" />
              <span>{count} xe</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "totalSpent",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600 ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Tổng Chi Tiêu</span>
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
          <div className="text-right font-bold text-xs tabular-nums text-slate-900 dark:text-slate-100">
            {formatVND(row.original.totalSpent)}
          </div>
        ),
      },
    ],
    [vehicleCountMap]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Danh Bạ Khách Hàng
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quản lý danh sách chủ xe, lịch sử bảo dưỡng và mức độ chi tiêu dịch vụ
            </p>
          </div>

          <div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-sm flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Thêm Khách Hàng</span>
            </Button>
          </div>
        </div>

        {/* DataTable Generic */}
        <DataTable
          columns={columns}
          data={isHydrated ? customers : []}
          searchPlaceholder="Tìm theo họ tên, số điện thoại, email, CCCD..."
          searchFilterFn={(cust, q) =>
            cust.fullName.toLowerCase().includes(q) ||
            cust.phoneNumber.includes(q) ||
            Boolean(cust.email && cust.email.toLowerCase().includes(q)) ||
            Boolean(cust.nationalId && cust.nationalId.includes(q))
          }
          onRowClick={(cust) => router.push(`/customers/${cust.id}`)}
          renderMobileCard={(cust) => {
            const count = vehicleCountMap.get(cust.id) || 0;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {cust.fullName}
                  </span>
                  <Badge variant="outline" className="text-xs gap-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <Car className="h-3 w-3 text-sky-600 dark:text-sky-400" /> {count} xe
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400" /> {cust.phoneNumber}
                </div>
                {cust.email && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Mail className="h-3 w-3 text-slate-400" /> {cust.email}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Tổng chi tiêu:</span>
                  <span className="font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                    {formatVND(cust.totalSpent)}
                  </span>
                </div>
              </div>
            );
          }}
          emptyTitle="Chưa tìm thấy khách hàng nào"
          emptyDescription="Nhấn nút Thêm Khách Hàng để tạo hồ sơ khách mới."
          emptyAction={
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Thêm Khách Hàng
            </Button>
          }
        />

        {/* Dialog Thêm Khách Hàng */}
        <CustomerFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={(newCust) => router.push(`/customers/${newCust.id}`)}
        />
      </div>
    </AppLayout>
  );
}
