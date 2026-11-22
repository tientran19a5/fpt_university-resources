"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Car, 
  Boxes, 
  Receipt, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkOrderStore, useInventoryStore } from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";

export interface AppSidebarProps {
  isMobile?: boolean;
  onItemClick?: () => void;
  className?: string;
}

export function AppSidebar({ isMobile = false, onItemClick, className }: AppSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isHydrated = useHydrated();

  const workOrders = useWorkOrderStore((state) => state.workOrders);
  const inventoryItems = useInventoryStore((state) => state.items);

  const activeWorkOrdersCount = isHydrated 
    ? workOrders.filter((w) => w.status === 'in_progress' || w.status === 'pending').length 
    : 0;

  const lowStockCount = isHydrated
    ? inventoryItems.filter((i) => i.quantityInStock <= i.minStockThreshold).length
    : 0;

  const navItems = [
    {
      label: "Tổng Quan",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Phiếu Sửa Chữa",
      href: "/work-orders",
      icon: Wrench,
      badge: activeWorkOrdersCount > 0 ? activeWorkOrdersCount : undefined,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      label: "Khách Hàng",
      href: "/customers",
      icon: Users,
    },
    {
      label: "Quản Lý Xe",
      href: "/vehicles",
      icon: Car,
    },
    {
      label: "Kho Phụ Tùng",
      href: "/inventory",
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      label: "Hóa Đơn & Thu Ngân",
      href: "/invoices",
      icon: Receipt,
    },
    {
      label: "Cài Đặt Hệ Thống",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200 bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out select-none",
        isMobile ? "w-full h-full" : isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <Link 
          href="/dashboard" 
          onClick={onItemClick}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-md">
            <Wrench className="h-5 w-5" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AutoCare <span className="rounded bg-sky-500/20 px-1 py-0.2 text-[10px] font-semibold text-sky-400">PRO</span>
              </span>
              <span className="text-[11px] text-slate-400">Quản Lý Gara Ô Tô</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        <div className={cn("px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400", isCollapsed && !isMobile && "text-center")}>
          {(!isCollapsed || isMobile) ? "Danh mục quản lý" : "•"}
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
              title={isCollapsed && !isMobile ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {(!isCollapsed || isMobile) && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {(!isCollapsed || isMobile) && item.badge !== undefined && (
                <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold shadow-sm", item.badgeColor)}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Garage Status Footer */}
      {(!isCollapsed || isMobile) && (
        <div className="p-3 border-t border-slate-800">
          <div className="rounded-lg bg-slate-800/80 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="font-medium">Xưởng dịch vụ:</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Đang mở cửa
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Cơ sở chính: Nguyễn Hữu Thọ, Q.7
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button (Desktop only) */}
      {!isMobile && (
        <div className="p-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            aria-label={isCollapsed ? "Mở rộng thanh menu bên" : "Thu gọn thanh menu bên"}
            title={isCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}
    </aside>
  );
}
