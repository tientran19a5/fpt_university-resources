"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { 
  PackagePlus, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  AlertTriangle,
  MapPin,
  Building
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useInventoryStore } from "@/stores";
import { useHydrated } from "@/hooks/useHydrated";
import { InventoryItem, InventoryCategory } from "@/types";
import { formatVND } from "@/lib/utils";
import { StockImportDialog } from "@/components/inventory/stock-import-dialog";

const categoryLabels: Record<InventoryCategory, string> = {
  lubricants: "Dầu nhớt & Dung dịch",
  brake_system: "Hệ thống phanh",
  filtration: "Bộ lọc các loại",
  suspension: "Giảm xóc & Khung gầm",
  electrical: "Điện & Đánh lửa",
  tires: "Lốp xe & Mâm",
  consumables: "Vật tư tiêu hao",
  accessories: "Phụ kiện tiện ích",
};

// Default suppliers based on category / sku
const getSupplierName = (item: InventoryItem): string => {
  if (item.supplier) return item.supplier;
  if (item.sku.startsWith("OIL-CAS")) return "Castrol BP Petco VN";
  if (item.sku.startsWith("OIL-MOB")) return "ExxonMobil Lubricants VN";
  if (item.sku.startsWith("OIL-MOT")) return "Motul Vietnam";
  if (item.sku.startsWith("FLT") && item.sku.includes("TOY")) return "Toyota An Sương Parts";
  if (item.sku.startsWith("FLT") && item.sku.includes("HON")) return "Honda Phát Tiến Parts";
  if (item.sku.startsWith("BRK-PAD-FR-CRV") || item.sku.startsWith("BRK-PAD-RR")) return "Brembo Official VN";
  if (item.sku.startsWith("BRK-OIL") || item.sku.startsWith("WIP")) return "Bosch Automotive VN";
  if (item.sku.startsWith("SPK-PLUG-DENSO") || item.sku.startsWith("FLT-AC-DENSO")) return "Denso Vietnam Co.";
  if (item.sku.startsWith("SPK-PLUG-NGK")) return "NGK Spark Plugs VN";
  if (item.sku.startsWith("BAT-GS")) return "Ắc Quy GS Việt Nam";
  if (item.sku.startsWith("BAT-VAR")) return "Varta Batteries Germany";
  if (item.sku.startsWith("TIRE-MIC")) return "Michelin Vietnam";
  if (item.sku.startsWith("TIRE-BS")) return "Bridgestone Tire VN";
  return "Nhà phân phối phụ tùng Tân Phong";
};

export default function InventoryPage() {
  const isHydrated = useHydrated();

  const items = useInventoryStore((s) => s.items);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockLevelFilter, setStockLevelFilter] = useState("ALL");

  const filteredItems = useMemo(() => {
    if (!isHydrated) return [];
    let list = items;

    if (categoryFilter !== "ALL") {
      list = list.filter((i) => i.category === categoryFilter);
    }

    if (stockLevelFilter === "LOW") {
      list = list.filter((i) => i.quantityInStock < 5);
    } else if (stockLevelFilter === "SAFE") {
      list = list.filter((i) => i.quantityInStock >= 5);
    }

    return list;
  }, [items, categoryFilter, stockLevelFilter, isHydrated]);

  const handleOpenImport = (itemId?: string) => {
    setSelectedItemId(itemId);
    setImportDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Mã SKU</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {row.original.sku}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Tên Phụ Tùng & Vật Tư",
        cell: ({ row }) => (
          <div className="flex flex-col max-w-sm">
            <span className="font-semibold text-xs text-slate-900">
              {row.original.name}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400" /> Vị trí: {row.original.shelfLocation}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Danh Mục",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 font-medium">
            {categoryLabels[row.original.category] || row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "quantityInStock",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-600"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Số Lượng Tồn</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const qty = row.original.quantityInStock;
          const isLow = qty < 5;
          return isLow ? (
            <Badge variant="danger" className="text-xs gap-1 font-bold">
              <AlertTriangle className="h-3 w-3" />
              <span>Còn {qty} {row.original.unit}</span>
            </Badge>
          ) : (
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 tabular-nums">
              {qty} {row.original.unit}
            </span>
          );
        },
      },
      {
        accessorKey: "retailPrice",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-600 ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Đơn Giá Bán</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-sky-600" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-sky-600" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-right font-bold text-xs tabular-nums text-slate-900 dark:text-slate-100">
            {formatVND(row.original.retailPrice)}
          </div>
        ),
      },
      {
        id: "supplier",
        header: "Nhà Cung Cấp",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <Building className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[160px]" title={getSupplierName(row.original)}>
              {getSupplierName(row.original)}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenImport(row.original.id)}
            className="h-7 text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
          >
            + Nhập
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Kho Phụ Tùng & Vật Tư
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kiểm soát xuất nhập tồn, vị trí ngăn kệ và cảnh báo hết hàng tự động
            </p>
          </div>

          <div>
            <Button
              onClick={() => handleOpenImport()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm flex items-center gap-2"
            >
              <PackagePlus className="h-4 w-4" />
              <span>Nhập Thêm Kho</span>
            </Button>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredItems}
          searchPlaceholder="Tìm theo mã SKU, tên phụ tùng, dòng xe tương thích..."
          searchFilterFn={(item, q) =>
            item.sku.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            item.shelfLocation.toLowerCase().includes(q) ||
            getSupplierName(item).toLowerCase().includes(q) ||
            item.compatibleModels.some((m) => m.toLowerCase().includes(q))
          }
          filterSlot={
            <>
              {/* Lọc danh mục */}
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Lọc theo danh mục phụ tùng"
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                >
                  <option value="ALL">Tất cả danh mục ({items.length})</option>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc mức tồn */}
              <select
                value={stockLevelFilter}
                onChange={(e) => setStockLevelFilter(e.target.value)}
                aria-label="Lọc theo mức độ tồn kho"
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              >
                <option value="ALL">Tất cả mức tồn</option>
                <option value="LOW">🚨 Sắp hết (SL &lt; 5)</option>
                <option value="SAFE">✅ An toàn (SL &gt;= 5)</option>
              </select>
            </>
          }
          emptyTitle="Không tìm thấy phụ tùng phù hợp"
          emptyDescription="Thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc danh mục."
          emptyAction={
            <Button
              size="sm"
              onClick={() => handleOpenImport()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <PackagePlus className="h-3.5 w-3.5 mr-1" /> Nhập Thêm Kho
            </Button>
          }
          renderMobileCard={(item) => {
            const isLow = item.quantityInStock < 5;
            return (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {item.sku}
                    </span>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1 truncate">
                      {item.name}
                    </p>
                  </div>
                  {isLow ? (
                    <Badge variant="danger" className="text-xs">
                      Còn {item.quantityInStock} {item.unit}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {item.quantityInStock} {item.unit}
                    </Badge>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>{categoryLabels[item.category] || item.category}</span>
                  <span>Kệ: {item.shelfLocation}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                    {formatVND(item.retailPrice)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenImport(item.id)}
                    className="h-7 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 dark:hover:bg-emerald-950/50"
                  >
                    + Nhập kho
                  </Button>
                </div>
              </div>
            );
          }}
        />

        {/* Dialog Nhập Kho */}
        <StockImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          selectedItemId={selectedItemId}
        />
      </div>
    </AppLayout>
  );
}
