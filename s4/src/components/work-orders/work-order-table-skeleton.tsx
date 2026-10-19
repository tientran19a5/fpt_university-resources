import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

export function WorkOrderTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <TableRow key={idx} className="animate-pulse">
          <TableCell>
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </TableCell>
          <TableCell>
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </TableCell>
          <TableCell className="text-right">
            <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
