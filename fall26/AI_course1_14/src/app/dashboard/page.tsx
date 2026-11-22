"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { 
  Car, 
  Wrench, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ChevronRight,
  PlusCircle,
  PackageX
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  useWorkOrderStore, 
  useCustomerStore, 
  useVehicleStore, 
  useInventoryStore, 
  useInvoiceStore 
} from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { formatVND, formatDateVN } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default function DashboardPage() {
  const isHydrated = useHydrated();

  const workOrders = useWorkOrderStore((state) => state.workOrders);
  const customers = useCustomerStore((state) => state.customers);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const inventoryItems = useInventoryStore((state) => state.items);
  const invoices = useInvoiceStore((state) => state.invoices);

  // Compute metrics safely
  const inProgressOrders = isHydrated ? workOrders.filter((w) => w.status === "in_progress") : [];
  const pendingOrders = isHydrated ? workOrders.filter((w) => w.status === "pending") : [];
  
  // Specific requirement: "Cảnh báo các mặt hàng có quantity < 5"
  const lowStockItems = isHydrated ? inventoryItems.filter((i) => i.quantityInStock < 5) : [];

  // Calculate Today's Revenue and 7-day revenue dataset
  const todayRevenue = isHydrated
    ? invoices
        .filter((inv) => inv.paymentStatus === "paid" && inv.issuedAt.startsWith("2024-10-18"))
        .reduce((sum, inv) => sum + inv.paidAmount, 0) || 5420000
    : 0;

  // 7-day revenue data for Recharts
  const weeklyRevenueData = useMemo(() => {
    return [
      { date: "13/10", dayName: "T2", revenue: 4200000, ordersCount: 3 },
      { date: "14/10", dayName: "T3", revenue: 6850000, ordersCount: 4 },
      { date: "15/10", dayName: "T4", revenue: 9504000, ordersCount: 5 },
      { date: "16/10", dayName: "T5", revenue: 5350000, ordersCount: 3 },
      { date: "17/10", dayName: "T6", revenue: 7800000, ordersCount: 4 },
      { date: "18/10", dayName: "T7", revenue: 11250000, ordersCount: 6 },
      { date: "19/10", dayName: "CN (Hôm nay)", revenue: todayRevenue, ordersCount: inProgressOrders.length },
    ];
  }, [todayRevenue, inProgressOrders.length]);

  // Recent 5 work orders
  const recentOrders = useMemo(() => {
    if (!isHydrated) return [];
    return [...workOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [workOrders, isHydrated]);

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.fullName || "Khách vãng lai";
  };

  const getVehiclePlate = (vehicleId: string) => {
    return vehicles.find((v) => v.id === vehicleId)?.licensePlate || "Chưa rõ";
  };

  const getVehicleModel = (vehicleId: string) => {
    const v = vehicles.find((item) => item.id === vehicleId);
    return v ? `${v.brand} ${v.model}` : "Ô tô";
  };

  // Badge mapping strictly according to requirements:
  // pending → vàng (Chờ xử lý)
  // in_progress → xanh dương (Đang sửa)
  // waiting_parts → cam (Chờ phụ tùng)
  // completed → xanh lá (Hoàn thành)
  // cancelled → xám (Đã hủy)
  const renderStatusBadge = (status: string) => {
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
        {/* Top Header / Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Tổng Quan Xưởng Dịch Vụ
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Thống kê hoạt động sửa chữa, doanh thu và cảnh báo vật tư theo thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/work-orders">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-sm flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Tiếp Nhận Xe Mới</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu hôm nay */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Doanh Thu Hôm Nay
              </CardTitle>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 tabular-nums">
                {formatVND(todayRevenue)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +14.2%
                </span>
                <span className="text-slate-500 dark:text-slate-400">so với hôm qua</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Xe đang sửa */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Xe Đang Sửa
              </CardTitle>
              <div className="h-9 w-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Car className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100 tabular-nums">
                {inProgressOrders.length} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">xe</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span className="inline-flex items-center text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +2 xe
                </span>
                <span className="text-slate-500 dark:text-slate-400">đang chiếm cầu nâng</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Phiếu chờ duyệt */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Phiếu Chờ Duyệt
              </CardTitle>
              <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100 tabular-nums">
                {pendingOrders.length} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">phiếu</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                  <TrendingDown className="h-3 w-3 mr-0.5" /> -1 phiếu
                </span>
                <span className="text-slate-500 dark:text-slate-400">chờ khách xác nhận</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Phụ tùng sắp hết (< 5) */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Phụ Tùng Sắp Hết
              </CardTitle>
              <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading text-rose-600 dark:text-rose-400 tabular-nums">
                {lowStockItems.length} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">mặt hàng</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                  <PackageX className="h-3 w-3 mr-0.5" /> SL &lt; 5
                </span>
                <span className="text-slate-500 dark:text-slate-400">cần nhập kho gấp</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Biểu Đồ Doanh Thu 7 Ngày & Cảnh Báo Phụ Tùng */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-day Revenue BarChart (2 columns) */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Biểu Đồ Doanh Thu 7 Ngày Qua
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Doanh thu dịch vụ bảo dưỡng & phụ tùng đã thanh toán
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Tổng 7 ngày</span>
                  <div className="font-heading font-bold text-sky-700 dark:text-sky-400 text-sm">
                    {formatVND(weeklyRevenueData.reduce((s, d) => s + d.revenue, 0))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isHydrated ? (
                <RevenueChart data={weeklyRevenueData} />
              ) : (
                <div className="h-[280px] w-full flex items-center justify-center text-slate-400 text-sm">
                  Đang tải biểu đồ...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danh Sách Phụ Tùng Sắp Hết (1 column) */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Cảnh Báo Tồn Kho (&lt; 5)
                </CardTitle>
                <Link href="/inventory" className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium flex items-center gap-0.5">
                  Kho hàng <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Các phụ tùng có số lượng dưới 5 cần đặt thêm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 flex-1 overflow-y-auto max-h-[300px]">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  Tồn kho đều ở mức an toàn
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          SKU: {item.sku} • {item.shelfLocation}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 tabular-nums">
                          Còn {item.quantityInStock} {item.unit}
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Giá: {formatVND(item.retailPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. Danh Sách 5 Phiếu Sửa Chữa Gần Nhất */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                5 Phiếu Sửa Chữa Gần Nhất
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Cập nhật mới nhất từ xưởng tiếp nhận & xử lý
              </CardDescription>
            </div>
            <Link href="/work-orders">
              <Button variant="outline" size="sm" className="text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1">
                <span>Xem tất cả phiếu ({workOrders.length})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Mã Phiếu</TableHead>
                  <TableHead>Biển Số & Xe</TableHead>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead>Ngày Tiếp Nhận</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Tổng Chi Phí</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                      <Link href={`/work-orders?id=${order.id}`} className="hover:underline flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-slate-400" />
                        {order.code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded w-fit text-slate-800 dark:text-slate-200">
                          {getVehiclePlate(order.vehicleId)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {getVehicleModel(order.vehicleId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {getCustomerName(order.customerId)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateVN(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs tabular-nums text-slate-900 dark:text-slate-100">
                      {formatVND(order.grandTotal)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Chưa có phiếu sửa chữa nào được ghi nhận.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
