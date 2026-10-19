"use client";

import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Printer, 
  CheckCircle2, 
  Building2 
} from "lucide-react";
import { 
  useInvoiceStore, 
  useWorkOrderStore, 
  useCustomerStore, 
  useVehicleStore 
} from "@/stores";
import { seedGarageProfile } from "@/mocks/seedData";
import { formatVND, formatDateVN } from "@/lib/utils";
import { toast } from "sonner";

interface InvoicePrintSheetProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePrintSheet({
  invoiceId,
  open,
  onOpenChange,
}: InvoicePrintSheetProps) {
  const invoice = useInvoiceStore((s) => (invoiceId ? s.getById(invoiceId) : undefined));
  const recordPayment = useInvoiceStore((s) => s.recordPayment);

  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const customers = useCustomerStore((s) => s.customers);
  const vehicles = useVehicleStore((s) => s.vehicles);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!invoice) return null;

  const workOrder = workOrders.find((w) => w.id === invoice.workOrderId);
  const customer = customers.find((c) => c.id === invoice.customerId);
  const vehicle = workOrder ? vehicles.find((v) => v.id === workOrder.vehicleId) : undefined;

  const isPaid = invoice.paymentStatus === "paid";

  const handleMarkAsPaid = () => {
    recordPayment(invoice.id, invoice.remainingAmount, "bank_transfer");
    setPaymentSuccess(true);
    toast.success("Xác nhận thanh toán thành công!", {
      description: `Hóa đơn ${invoice.invoiceNumber} đã hoàn tất thanh toán (${formatVND(invoice.remainingAmount)}).`,
    });
    setTimeout(() => setPaymentSuccess(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6">
        {/* Header (hidden in print) */}
        <SheetHeader className="border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {invoice.invoiceNumber}
            </span>
            {isPaid ? (
              <Badge variant="success" className="text-xs">Đã thanh toán</Badge>
            ) : invoice.paymentStatus === "partial" ? (
              <Badge variant="warning" className="text-xs">Đặt cọc một phần</Badge>
            ) : (
              <Badge variant="danger" className="text-xs">Chưa thanh toán</Badge>
            )}
          </div>
          <SheetTitle className="text-xl font-heading font-bold text-slate-900 mt-2">
            Hóa Đơn Quyết Toán Dịch Vụ
          </SheetTitle>
          <SheetDescription className="text-xs">
            Chứng từ thanh toán sửa chữa và bảo dưỡng phương tiện
          </SheetDescription>
        </SheetHeader>

        {/* Action Buttons (Print / Mark Paid) - Hidden in Print */}
        <div className="flex items-center justify-end gap-2 print:hidden bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          {!isPaid && (
            <Button
              size="sm"
              onClick={handleMarkAsPaid}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{paymentSuccess ? "Đã Ghi Nhận!" : "Đánh Dấu Đã Thanh Toán"}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs flex items-center gap-1.5 border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Printer className="h-4 w-4" />
            <span>In Hóa Đơn (Print)</span>
          </Button>
        </div>

        {/* PRINTABLE INVOICE TEMPLATE (Optimized for Screen & Print) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Top Brand Banner */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                <span>{seedGarageProfile.name}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                {seedGarageProfile.address}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hotline: <span className="font-semibold text-slate-700 dark:text-slate-300">{seedGarageProfile.hotline}</span> • MST: {seedGarageProfile.taxId}
              </p>
            </div>

            <div className="text-right">
              <span className="font-heading text-xl font-bold text-sky-800 dark:text-sky-400 uppercase block tracking-wider">
                HÓA ĐƠN DỊCH VỤ
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                Ngày lập: {formatDateVN(invoice.issuedAt)}
              </span>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] block uppercase tracking-wider mb-1">
                Khách hàng
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{customer?.fullName || "Khách lẻ"}</p>
              <p className="text-slate-600 dark:text-slate-300">SĐT: {customer?.phoneNumber}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{customer?.address || "-"}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] block uppercase tracking-wider mb-1">
                Thông tin xe & Phiếu
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Biển số: <span className="font-mono text-sky-800 dark:text-sky-400">{vehicle?.licensePlate || "Chưa rõ"}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {vehicle?.brand} {vehicle?.model}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Phiếu SC: {workOrder?.code}
              </p>
            </div>
          </div>

          {/* Services & Parts Table */}
          <div className="space-y-3">
            <span className="font-semibold text-xs text-slate-800 block">
              Bảng kê chi tiết dịch vụ & phụ tùng:
            </span>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left bg-slate-50">
                  <th className="py-2 px-2 font-semibold">STT</th>
                  <th className="py-2 px-2 font-semibold">Nội Dung / Phụ Tùng</th>
                  <th className="py-2 px-2 text-center font-semibold">SL</th>
                  <th className="py-2 px-2 text-right font-semibold">Đơn Giá</th>
                  <th className="py-2 px-2 text-right font-semibold">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrder?.services.map((srv, idx) => (
                  <tr key={srv.id || idx}>
                    <td className="py-2 px-2 text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-800">{srv.name} (Công thợ)</td>
                    <td className="py-2 px-2 text-center">1</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatVND(srv.laborFee)}</td>
                    <td className="py-2 px-2 text-right font-semibold tabular-nums">{formatVND(srv.laborFee)}</td>
                  </tr>
                ))}
                {workOrder?.parts.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td className="py-2 px-2 text-slate-400">{(workOrder.services.length || 0) + idx + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-800">{p.partName}</td>
                    <td className="py-2 px-2 text-center tabular-nums">{p.quantity}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatVND(p.unitPrice)}</td>
                    <td className="py-2 px-2 text-right font-semibold tabular-nums">{formatVND(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tổng chi phí:</span>
                <span className="tabular-nums font-medium">{formatVND(invoice.totalAmount / 1.08)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Thuế VAT (8%):</span>
                <span className="tabular-nums font-medium">
                  {formatVND(invoice.totalAmount - invoice.totalAmount / 1.08)}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-1.5">
                <span>Tổng cộng:</span>
                <span className="text-sky-800 tabular-nums">{formatVND(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Đã thanh toán:</span>
                <span className="tabular-nums">{formatVND(invoice.paidAmount)}</span>
              </div>
              {invoice.remainingAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Còn nợ:</span>
                  <span className="tabular-nums">{formatVND(invoice.remainingAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Bank Info */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-950/60 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Thông tin chuyển khoản gara:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{seedGarageProfile.bankAccount.bankName}</span>
              <p className="font-mono text-slate-700 dark:text-slate-300">
                STK: <span className="font-bold">{seedGarageProfile.bankAccount.accountNumber}</span> • Chủ TK: {seedGarageProfile.bankAccount.accountHolder}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Hình thức:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {invoice.paymentMethod === "bank_transfer"
                  ? "Chuyển khoản (VietQR)"
                  : invoice.paymentMethod === "credit_card"
                  ? "Quẹt thẻ POS"
                  : "Tiền mặt tại quầy"}
              </span>
            </div>
          </div>

          {/* Signature lines */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">KHÁCH HÀNG</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
              <div className="h-16" />
              <p className="font-medium text-slate-700 dark:text-slate-300">{customer?.fullName}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">ĐẠI DIỆN GARA AUTOCARE PRO</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">(Ký và đóng dấu)</p>
              <div className="h-16" />
              <p className="font-medium text-slate-700 dark:text-slate-300">Bộ phận Thu Ngân</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
