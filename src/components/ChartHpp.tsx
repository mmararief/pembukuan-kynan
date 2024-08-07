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
import { Transaksi } from "@/styles/types";
// Define the types for the transaction data

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
        const hpp = detail.produk.hpp
          ? parseFloat(detail.produk.hpp) * detail.jumlah
          : 0;
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
    <div className="pt-5">
      <h2 className="text-2xl text-center font-semibold mb-4">
        Grafik Penjualan
      </h2>
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
    </div>
  );
}
