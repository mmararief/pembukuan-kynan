"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Transaction {
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

interface DetailTransaksi {
  id_detail: number;
  id_transaksi: number;
  id_produk: number;
  jumlah: number;
  harga: string;
  subtotal: string;
  produk: Produk;
}

interface Produk {
  id_produk: number;
  id_kategori: number;
  nama_produk: string;
  status: string;
  gambar: string;
  harga_jual: string;
  hpp: string;
}

interface ProductData {
  name: string;
  count: number;
  fill: string;
}

interface ChartPopulerProps {
  transactions: Transaction[];
}

const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const processData = (data: Transaction[]): ProductData[] => {
  const currentMonth = new Date().getMonth();
  const productData: Record<string, ProductData> = {};

  data.forEach((transaction) => {
    if (transaction.status === "Selesai") {
      const transactionMonth = new Date(transaction.tanggal).getMonth();
      if (transactionMonth === currentMonth) {
        transaction.detailtransaksi.forEach((detail) => {
          const productName = detail.produk.nama_produk;
          if (!productData[productName]) {
            productData[productName] = {
              name: productName,
              count: 0,
              fill: getRandomColor(),
            };
          }
          productData[productName].count += detail.jumlah;
        });
      }
    }
  });

  return Object.values(productData);
};

const calculateSalesChange = (data: Transaction[]) => {
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  let currentMonthSales = 0;
  let lastMonthSales = 0;

  data.forEach((transaction) => {
    if (transaction.status === "Selesai") {
      const transactionMonth = new Date(transaction.tanggal).getMonth();
      const total = parseFloat(transaction.total);

      if (transactionMonth === currentMonth) {
        currentMonthSales += total;
      } else if (transactionMonth === lastMonth) {
        lastMonthSales += total;
      }
    }
  });

  const percentageChange =
    ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100;
  return {
    currentMonthSales,
    lastMonthSales,
    percentageChange,
  };
};

const chartConfig = {
  count: {
    label: "Count",
  },
  products: {
    label: "Products",
  },
} satisfies ChartConfig;

export function ChartPopuler({ transactions = [] }: ChartPopulerProps) {
  const [chartData, setChartData] = React.useState<ProductData[]>([]);
  const [salesChange, setSalesChange] = React.useState<{
    currentMonthSales: number;
    lastMonthSales: number;
    percentageChange: number;
  }>({ currentMonthSales: 0, lastMonthSales: 0, percentageChange: 0 });

  React.useEffect(() => {
    if (transactions.length > 0) {
      const filteredData = transactions.filter(
        (transaction) => transaction.status === "Selesai"
      );
      setChartData(processData(filteredData));
      setSalesChange(calculateSalesChange(filteredData));
    }
  }, [transactions]);

  const totalProducts = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  const isSalesUp = salesChange.percentageChange >= 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Produk Paling Populer</CardTitle>
        <CardDescription>Bulan Ini</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalProducts.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Produk
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {isSalesUp ? (
            <>
              Penjualan naik {salesChange.percentageChange.toFixed(2)}% bulan
              ini
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Penjualan turun{" "}
              {Math.abs(salesChange.percentageChange).toFixed(2)}% bulan ini
              <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Menampilkan produk terpopuler pada bulan ini
        </div>
      </CardFooter>
    </Card>
  );
}
