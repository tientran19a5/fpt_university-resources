"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  User, 
  ExternalLink 
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useVehicleStore, useCustomerStore } from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { Vehicle } from "@/types";

export default function VehiclesPage() {
  const isHydrated = useHydrated();

  const vehicles = useVehicleStore((s) => s.vehicles);
  const customers = useCustomerStore((s) => s.customers);

  const [brandFilter, setBrandFilter] = useState("ALL");
  const [ownerFilter, setOwnerFilter] = useState("ALL");

  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [c.id, c]));
  }, [customers]);

  // Unique brands list for filter dropdown
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    for (const v of vehicles) {
      if (v.brand) set.add(v.brand);
    }
    return Array.from(set).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!isHydrated) return [];
    let list = vehicles;

    if (brandFilter !== "ALL") {
      list = list.filter((v) => v.brand.toLowerCase() === brandFilter.toLowerCase());
    }

    if (ownerFilter !== "ALL") {
      list = list.filter((v) => v.customerId === ownerFilter);
    }

    return list;
  }, [vehicles, brandFilter, ownerFilter, isHydrated]);

  const columns = useMemo<ColumnDef<Vehicle>[]>(
    () => [
      {
        accessorKey: "licensePlate",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Biển Số Xe</span>
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
            <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded w-fit text-slate-900">
              {row.original.licensePlate}
            </span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
              VIN: {row.original.vinNumber}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "brand",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Hãng Xe</span>
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
          <span className="font-semibold text-xs text-slate-800">
            {row.original.brand}
          </span>
        ),
      },
      {
        accessorKey: "model",
        header: "Dòng Xe (Model)",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-700">
              {row.original.model}
            </span>
            <span className="text-[11px] text-slate-400">
              ({row.original.color})
            </span>
          </div>
        ),
      },
      {
        accessorKey: "manufactureYear",
        header: "Năm SX",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {row.original.manufactureYear}
          </span>
        ),
      },
      {
        id: "owner",
        header: "Chủ Sở Hữu",
        cell: ({ row }) => {
          const owner = customerMap.get(row.original.customerId);
          if (!owner) return <span className="text-xs text-slate-400">-</span>;
          return (
            <Link
              href={`/customers/${owner.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline group"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{owner.fullName}</span>
              <ExternalLink className="h-3 w-3 text-sky-500 opacity-60 group-hover:opacity-100" />
            </Link>
          );
        },
      },
      {
        accessorKey: "currentOdoKm",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600 ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>ODO Hiện Tại</span>
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
          <div className="text-right font-medium text-xs tabular-nums text-slate-900">
            {row.original.currentOdoKm.toLocaleString()} km
          </div>
        ),
      },
    ],
    [customerMap]
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Quản Lý Xe & Bệnh Án Phương Tiện
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách tất cả các ô tô đã đăng ký và bảo dưỡng tại gara
          </p>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredVehicles}
          searchPlaceholder="Tìm theo biển số xe, model, số khung VIN..."
          searchFilterFn={(veh, q) =>
            veh.licensePlate.toLowerCase().includes(q) ||
            veh.brand.toLowerCase().includes(q) ||
            veh.model.toLowerCase().includes(q) ||
            veh.vinNumber.toLowerCase().includes(q) ||
            Boolean(customerMap.get(veh.customerId)?.fullName.toLowerCase().includes(q))
          }
          filterSlot={
            <>
              {/* Lọc theo hãng xe */}
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  aria-label="Lọc theo hãng sản xuất xe"
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                >
                  <option value="ALL">Tất cả hãng xe ({vehicles.length})</option>
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc theo chủ sở hữu */}
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  aria-label="Lọc theo chủ sở hữu xe"
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 max-w-[180px] truncate transition-colors"
                >
                  <option value="ALL">Tất cả chủ xe</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          }
          emptyTitle="Không tìm thấy phương tiện nào"
          emptyDescription="Thử chọn lại bộ lọc hãng xe hoặc chủ sở hữu."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBrandFilter("ALL");
                setOwnerFilter("ALL");
              }}
              className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Đặt lại tất cả bộ lọc
            </Button>
          }
          renderMobileCard={(veh) => {
            const owner = customerMap.get(veh.customerId);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-slate-100">
                    {veh.licensePlate}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {veh.brand} {veh.model}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Chủ xe:</span>
                  {owner ? (
                    <Link
                      href={`/customers/${owner.id}`}
                      className="font-medium text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      {owner.fullName}
                    </Link>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 dark:text-slate-500">Năm SX: {veh.manufactureYear}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {veh.currentOdoKm.toLocaleString()} km
                  </span>
                </div>
              </div>
            );
          }}
        />
      </div>
    </AppLayout>
  );
}
