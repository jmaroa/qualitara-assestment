import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TableProps = TableHTMLAttributes<HTMLTableElement>;
type SectionProps = HTMLAttributes<HTMLTableSectionElement>;
type RowProps = HTMLAttributes<HTMLTableRowElement>;
type HeadCellProps = ThHTMLAttributes<HTMLTableCellElement>;
type CellProps = TdHTMLAttributes<HTMLTableCellElement>;

export function Table({ className, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: SectionProps) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className, ...props }: SectionProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: RowProps) {
  return <tr className={cn("border-b border-[var(--color-border)]", className)} {...props} />;
}

export function TableHead({ className, ...props }: HeadCellProps) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-[var(--color-muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: CellProps) {
  return <td className={cn("p-4 align-middle", className)} {...props} />;
}
