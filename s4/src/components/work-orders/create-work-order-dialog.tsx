"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Wrench, Car, User, Check, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  useCustomerStore, 
  useVehicleStore, 
  useTechnicianStore, 
  useWorkOrderStore 
} from "@/stores";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";

const workOrderSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  vehicleId: z.string().min(1, "Vui lòng chọn xe"),
  leadTechnicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
  customerRequest: z.string().min(5, "Mô tả yêu cầu ít nhất 5 ký tự"),
  odoAtReception: z.coerce.number().min(0, "Số km không hợp lệ"),
  gasLevel: z.enum(["empty", "quarter", "half", "three_quarters", "full"]),
  services: z.array(
    z.object({
      name: z.string().min(2, "Tên hạng mục không được để trống"),
      laborFee: z.coerce.number().min(0, "Giá dự kiến không hợp lệ"),
    })
  ).min(1, "Cần thêm ít nhất 1 hạng mục sửa chữa"),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface CreateWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (workOrderId: string) => void;
}

export function CreateWorkOrderDialog({ open, onOpenChange, onSuccess }: CreateWorkOrderDialogProps) {
  const customers = useCustomerStore((s) => s.customers);
  const vehicles = useVehicleStore((s) => s.vehicles);
  const technicians = useTechnicianStore((s) => s.technicians);
  const addWorkOrder = useWorkOrderStore((s) => s.add);

  const [customerSearch, setCustomerSearch] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      leadTechnicianId: "",
      customerRequest: "",
      odoAtReception: 10000,
      gasLevel: "half",
      services: [
        { name: "Công bảo dưỡng tổng quát & kiểm tra xe", laborFee: 350000 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const selectedCustomerId = watch("customerId");
  const currentServices = watch("services") || [];

  // Filter vehicles belonging only to the selected customer
  const availableVehicles = React.useMemo(() => {
    if (!selectedCustomerId) return [];
    return vehicles.filter((v) => v.customerId === selectedCustomerId);
  }, [selectedCustomerId, vehicles]);

  // Filter customers by search term
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) => c.fullName.toLowerCase().includes(q) || c.phoneNumber.includes(q)
    );
  }, [customers, customerSearch]);

  // Calculate live totals
  const laborSubtotal = currentServices.reduce(
    (sum, item) => sum + (Number(item.laborFee) || 0),
    0
  );
  const taxAmount = Math.round(laborSubtotal * 0.08);
  const grandTotal = laborSubtotal + taxAmount;

  const onSubmit = (data: WorkOrderFormData) => {
    const newOrder = addWorkOrder({
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      leadTechnicianId: data.leadTechnicianId,
      customerRequest: data.customerRequest,
      odoAtReception: data.odoAtReception,
      gasLevel: data.gasLevel,
      status: "pending",
      services: data.services.map((s, idx) => ({
        id: `srv-${Date.now()}-${idx}`,
        name: s.name,
        laborFee: Number(s.laborFee),
      })),
      parts: [],
      laborTotal: laborSubtotal,
      partsTotal: 0,
      discountTotal: 0,
      taxRate: 8,
      taxAmount: taxAmount,
      grandTotal: grandTotal,
      notes: "Phiếu tiếp nhận lập mới từ giao diện",
    });

    reset();
    setCustomerSearch("");
    const cust = customers.find((c) => c.id === data.customerId);
    toast.success("Tạo phiếu tiếp nhận xe thành công!", {
      description: `Mã phiếu: ${newOrder.code} - Khách: ${cust?.fullName || ""}`,
    });
    onOpenChange(false);
    if (onSuccess) {
      onSuccess(newOrder.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Tạo Phiếu Sửa Chữa Mới</DialogTitle>
              <DialogDescription className="text-xs">
                Tiếp nhận xe, ghi nhận hiện trạng và lập bảng dự toán dịch vụ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* 1. Khách Hàng & Xe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chọn Khách Hàng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Khách hàng <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("customerId")}
                onChange={(e) => {
                  setValue("customerId", e.target.value);
                  setValue("vehicleId", ""); // Reset vehicle when customer changes
                }}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600"
              >
                <option value="">-- Chọn khách hàng --</option>
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - {c.phoneNumber}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.customerId.message}
                </p>
              )}
            </div>

            {/* Chọn Xe (chỉ hiện xe của khách đã chọn) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Car className="h-3.5 w-3.5 text-slate-400" />
                Xe tiếp nhận <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("vehicleId")}
                disabled={!selectedCustomerId}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {selectedCustomerId
                    ? availableVehicles.length > 0
                      ? "-- Chọn xe cần làm dịch vụ --"
                      : "Khách hàng này chưa có xe được ghi nhận"
                    : "-- Vui lòng chọn khách trước --"}
                </option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} ({v.brand} {v.model}) - {v.currentOdoKm.toLocaleString()} km
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.vehicleId.message}
                </p>
              )}
            </div>
          </div>

          {/* 2. Thợ phụ trách & Hiện trạng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* KTV Trưởng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Thợ phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("leadTechnicianId")}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600"
              >
                <option value="">-- Chọn kỹ thuật viên --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.fullName} ({t.status === "available" ? "Sẵn sàng" : "Đang bận"})
                  </option>
                ))}
              </select>
              {errors.leadTechnicianId && (
                <p className="text-[11px] text-rose-500">{errors.leadTechnicianId.message}</p>
              )}
            </div>

            {/* ODO tiếp nhận */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Số ODO tiếp nhận (km)
              </label>
              <Input
                type="number"
                {...register("odoAtReception")}
                placeholder="VD: 35000"
                className="h-9 text-xs"
              />
            </div>

            {/* Mức xăng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Mức nhiên liệu
              </label>
              <select
                {...register("gasLevel")}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600"
              >
                <option value="empty">Gần cạn (E)</option>
                <option value="quarter">1/4 bình</option>
                <option value="half">1/2 bình</option>
                <option value="three_quarters">3/4 bình</option>
                <option value="full">Đầy bình (F)</option>
              </select>
            </div>
          </div>

          {/* 3. Mô tả lỗi / Yêu cầu của khách */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Yêu cầu của khách & Triệu chứng lỗi <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("customerRequest")}
              rows={2}
              placeholder="VD: Bảo dưỡng 4 vạn km, thay dầu máy, kiểm tra phanh trước có tiếng rít..."
              className="w-full rounded-md border border-slate-200 p-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
            {errors.customerRequest && (
              <p className="text-[11px] text-rose-500">{errors.customerRequest.message}</p>
            )}
          </div>

          {/* 4. Danh mục hạng mục công việc sửa chữa (Dynamic Rows) */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-800">
                  Hạng mục sửa chữa & Tiền công dự kiến
                </label>
                <p className="text-[11px] text-slate-400">
                  Thêm các gói công việc kỹ thuật cần tiến hành
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", laborFee: 200000 })}
                className="h-8 text-xs text-sky-600 hover:text-sky-700 border-sky-200 hover:bg-sky-50 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm dòng
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      {...register(`services.${index}.name` as const)}
                      placeholder="Tên hạng mục sửa chữa..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="w-36">
                    <Input
                      type="number"
                      {...register(`services.${index}.laborFee` as const)}
                      placeholder="Giá dự kiến (₫)"
                      className="h-8 text-xs tabular-nums text-right"
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.services && (
              <p className="text-[11px] text-rose-500">{errors.services.message}</p>
            )}

            {/* Total calculation summary */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 mt-3 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền công dự kiến:</span>
                <span className="font-semibold tabular-nums">{formatVND(laborSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Thuế VAT (8%):</span>
                <span className="tabular-nums">{formatVND(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                <span>Tổng tiền dự kiến (có thuế):</span>
                <span className="text-sky-700 tabular-nums">{formatVND(grandTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Tiếp Nhận & Lưu Phiếu</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
