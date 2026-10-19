"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, 
  Check, 
  Database,
  Building2,
  Phone,
  MapPin,
  FileCheck
} from "lucide-react";
import { 
  useCustomerStore, 
  useVehicleStore, 
  useTechnicianStore, 
  useInventoryStore, 
  useWorkOrderStore, 
  useInvoiceStore 
} from "@/stores";
import { toast } from "sonner";
import { seedGarageProfile } from "@/mocks/seedData";

export default function SettingsPage() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const resetCustomers = useCustomerStore((s) => s.resetToSeed);
  const resetVehicles = useVehicleStore((s) => s.resetToSeed);
  const resetTechnicians = useTechnicianStore((s) => s.resetToSeed);
  const resetInventory = useInventoryStore((s) => s.resetToSeed);
  const resetWorkOrders = useWorkOrderStore((s) => s.resetToSeed);
  const resetInvoices = useInvoiceStore((s) => s.resetToSeed);

  const handleResetAll = () => {
    resetCustomers();
    resetVehicles();
    resetTechnicians();
    resetInventory();
    resetWorkOrders();
    resetInvoices();
    setResetSuccess(true);
    toast.success("Đã khôi phục dữ liệu mẫu ban đầu thành công!", {
      description: "15 khách, 20 xe, 30 phụ tùng, 25 phiếu sửa chữa và 10 hóa đơn đã được đồng bộ lại.",
    });
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Cài Đặt Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản trị dữ liệu giả lập trình duyệt và thông tin cấu hình xưởng dịch vụ
          </p>
        </div>

        {/* Garage Profile Info */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Thông Tin Gara Dịch Vụ
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Thông tin xuất hiện trên tiêu đề hóa đơn và các chứng từ in ấn
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 block font-medium">Tên Gara:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{seedGarageProfile.name}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 block font-medium flex items-center gap-1">
                <Phone className="h-3 w-3 text-sky-500" /> Hotline tiếp nhận:
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{seedGarageProfile.phone}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 block font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-rose-500" /> Địa chỉ xưởng:
              </span>
              <span className="text-slate-700 dark:text-slate-300">{seedGarageProfile.address}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 block font-medium flex items-center gap-1">
                <FileCheck className="h-3 w-3 text-emerald-500" /> Mã số thuế:
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{seedGarageProfile.taxId}</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Management Card */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Quản Trị Dữ Liệu In-Browser (LocalStorage)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Toàn bộ dữ liệu khách hàng, xe, phiếu sửa chữa, kho và hóa đơn đang được lưu trữ trong trình duyệt của bạn.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">Lưu ý về bộ nhớ trình duyệt:</p>
              <p>
                Dữ liệu được duy trì tự động khi bạn tải lại trang (F5) hoặc mở tab mới. Nhấn nút bên dưới nếu bạn muốn xóa trắng các thay đổi tạm thời và đưa toàn bộ cơ sở dữ liệu về 100% dữ liệu hạt giống ban đầu (15 khách, 20 xe, 30 phụ tùng, 25 phiếu SC, 10 hóa đơn).
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Trạng thái: Đã đồng bộ với LocalStorage
            </span>
            <Button 
              variant="outline" 
              onClick={handleResetAll}
              className="flex items-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-800 dark:text-slate-200"
              aria-label="Khôi phục toàn bộ dữ liệu mẫu"
            >
              {resetSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Đã Khôi Phục Thành Công!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span>Khôi Phục Dữ Liệu Mẫu (Reset to Seed)</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
