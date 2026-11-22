"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PackagePlus, Check, AlertCircle } from "lucide-react";
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
import { useInventoryStore } from "@/stores";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";

const importSchema = z.object({
  itemId: z.string().min(1, "Vui lòng chọn phụ tùng cần nhập"),
  quantity: z.coerce.number().min(1, "Số lượng nhập ít nhất là 1"),
  note: z.string().optional(),
});

type ImportFormData = z.infer<typeof importSchema>;

interface StockImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemId?: string;
}

export function StockImportDialog({
  open,
  onOpenChange,
  selectedItemId,
}: StockImportDialogProps) {
  const items = useInventoryStore((s) => s.items);
  const adjustStock = useInventoryStore((s) => s.adjustStock);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      itemId: selectedItemId || "",
      quantity: 10,
      note: "Nhập bổ sung từ nhà phân phối",
    },
  });

  React.useEffect(() => {
    if (selectedItemId) {
      setValue("itemId", selectedItemId);
    }
  }, [selectedItemId, setValue]);

  const currentItemId = watch("itemId");
  const selectedItem = items.find((i) => i.id === currentItemId);

  const onSubmit = (data: ImportFormData) => {
    adjustStock(data.itemId, Number(data.quantity));
    toast.success("Nhập kho thành công!", {
      description: `Đã cộng thêm ${data.quantity} vào tồn kho ${selectedItem?.name || "phụ tùng"}.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Nhập Thêm Kho Phụ Tùng</DialogTitle>
              <DialogDescription className="text-xs">
                Ghi nhận số lượng phụ tùng thực tế nhập kho gara
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          {/* Chọn Phụ Tùng */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Chọn mặt hàng phụ tùng <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("itemId")}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600"
            >
              <option value="">-- Chọn phụ tùng --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (Tồn: {i.quantityInStock} {i.unit})
                </option>
              ))}
            </select>
            {errors.itemId && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.itemId.message}
              </p>
            )}
          </div>

          {/* Current Stock Preview */}
          {selectedItem && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã SKU:</span>
                <span className="font-mono font-bold text-slate-800">{selectedItem.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tồn hiện tại:</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {selectedItem.quantityInStock} {selectedItem.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giá vốn nhập:</span>
                <span className="tabular-nums font-semibold text-slate-700">
                  {formatVND(selectedItem.costPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Số lượng nhập */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Số lượng nhập thêm <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              {...register("quantity")}
              min={1}
              className="h-9 text-xs tabular-nums"
              placeholder="VD: 10"
            />
            {errors.quantity && (
              <p className="text-[11px] text-rose-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Ghi chú lô nhập */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Ghi chú lô nhập kho
            </label>
            <Input
              {...register("note")}
              placeholder="Nhập theo hóa đơn NCC hoặc nhập bổ sung..."
              className="h-9 text-xs"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Xác Nhận Nhập Kho</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
