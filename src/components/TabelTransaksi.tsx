"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Modal } from "@/components/ModalDetailTransaksi"; // Adjust the import path as needed
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "./ui/use-toast";

interface DetailTransaksi {
  id_detail: number;
  id_transaksi: number;
  id_produk: number;
  jumlah: number;
  harga: string;
  subtotal: string;
  produk: {
    id_produk: number;
    id_kategori: number;
    nama_produk: string;
    harga_jual: string;
    hpp: string | null;
    status: string;
    gambar: string;
  };
}

interface Transaksi {
  id_transaksi: number;
  tanggal: string;
  via: string;
  nama: string;
  whatsapp: string;
  alamat: string;
  metode_pembayaran: string;
  total: string;
  status: string;
  detailtransaksi: DetailTransaksi[];
}

interface TabelTransaksiProps {
  transactions: Transaksi[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaksi[]>>;
}

export function TabelTransaksi({
  transactions,
  setTransactions,
}: TabelTransaksiProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const { toast } = useToast();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaksi | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleViewDetails = (transaction: Transaksi) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  // Function to transform transaction object
  const transformTransaction = (transaction: Transaksi) => {
    return {
      id_transaksi: String(transaction.id_transaksi),
      tanggal: transaction.tanggal,
      via: transaction.via,
      nama: transaction.nama,
      whatsapp: transaction.whatsapp,
      alamat: transaction.alamat,
      metode_pembayaran: transaction.metode_pembayaran,
      status: transaction.status,
      total: Number(transaction.total),
      details: transaction.detailtransaksi.map((item) => ({
        nama_produk: item.produk.nama_produk,
        jumlah: item.jumlah,
        harga_satuan: Number(item.harga),
        subtotal: Number(item.subtotal),
      })),
    };
  };

  const handleDelete = async (transactionId: number) => {
    try {
      const response = await fetch(`/api/transaksi/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTransactions((prev) =>
          prev.filter((tx) => tx.id_transaksi !== transactionId)
        );
        toast({
          description: "Berhasil menghapus transaksi.",
        });
      } else {
        alert("Failed to delete transaction.");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleCompleteOrder = async (transaction: Transaksi) => {
    try {
      // Update the status to 'completed'
      const updateStatusResponse = await fetch(
        `/api/transaksi/${transaction.id_transaksi}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Selesai" }),
        }
      );

      if (updateStatusResponse.ok) {
        // Transform the transaction before sending it
        const transformedTransaction = transformTransaction(transaction);

        // Send the request to generate and send the invoice
        const sendInvoiceResponse = await fetch(`${apiUrl}/send-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transformedTransaction),
        });

        if (sendInvoiceResponse.ok) {
          // Update state to reflect the completed status
          setTransactions((prev) =>
            prev.map((tx) =>
              tx.id_transaksi === transaction.id_transaksi
                ? { ...tx, status: "Selesai" }
                : tx
            )
          );
          toast({
            description: "Pesanan selesai dan faktur berhasil dikirim!",
          });
        } else {
          alert("Failed to send invoice.");
        }
      } else {
        alert("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const columns: ColumnDef<Transaksi>[] = [
    {
      accessorKey: "tanggal",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("tanggal"));
        return date.toLocaleDateString("id-ID", { timeZone: "UTC" });
      },
    },
    {
      accessorKey: "via",
      header: "Via",
    },
    {
      accessorKey: "nama",
      header: "Name",
    },
    {
      accessorKey: "whatsapp",
      header: "WhatsApp",
    },
    {
      accessorKey: "alamat",
      header: "Address",
    },
    {
      accessorKey: "metode_pembayaran",
      header: "Payment Method",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(total);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    transaction.id_transaksi.toString()
                  )
                }
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                Lihat detail pesanan
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(transaction.id_transaksi)}
              >
                Hapus transaksi
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCompleteOrder(transaction)}
              >
                Selesaikan pesanan dan kirim faktur
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nama")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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
      {/* Modal for Order Details */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </div>
  );
}
