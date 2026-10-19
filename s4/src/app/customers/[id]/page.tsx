"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  CreditCard, 
  Car, 
  Wrench, 
  Edit, 
  FileText,
  AlertCircle
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  useCustomerStore, 
  useVehicleStore, 
  useWorkOrderStore 
} from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { formatVND, formatDateVN } from "@/lib/utils";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { WorkOrderStatus } from "@/types";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isHydrated = useHydrated();

  const customerId = params?.id as string;

  const customers = useCustomerStore((s) => s.customers);
  const allVehicles = useVehicleStore((s) => s.vehicles);
  const allWorkOrders = useWorkOrderStore((s) => s.workOrders);

  const customer = React.useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId]
  );
  const vehicles = React.useMemo(
    () => allVehicles.filter((v) => v.customerId === customerId),
    [allVehicles, customerId]
  );
  const workOrders = React.useMemo(
    () => allWorkOrders.filter((w) => w.customerId === customerId),
    [allWorkOrders, customerId]
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!isHydrated) {
    return (
      <AppLayout>
        <div className="py-12 text-center text-slate-500 text-sm">
          Đang tải dữ liệu khách hàng...
        </div>
      </AppLayout>
    );
  }

  if (!customer) {
    return (
      <AppLayout>
        <div className="py-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy khách hàng</h2>
          <p className="text-xs text-slate-500">Khách hàng này có thể đã bị xóa hoặc đường dẫn không đúng.</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/customers")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh bạ
          </Button>
        </div>
      </AppLayout>
    );
  }

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
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/customers")}
              className="h-9 w-9 shrink-0 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label="Quay lại danh bạ khách hàng"
              title="Quay lại danh bạ"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {customer.fullName}
                </h1>
                <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  ID: {customer.id}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ngày tham gia gara: {formatDateVN(customer.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="text-xs flex items-center gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Sửa Thông Tin</span>
            </Button>
            <Link href="/work-orders">
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5" />
                <span>Tiếp Nhận Sửa Xe</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Profile Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Liên hệ */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-sky-600" /> Liên Hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Số điện thoại:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {customer.phoneNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Email:</span>
                <span className="text-slate-700 dark:text-slate-300">{customer.email || "Chưa cập nhật"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card Địa chỉ & CCCD */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Địa Chỉ & Pháp Lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Địa chỉ liên lạc:</span>
                <span className="text-slate-700 dark:text-slate-300">{customer.address || "Chưa có địa chỉ"}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Số CCCD:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{customer.nationalId || "Chưa cập nhật"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card Chi tiêu & Ghi chú */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Tài Chính & Ghi Chú
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Tổng chi tiêu tích lũy:</span>
                <span className="font-heading font-bold text-sky-700 dark:text-sky-400 text-lg tabular-nums">
                  {formatVND(customer.totalSpent)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Ghi chú nội bộ:</span>
                <span className="text-slate-600 dark:text-slate-300 italic">
                  {customer.notes ? `"${customer.notes}"` : "Không có ghi chú"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Danh Sách Xe Của Khách */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Car className="h-5 w-5 text-sky-600" />
                  <span>Danh Sách Xe Sở Hữu ({vehicles.length})</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Các phương tiện do khách hàng đăng ký bảo dưỡng tại gara
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển Số</TableHead>
                  <TableHead>Hãng & Model</TableHead>
                  <TableHead>Năm SX</TableHead>
                  <TableHead>Màu Sắc</TableHead>
                  <TableHead>Số Khung (VIN)</TableHead>
                  <TableHead className="text-right">ODO Hiện Tại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-900">
                        {v.licensePlate}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {v.brand} {v.model}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {v.manufactureYear}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {v.color}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {v.vinNumber}
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs tabular-nums text-slate-900">
                      {v.currentOdoKm.toLocaleString()} km
                    </TableCell>
                  </TableRow>
                ))}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-slate-400">
                      Khách hàng này hiện chưa đăng ký xe nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 3. Lịch Sử Phiếu Sửa Chữa */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>Lịch Sử Dịch Vụ & Phiếu Sửa Chữa ({workOrders.length})</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Toàn bộ các lần tiếp nhận, chẩn đoán và thanh toán dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Phiếu</TableHead>
                  <TableHead>Ngày Lập</TableHead>
                  <TableHead>Yêu Cầu / Triệu Chứng</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Tổng Tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => (
                  <TableRow key={wo.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-mono text-xs font-bold text-sky-700">
                      <Link href={`/work-orders?id=${wo.id}`} className="hover:underline">
                        {wo.code}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateVN(wo.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 max-w-xs truncate" title={wo.customerRequest}>
                      {wo.customerRequest}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(wo.status)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs tabular-nums text-slate-900">
                      {formatVND(wo.grandTotal)}
                    </TableCell>
                  </TableRow>
                ))}
                {workOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-xs text-slate-400">
                      Chưa có phiếu sửa chữa nào cho khách hàng này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Chỉnh Sửa */}
        <CustomerFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          customer={customer}
        />
      </div>
    </AppLayout>
  );
}
