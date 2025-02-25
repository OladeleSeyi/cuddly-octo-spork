"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Loan } from "@/types";
import { statusColors } from "@/lib/constants";
import { Card, CardContent } from "./ui/card";

export function LoansTable({
  loansData,
  isLoading,
}: {
  loansData: {
    loans: Loan[];
    totalLoans: number;
    totalPages: number;
    currentPage: number;
  };
  isLoading: boolean;
}) {
  const loans = loansData?.loans || [];
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expandedRows, setExpandedRows] = React.useState<
    Record<string, boolean>
  >({});

  const columns: ColumnDef<Loan>[] = [
    {
      accessorKey: "borrowerName",
      header: "Borrower",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("borrowerName")}</div>
        </div>
      ),
    },
    {
      accessorKey: "lenderName",
      header: "Lender",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("lenderName")}</div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "interestRate",
      header: "Interest Rate",
      cell: ({ row }) => {
        return <div>{row.getValue("interestRate")}%</div>;
      },
    },
    {
      accessorKey: "monthlyPayment",
      header: "Monthly Payment",
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("monthlyPayment"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div>{formatted}</div>;
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        return <div>{format(new Date(row.getValue("startDate")), "PP")}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusColors;
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const loan = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                setExpandedRows((prev) => ({
                  ...prev,
                  [loan.id]: !prev[loan.id],
                }));
              }}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  expandedRows[loan.id] ? "rotate-90" : ""
                }`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/loans/${loan.id}`)}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/loans/${loan.id}/payments`)}
                >
                  View Payments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    // Add approval logic
                  }}
                  disabled={loan.status !== "PENDING"}
                >
                  Approve Loan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: loans,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter borrowers..."
          value={
            (table.getColumn("borrowerName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("borrowerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Mobile expanded view */}
                  {expandedRows[row.original.id] && (
                    <TableRow className="md:hidden">
                      <TableCell colSpan={columns.length}>
                        <Card className="border-0 shadow-none">
                          <CardContent className="p-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                  Interest Rate
                                </div>
                                <div>{row.original.interestRate}%</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                  Monthly Payment
                                </div>
                                <div>
                                  $
                                  {row.original.monthlyPayment.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                  Start Date
                                </div>
                                <div>
                                  {format(
                                    new Date(row.original.startDate),
                                    "PP"
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-muted-foreground">
                                  Term
                                </div>
                                <div>{row.original.termMonths} months</div>
                              </div>
                            </div>
                            <Button
                              className="w-full mt-2"
                              onClick={() =>
                                router.push(`/loans/${row.original.id}`)
                              }
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
