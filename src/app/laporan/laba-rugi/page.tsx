"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Transaksi } from "@/styles/types";
import { exportToPDF } from "@/lib/pdfUtils";
import { exportLabaRugiToExcel } from "@/lib/excelUtils";
import { formatRupiah } from "@/lib/formatRupiah";
import { DatePicker } from "@/components/DatePicker";

const LabaRugi: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [data, setData] = useState<Transaksi[]>([]);

  const fetchData = async (startDate: Date, endDate: Date) => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const response = await fetch(
      `/api/labarugi?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );
    const result: Transaksi[] = await response.json();
    setData(result);
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const calculateProfitLoss = (transactions: Transaksi[]) => {
    let totalRevenue = 0;
    let totalCost = 0;
    const productSales: { [key: string]: number } = {};
    const productCosts: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      transaction.detailtransaksi.forEach((detail) => {
        totalRevenue += parseFloat(detail.subtotal);
        const hpp = detail.produk.hpp ? parseFloat(detail.produk.hpp) : 0;
        totalCost += hpp * detail.jumlah;

        const productName = detail.produk.nama_produk;
        const productSale = parseFloat(detail.subtotal);
        const productCost = hpp * detail.jumlah;

        if (!productSales[productName]) {
          productSales[productName] = 0;
        }
        if (!productCosts[productName]) {
          productCosts[productName] = 0;
        }

        productSales[productName] += productSale;
        productCosts[productName] += productCost;
      });
    });

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profitLoss: totalRevenue - totalCost,
      productSales,
      productCosts,
    };
  };

  const result = calculateProfitLoss(data);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Laba Rugi</h1>
      <div className="mb-4">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <DatePicker date={startDate} setDate={setStartDate} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
      </div>
      <div className="flex mb-4 space-x-4">
        <Button
          onClick={() => exportToPDF("labarugi-content", "laba-rugi.pdf")}
          className=" px-4 py-2"
        >
          Export to PDF
        </Button>
        <Button
          onClick={() =>
            exportLabaRugiToExcel(
              data,
              startDate?.toISOString().split("T")[0] || "",
              endDate?.toISOString().split("T")[0] || ""
            )
          }
          className=" px-4 py-2"
        >
          Export to Excel
        </Button>
      </div>

      <div id="labarugi-content" className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Laporan Laba & Rugi</h2>
        <p className="mb-2">Dapur Kynan</p>
        <p className="mb-6">
          Dari {startDate?.toLocaleDateString()} Sampai{" "}
          {endDate?.toLocaleDateString()}
        </p>
        <table className="min-w-full bg-white border mb-6">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Deskripsi</th>
              <th className="py-2 px-4 border">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border font-bold" colSpan={2}>
                Pendapatan
              </td>
            </tr>
            {Object.entries(result.productSales).map(([product, amount]) => (
              <tr key={product}>
                <td className="py-2 px-4 border">Penjualan {product}</td>
                <td className="py-2 px-4 border">{formatRupiah(amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 px-4 text-center border font-bold">
                Total Pendapatan
              </td>
              <td className="py-2 px-4 border">
                {formatRupiah(result.revenue)}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 border font-bold" colSpan={2}>
                Beban
              </td>
            </tr>
            {Object.entries(result.productCosts).map(([product, amount]) => (
              <tr key={product}>
                <td className="py-2 px-4 border">
                  Harga Pokok Penjualan {product}
                </td>
                <td className="py-2 px-4 border">{formatRupiah(amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 px-4 border text-center font-bold">
                Total Beban
              </td>
              <td className="py-2 px-4 border">{formatRupiah(result.cost)}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border font-bold">Laba/Rugi Bersih</td>
              <td className="py-2 px-4 border">
                {formatRupiah(result.profitLoss)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabaRugi;
