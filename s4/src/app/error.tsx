"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Sự cố không mong muốn
          </span>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Đã Xảy Ra Lỗi Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đã có sự cố khi kết xuất trang hoặc xử lý dữ liệu. Vui lòng thử tải lại hoặc quay về trang chủ.
          </p>
          {error?.message && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RefreshCw className="w-4 h-4" /> Thử Lại
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs flex items-center gap-2 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Home className="w-4 h-4" /> Về Trang Chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
