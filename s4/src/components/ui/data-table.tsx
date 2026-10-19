"use client";

import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  FileQuestion,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchFilterFn?: (item: TData, query: string) => boolean;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  renderMobileCard?: (row: TData) => React.ReactNode;
  pageSize?: number;
  initialSorting?: SortingState;
  emptyTitle?: string;
  emptyDescription?: string;
  simulateLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Tìm kiếm dữ liệu...",
  searchFilterFn,
  filterSlot,
  actionSlot,
  emptyAction,
  onRowClick,
  renderMobileCard,
  pageSize = 10,
  initialSorting = [],
  emptyTitle = "Không tìm thấy dữ liệu",
  emptyDescription = "Chưa có bản ghi nào hoặc không khớp với tiêu chí tìm kiếm hiện tại.",
  simulateLoading = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(simulateLoading);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  // Brief skeleton loading simulation (300ms)
  useEffect(() => {
    if (simulateLoading) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [simulateLoading]);

  // Reset pagination when data or search query changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchQuery, data.length]);

  // Client-side search filtering
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();

    if (searchFilterFn) {
      return data.filter((item) => searchFilterFn(item, query));
    }

    // Default shallow search across all string / number fields
    return data.filter((item) => {
      return Object.values(item as Record<string, unknown>).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "string") return val.toLowerCase().includes(query);
        if (typeof val === "number") return val.toString().includes(query);
        return false;
      });
    });
  }, [data, searchQuery, searchFilterFn]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleResetSearch = () => {
    setSearchQuery("");
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
      {/* Top Filter & Action Bar */}
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-sky-500"
              aria-label={searchPlaceholder}
            />
          </div>

          {/* Right: Filters & Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {filterSlot}

            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetSearch}
                className="h-9 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 px-2.5 focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label="Xóa bộ lọc tìm kiếm"
                title="Xóa tìm kiếm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Đặt lại</span>
              </Button>
            )}

            {actionSlot}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* DESKTOP VIEW: TanStack Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-slate-200 dark:border-slate-800">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-slate-600 dark:text-slate-300 font-semibold text-xs py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 8 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse border-slate-100 dark:border-slate-800">
                    {columns.map((_, colIdx) => (
                      <TableCell key={colIdx} className="py-3.5">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={
                      onRowClick
                        ? "cursor-pointer hover:bg-sky-50/50 dark:hover:bg-slate-800/60 transition-colors border-slate-100 dark:border-slate-800"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 text-slate-700 dark:text-slate-300">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Empty state for desktop table
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <FileQuestion className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {emptyTitle}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                          {emptyDescription}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        {searchQuery && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetSearch}
                            className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Xóa bộ lọc tìm kiếm
                          </Button>
                        )}
                        {emptyAction}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE VIEW: Card List */}
        <div className="block md:hidden p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/3" />
              </div>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={
                  onRowClick
                    ? "cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                    : "rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm"
                }
              >
                {renderMobileCard ? (
                  renderMobileCard(row.original)
                ) : (
                  // Default mobile card view: show first 3 cells
                  <div className="space-y-1 text-xs">
                    {row.getVisibleCells().slice(0, 3).map((cell) => (
                      <div key={cell.id} className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">
                          {String(cell.column.columnDef.header)}:
                        </span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
                <FileQuestion className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                {emptyTitle}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{emptyDescription}</p>
              <div className="pt-2 flex flex-col gap-2 items-center">
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSearch}
                    className="text-xs border-slate-200 dark:border-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Xóa tìm kiếm
                  </Button>
                )}
                {emptyAction}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Hiển thị{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredData.length === 0
              ? 0
              : pagination.pageIndex * pagination.pageSize + 1}
          </span>{" "}
          đến{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              filteredData.length
            )}
          </span>{" "}
          trên tổng số{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredData.length}
          </span>{" "}
          mục
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 dark:border-slate-700 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-sky-500"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Về trang đầu"
            title="Về trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 dark:border-slate-700 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-sky-500"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Trang trước"
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="px-3 text-xs font-medium text-slate-700 dark:text-slate-300">
            Trang {table.getPageCount() === 0 ? 0 : table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount() || 1}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 dark:border-slate-700 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-sky-500"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Trang kế tiếp"
            title="Trang kế tiếp"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-slate-200 dark:border-slate-700 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-sky-500"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Đến trang cuối"
            title="Đến trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
