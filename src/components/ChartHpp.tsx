"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the types for the transaction data
interface Product {
  id_produk: number;
  id_kategori: number;
  nama_produk: string;
  status: string;
  gambar: string;
  harga_jual: string;
  hpp: string;
}

interface DetailTransaksi {
  id_detail: number;
  id_transaksi: number;
  id_produk: number;
  jumlah: number;
  harga: string;
  subtotal: string;
  produk: Product;
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

interface MonthlyData {
  month: string;
  penjualan: number;
  pengeluaran: number;
}

interface ChartHppProps {
  transactions: Transaksi[];
}

// Process the transaction data to get monthly penjualan and pengeluaran
const processData = (data: Transaksi[]): MonthlyData[] => {
  const monthlyData: { [key: string]: MonthlyData } = {};

  data.forEach((transaction) => {
    if (transaction.status === "Selesai") {
      const month = new Date(transaction.tanggal).toLocaleString("default", {
        month: "long",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, penjualan: 0, pengeluaran: 0 };
      }

      transaction.detailtransaksi.forEach((detail) => {
        const subtotal = parseFloat(detail.subtotal);
        const hpp = parseFloat(detail.produk.hpp) * detail.jumlah;
        monthlyData[month].penjualan += subtotal;
        monthlyData[month].pengeluaran += hpp;
      });
    }
  });

  return Object.values(monthlyData);
};

// Define chart configuration
const chartConfig: ChartConfig = {
  penjualan: {
    label: "Penjualan",
    color: "#2563eb",
  },
  pengeluaran: {
    label: "Pengeluaran",
    color: "#60a5fa",
  },
};

export function ChartHpp({ transactions = [] }: ChartHppProps) {
  const [chartData, setChartData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (transactions.length > 0) {
      setChartData(processData(transactions));
    }
  }, [transactions]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] max-w-xl">
      <BarChart width={500} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={(value) => value.slice(0, 3)} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="penjualan"
          fill={chartConfig.penjualan.color}
          radius={4}
        />
        <Bar
          dataKey="pengeluaran"
          fill={chartConfig.pengeluaran.color}
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}
