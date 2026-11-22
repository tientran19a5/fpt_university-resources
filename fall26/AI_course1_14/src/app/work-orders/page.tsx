"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { 
  PlusCircle, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Calendar 
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { 
  useWorkOrderStore, 
  useCustomerStore, 
  useVehicleStore, 
  useTechnicianStore 
} from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { WorkOrder, WorkOrderStatus } from "@/types";
import { formatVND, formatDateVN } from "@/lib/utils";
import { CreateWorkOrderDialog } from "@/components/work-orders/create-work-order-dialog";
import { WorkOrderDetailSheet } from "@/components/work-orders/work-order-detail-sheet";

export default function WorkOrdersPage() {
  const isHydrated = useHydrated();

  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const customers = useCustomerStore((s) => s.customers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const technicians = useTechnicianStore((s) => s.technicians);

  // Modal / Drawer states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");

  // Helper maps for lookups
  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [c.id, c]));
  }, [customers]);

  const vehicleMap = useMemo(() => {
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const technicianMap = useMemo(() => {
    return new Map(technicians.map((t) => [t.id, t]));
  }, [technicians]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!isHydrated) return [];
    let result = workOrders;

    // Filter status
    if (statusFilter !== "ALL") {
      result = result.filter((w) => w.status === statusFilter);
    }

    // Filter date
    if (dateFilter !== "ALL") {
      const now = new Date();
      if (dateFilter === "TODAY") {
        const todayStr = now.toISOString().slice(0, 10);
        result = result.filter((w) => w.createdAt.startsWith(todayStr));
      } else if (dateFilter === "7DAYS") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter((w) => new Date(w.createdAt) >= sevenDaysAgo);
      } else if (dateFilter === "30DAYS") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter((w) => new Date(w.createdAt) >= thirtyDaysAgo);
      }
    }

    return result;
  }, [workOrders, statusFilter, dateFilter, isHydrated]);

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<WorkOrder>[]>(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Mã Phiếu</span>
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
          <span className="font-mono text-xs font-bold text-sky-700 hover:underline">
            {row.original.code}
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
        id: "vehicle",
        header: "Biển Số & Xe",
        cell: ({ row }) => {
          const veh = vehicleMap.get(row.original.vehicleId);
          return (
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded w-fit text-slate-800">
                {veh?.licensePlate || "Chưa rõ"}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {veh ? `${veh.brand} ${veh.model}` : "Ô tô"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Trạng Thái</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const st = row.original.status as WorkOrderStatus;
          switch (st) {
            case "pending":
              return <Badge variant="pending">Chờ xử lý</Badge>;
            case "in_progress":
              return <Badge variant="in_progress">Đang sửa</Badge>;
            case "waiting_parts":
              return <Badge variant="waiting_parts">Chờ phụ tùng</Badge>;
            case "completed":
              return <Badge variant="completed">Hoàn thành</Badge>;
            case "cancelled":
            default:
              return <Badge variant="cancelled">Đã hủy</Badge>;
          }
        },
      },
      {
        id: "technician",
        header: "Thợ Phụ Trách",
        cell: ({ row }) => {
          const tech = technicianMap.get(row.original.leadTechnicianId || "");
          return (
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {tech ? `${tech.code} - ${tech.fullName}` : "Chưa chỉ định"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Ngày Tạo</span>
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
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDateVN(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Tổng Tiền Dự Kiến</span>
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
            {formatVND(row.original.grandTotal)}
          </div>
        ),
      },
    ],
    [customerMap, vehicleMap, technicianMap]
  );

  const handleRowClick = (order: WorkOrder) => {
    setSelectedOrderId(order.id);
    setDetailSheetOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Quản Lý Phiếu Sửa Chữa
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Theo dõi toàn bộ quy trình dịch vụ từ tiếp nhận xe, chẩn đoán đến bàn giao
            </p>
          </div>

          <div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Tạo Phiếu Mới</span>
            </Button>
          </div>
        </div>

        {/* Generic DataTable */}
        <DataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Tìm theo mã phiếu, tên khách, số điện thoại, biển số..."
          searchFilterFn={(w, q) => {
            const codeMatch = w.code.toLowerCase().includes(q);
            const custName = customerMap.get(w.customerId)?.fullName.toLowerCase() || "";
            const custPhone = customerMap.get(w.customerId)?.phoneNumber || "";
            const plate = vehicleMap.get(w.vehicleId)?.licensePlate.toLowerCase() || "";
            return codeMatch || custName.includes(q) || custPhone.includes(q) || plate.includes(q);
          }}
          onRowClick={handleRowClick}
          initialSorting={[{ id: "createdAt", desc: true }]}
          emptyAction={
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> Tạo Phiếu Mới
            </Button>
          }
          filterSlot={
            <>
              {/* Lọc Trạng Thái */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Lọc theo trạng thái phiếu"
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="pending">🟡 Chờ xử lý</option>
                  <option value="in_progress">🔵 Đang sửa</option>
                  <option value="waiting_parts">🟠 Chờ phụ tùng</option>
                  <option value="completed">🟢 Hoàn thành</option>
                  <option value="cancelled">⚪ Đã hủy</option>
                </select>
              </div>

              {/* Lọc Ngày Tạo */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  aria-label="Lọc theo khoảng thời gian"
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                >
                  <option value="ALL">Tất cả thời gian</option>
                  <option value="TODAY">Hôm nay</option>
                  <option value="7DAYS">7 ngày qua</option>
                  <option value="30DAYS">30 ngày qua</option>
                </select>
              </div>
            </>
          }
          renderMobileCard={(order) => {
            const cust = customerMap.get(order.customerId);
            const veh = vehicleMap.get(order.vehicleId);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                    {order.code}
                  </span>
                  {order.status === "in_progress" ? (
                    <Badge variant="in_progress">Đang sửa</Badge>
                  ) : order.status === "pending" ? (
                    <Badge variant="pending">Chờ xử lý</Badge>
                  ) : order.status === "waiting_parts" ? (
                    <Badge variant="waiting_parts">Chờ phụ tùng</Badge>
                  ) : order.status === "completed" ? (
                    <Badge variant="completed">Hoàn thành</Badge>
                  ) : (
                    <Badge variant="cancelled">Đã hủy</Badge>
                  )}
                </div>

                <div className="text-xs text-slate-900 dark:text-slate-100 font-semibold">
                  {cust?.fullName || "Khách vãng lai"}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 rounded text-slate-800 dark:text-slate-200">
                    {veh?.licensePlate}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatDateVN(order.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Chi phí dự kiến:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatVND(order.grandTotal)}
                  </span>
                </div>
              </div>
            );
          }}
          emptyTitle="Không tìm thấy phiếu sửa chữa nào"
          emptyDescription="Thử tìm kiếm với từ khóa khác hoặc xóa các bộ lọc trạng thái để xem đầy đủ danh sách."
        />

        {/* Dialog Tạo Phiếu Mới */}
        <CreateWorkOrderDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={(id) => {
            setSelectedOrderId(id);
            setDetailSheetOpen(true);
          }}
        />

        {/* Sheet Xem Chi Tiết Phiếu (Drawer bên phải) */}
        <WorkOrderDetailSheet
          workOrderId={selectedOrderId}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
        />
      </div>
    </AppLayout>
  );
}
