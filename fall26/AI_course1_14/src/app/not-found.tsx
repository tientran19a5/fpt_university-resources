import Link from "next/link";
import { Wrench, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Wrench className="w-8 h-8 rotate-45 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            Mã lỗi 404
          </span>
          <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-slate-100">
            Không Tìm Thấy Trang Yêu Cầu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Trang bạn đang truy cập có thể đã bị đổi tên, tạm thời không khả dụng hoặc đường dẫn nhập sai.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs flex items-center gap-2">
              <Home className="w-4 h-4" /> Về Trang Tổng Quan
            </Button>
          </Link>
          <Link href="/work-orders">
            <Button variant="outline" className="w-full sm:w-auto text-xs flex items-center gap-2 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4" /> Tra Cứu Phiếu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
