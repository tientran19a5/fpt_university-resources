"use client";

import React, { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  User, 
  Fuel, 
  Check, 
  FileText, 
  Save, 
  Gauge, 
  UserCheck
} from "lucide-react";
import { 
  useWorkOrderStore, 
  useCustomerStore, 
  useVehicleStore, 
  useTechnicianStore 
} from "@/stores";
import { WorkOrderStatus } from "@/types";
import { formatVND, formatDateVN } from "@/lib/utils";
import { toast } from "sonner";

interface WorkOrderDetailSheetProps {
  workOrderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkOrderDetailSheet({
  workOrderId,
  open,
  onOpenChange,
}: WorkOrderDetailSheetProps) {
  const workOrder = useWorkOrderStore((s) => (workOrderId ? s.getById(workOrderId) : undefined));
  const updateStatus = useWorkOrderStore((s) => s.updateStatus);
  const updateWorkOrder = useWorkOrderStore((s) => s.update);

  const customers = useCustomerStore((s) => s.customers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const technicians = useTechnicianStore((s) => s.technicians);

  const [notes, setNotes] = useState("");
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false);

  useEffect(() => {
    if (workOrder) {
      setNotes(workOrder.notes || "");
    }
  }, [workOrder]);

  if (!workOrder) return null;

  const customer = customers.find((c) => c.id === workOrder.customerId);
  const vehicle = vehicles.find((v) => v.id === workOrder.vehicleId);
  const technician = technicians.find((t) => t.id === workOrder.leadTechnicianId);

  const handleStatusChange = (newStatus: WorkOrderStatus) => {
    updateStatus(workOrder.id, newStatus);
    const statusLabels: Record<WorkOrderStatus, string> = {
      pending: "Chờ xử lý",
      in_progress: "Đang sửa",
      waiting_parts: "Chờ phụ tùng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    toast.success("Cập nhật trạng thái phiếu thành công!", {
      description: `Phiếu ${workOrder.code} chuyển sang: ${statusLabels[newStatus]}`,
    });
  };

  const handleSaveNotes = () => {
    updateWorkOrder(workOrder.id, { notes });
    setSaveNoteSuccess(true);
    toast.success("Đã lưu ghi chú kỹ thuật!", {
      description: `Ghi chú cho phiếu ${workOrder.code} đã được cập nhật.`,
    });
    setTimeout(() => setSaveNoteSuccess(false), 2000);
  };

  const renderStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
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
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <SheetHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {workOrder.code}
            </span>
            {renderStatusBadge(workOrder.status)}
          </div>
          <SheetTitle className="text-xl font-heading font-bold text-slate-900 mt-2">
            Chi Tiết Phiếu Tiếp Nhận & Sửa Chữa
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Ngày lập phiếu: {formatDateVN(workOrder.createdAt)}
          </SheetDescription>
        </SheetHeader>

        {/* 1. Quick Status Changer */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Cập nhật trạng thái phiếu:
          </label>
          <select
            value={workOrder.status}
            onChange={(e) => handleStatusChange(e.target.value as WorkOrderStatus)}
            aria-label="Cập nhật trạng thái phiếu sửa chữa"
            className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 transition-colors"
          >
            <option value="pending">🟡 Chờ xử lý (pending)</option>
            <option value="in_progress">🔵 Đang sửa chữa (in_progress)</option>
            <option value="waiting_parts">🟠 Chờ phụ tùng (waiting_parts)</option>
            <option value="completed">🟢 Hoàn thành (completed)</option>
            <option value="cancelled">⚪ Đã hủy phiếu (cancelled)</option>
          </select>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Thay đổi trạng thái sẽ lập tức cập nhật vào bộ nhớ trình duyệt (localStorage).
          </p>
        </div>

        {/* 2. Khách Hàng & Thông Tin Xe */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Box Khách */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-1 bg-white dark:bg-slate-900">
            <div className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
              <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Khách hàng
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {customer?.fullName || "Chưa rõ"}
            </div>
            <div className="text-slate-500 dark:text-slate-400">{customer?.phoneNumber || "-"}</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{customer?.address || "-"}</div>
          </div>

          {/* Box Xe */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-1 bg-white dark:bg-slate-900">
            <div className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
              <Car className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              Phương tiện
            </div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
              {vehicle?.licensePlate || "Chưa rõ"}
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              {vehicle?.brand} {vehicle?.model} ({vehicle?.manufactureYear})
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Màu: {vehicle?.color}
            </div>
          </div>
        </div>

        {/* 3. Tình trạng tiếp nhận */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] block flex items-center justify-center gap-1">
              <Gauge className="h-3 w-3" /> Số ODO
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {workOrder.odoAtReception.toLocaleString()} km
            </span>
          </div>

          <div className="rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] block flex items-center justify-center gap-1">
              <Fuel className="h-3 w-3" /> Mức xăng
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {workOrder.gasLevel === "full" ? "Đầy bình" : workOrder.gasLevel === "half" ? "1/2 bình" : "1/4 bình"}
            </span>
          </div>

          <div className="rounded-md border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] block flex items-center justify-center gap-1">
              <UserCheck className="h-3 w-3" /> KTV Phụ trách
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={technician?.fullName}>
              {technician?.fullName || "Chưa giao"}
            </span>
          </div>
        </div>

        {/* 4. Yêu cầu của khách */}
        <div className="space-y-1.5 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block">
            Yêu cầu từ khách & Triệu chứng ghi nhận:
          </span>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 text-slate-800 dark:text-slate-200 leading-relaxed">
            {workOrder.customerRequest}
          </div>
        </div>

        {/* 5. Chẩn đoán kỹ thuật */}
        {workOrder.technicianDiagnosis && (
          <div className="space-y-1.5 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Kết quả chẩn đoán kỹ thuật:
            </span>
            <div className="rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3 text-amber-900 dark:text-amber-300 leading-relaxed">
              {workOrder.technicianDiagnosis}
            </div>
          </div>
        )}

        {/* 6. Danh sách Hạng mục dịch vụ & Phụ tùng */}
        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            Hạng mục công việc ({workOrder.services.length}):
          </div>
          <div className="space-y-1.5">
            {workOrder.services.map((srv, idx) => (
              <div key={srv.id || idx} className="flex justify-between items-center py-1.5 px-2.5 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-800 dark:text-slate-200 font-medium">{srv.name}</span>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{formatVND(srv.laborFee)}</span>
              </div>
            ))}
          </div>

          {workOrder.parts.length > 0 && (
            <div className="pt-2">
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Vật tư & Phụ tùng thay thế ({workOrder.parts.length}):
              </div>
              <div className="space-y-1.5">
                {workOrder.parts.map((p, idx) => (
                  <div key={p.id || idx} className="flex justify-between items-center py-1.5 px-2.5 rounded bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium block">{p.partName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">SL: {p.quantity} x {formatVND(p.unitPrice)}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">{formatVND(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chi phí tổng kết */}
          <div className="rounded-lg bg-slate-100/80 dark:bg-slate-950/80 p-3 space-y-1.5 mt-3 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tổng tiền công:</span>
              <span className="tabular-nums font-medium">{formatVND(workOrder.laborTotal)}</span>
            </div>
            {workOrder.partsTotal > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Tổng tiền phụ tùng:</span>
                <span className="tabular-nums font-medium">{formatVND(workOrder.partsTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>VAT ({workOrder.taxRate}%):</span>
              <span className="tabular-nums">{formatVND(workOrder.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold text-sm border-t border-slate-200 dark:border-slate-800 pt-1.5">
              <span>Tổng thanh toán:</span>
              <span className="text-sky-700 dark:text-sky-400 tabular-nums">{formatVND(workOrder.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* 7. Ghi Chú Kỹ Thuật (Cho phép chỉnh sửa & lưu) */}
        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            Ghi chú nội bộ xưởng:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ghi chú thêm về hẹn giờ giao xe, yêu cầu khách lưu lại đồ..."
            className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleSaveNotes}
              className="text-xs bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1"
            >
              {saveNoteSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã Lưu!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu Ghi Chú</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
