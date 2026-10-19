"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  Search, 
  Bell, 
  PlusCircle, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
}

const routeTitles: Record<string, { title: string; category: string }> = {
  "/dashboard": { title: "Tổng Quan Xưởng", category: "Báo cáo" },
  "/work-orders": { title: "Phiếu Sửa Chữa", category: "Dịch vụ" },
  "/customers": { title: "Danh Sách Khách Hàng", category: "Quản trị" },
  "/vehicles": { title: "Hồ Sơ Xe & Bệnh Án", category: "Quản trị" },
  "/inventory": { title: "Kho Phụ Tùng & Vật Tư", category: "Vật tư" },
  "/invoices": { title: "Hóa Đơn & Thu Ngân", category: "Tài chính" },
  "/settings": { title: "Cài Đặt Hệ Thống", category: "Cấu hình" },
};

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const currentRoute = routeTitles[pathname] || {
    title: "AutoCare Pro",
    category: "Hệ thống",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 md:px-6 backdrop-blur transition-colors">
      {/* Left: Mobile hamburger + Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label="Mở thanh điều hướng di động"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-sm whitespace-nowrap">
          <Link href="/dashboard" className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hidden sm:inline text-xs sm:text-sm">
            Gara
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 hidden sm:inline shrink-0" />
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hidden md:inline">
            {currentRoute.category}
          </span>
          <span className="font-heading font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            {currentRoute.title}
          </span>
        </nav>
      </div>

      {/* Right: Search, Quick Action, ThemeToggle, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Input */}
        <div className="relative hidden lg:block w-64 xl:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            type="search"
            placeholder="Tìm biển số, khách, mã phiếu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
            aria-label="Tìm kiếm nhanh toàn hệ thống"
          />
        </div>

        {/* Quick Action Button */}
        <Link href="/work-orders">
          <Button size="sm" className="hidden sm:inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-sm font-medium focus-visible:ring-2 focus-visible:ring-sky-500">
            <PlusCircle className="h-4 w-4" />
            <span>Tiếp Nhận Xe</span>
          </Button>
        </Link>

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Xem thông báo hệ thống (có 1 thông báo mới)"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </Button>
        </div>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div 
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-inner"
            aria-label="Ảnh đại diện nhân viên Trần Tuấn Kiệt"
          >
            TK
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              Trần Tuấn Kiệt
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Cố Vấn Dịch Vụ
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
