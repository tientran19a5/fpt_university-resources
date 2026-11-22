"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Phone, Mail, MapPin, FileText, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerStore } from "@/stores";
import { Customer } from "@/types";
import { toast } from "sonner";

const customerSchema = z.object({
  fullName: z.string().min(2, "Họ và tên ít nhất 2 ký tự"),
  phoneNumber: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ (10 số)"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().optional(),
  nationalId: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSuccess?: (customer: Customer) => void;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerFormDialogProps) {
  const addCustomer = useCustomerStore((s) => s.add);
  const updateCustomer = useCustomerStore((s) => s.update);

  const isEdit = Boolean(customer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      nationalId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        email: customer.email || "",
        address: customer.address || "",
        nationalId: customer.nationalId || "",
        notes: customer.notes || "",
      });
    } else {
      reset({
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        nationalId: "",
        notes: "",
      });
    }
  }, [customer, reset, open]);

  const onSubmit = (data: CustomerFormData) => {
    if (isEdit && customer) {
      updateCustomer(customer.id, data);
      toast.success("Cập nhật thông tin khách hàng thành công!", {
        description: `Đã lưu hồ sơ cho: ${data.fullName}`,
      });
      onOpenChange(false);
      if (onSuccess) onSuccess({ ...customer, ...data });
    } else {
      const newCust = addCustomer({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        address: data.address || undefined,
        nationalId: data.nationalId || undefined,
        notes: data.notes || undefined,
      });
      toast.success("Thêm khách hàng mới thành công!", {
        description: `Đã thêm ${newCust.fullName} vào danh bạ gara.`,
      });
      onOpenChange(false);
      if (onSuccess) onSuccess(newCust);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>
                {isEdit ? "Chỉnh Sửa Thông Tin Khách Hàng" : "Thêm Khách Hàng Mới"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit
                  ? `Cập nhật thông tin cho khách: ${customer?.fullName}`
                  : "Nhập thông tin cá nhân khách hàng để lưu vào danh bạ gara"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          {/* Họ và tên */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register("fullName")}
              placeholder="VD: Nguyễn Văn Hùng"
              className="h-9 text-xs"
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.fullName.message}
              </p>
            )}
          </div>

          {/* SĐT & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("phoneNumber")}
                placeholder="VD: 0903123456"
                className="h-9 text-xs"
              />
              {errors.phoneNumber && (
                <p className="text-[11px] text-rose-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                Email
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="email@example.com"
                className="h-9 text-xs"
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ & CCCD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                Địa chỉ
              </label>
              <Input
                {...register("address")}
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                CCCD / Mã định danh
              </label>
              <Input
                {...register("nationalId")}
                placeholder="079085001234"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FileText className="h-3 w-3 text-slate-400" />
              Ghi chú nội bộ
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Khách VIP, thói quen nhận xe, lưu ý bảo dưỡng..."
              className="w-full rounded-md border border-slate-200 p-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{isEdit ? "Cập Nhật" : "Lưu Khách Hàng"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
