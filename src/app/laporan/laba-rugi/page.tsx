"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Transaksi } from "@/styles/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LabaRugi: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [data, setData] = useState<Transaksi[]>([]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const response = await fetch(
      `/api/labarugi?startDate=${startDate}&endDate=${endDate}`
    );
    const result: Transaksi[] = await response.json();
    setData(result);
  };

  const calculateProfitLoss = (transactions: Transaksi[]) => {
    let totalRevenue = 0;
    let totalCost = 0;

    transactions.forEach((transaction) => {
      transaction.detailtransaksi.forEach((detail) => {
        totalRevenue += parseFloat(detail.subtotal);
        if (detail.produk.hpp) {
          totalCost += parseFloat(detail.produk.hpp) * detail.jumlah;
        }
      });
    });

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profitLoss: totalRevenue - totalCost,
    };
  };

  const result = calculateProfitLoss(data);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Laba & Rugi", 14, 20);
    doc.text("Dapur Kynan", 14, 30);
    doc.text(`Dari ${startDate} Sampai ${endDate}`, 14, 40);

    // Add summary table
    autoTable(doc, {
      startY: 50,
      head: [["Description", "Amount"]],
      body: [
        ["Pendapatan dari Penjualan", ""],
        ["Penjualan", result.revenue],
        ["Harga Pokok Penjualan", `(${result.cost})`],
        ["Laba Kotor", result.profitLoss],
      ],
    });

    // // Add detail tables
    // data.forEach((transaction, index) => {
    //   if (index > 0) doc.addPage();
    //   doc.text(`Transaksi ID: ${transaction.id_transaksi}`, 14, 20);
    //   doc.text(
    //     `Tanggal: ${new Date(transaction.tanggal).toLocaleDateString()}`,
    //     14,
    //     30
    //   );

    //   const detailRows = transaction.detailtransaksi.map((detail) => [
    //     detail.produk.nama_produk,
    //     detail.jumlah,
    //     detail.harga,
    //     detail.subtotal,
    //   ]);

    //   autoTable(doc, {
    //     startY: 40,
    //     head: [["Produk", "Jumlah", "Harga", "Subtotal"]],
    //     body: detailRows,
    //   });
    // });

    doc.save(`Laporan_Laba_Rugi_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Laba Rugi</h1>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Start Date:
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <Button
        onClick={fetchData}
        className="bg-blue-500 text-white p-2 w-full mb-6"
      >
        Submit
      </Button>
      <Button
        onClick={downloadPDF}
        className="bg-green-500 text-white p-2 w-full mb-6"
      >
        Download PDF
      </Button>

      <div id="labarugi-content" className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Laporan Laba & Rugi</h2>
        <p className="mb-2">Dapur Kynan</p>
        <p className="mb-6">
          Dari {startDate} Sampai {endDate}
        </p>

        <table className="min-w-full bg-white border mb-6">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border font-bold" colSpan={2}>
                Pendapatan dari Penjualan
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">Penjualan</td>
              <td className="py-2 px-4 border">{result.revenue}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">Harga Pokok Penjualan</td>
              <td className="py-2 px-4 border">({result.cost})</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border font-bold">Laba Kotor</td>
              <td className="py-2 px-4 border">{result.profitLoss}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* <div className="bg-white p-6 rounded-lg shadow-lg my-4">
        <h3 className="text-xl font-bold mb-4">Detail Penjualan</h3>
        {data.map((transaction) => (
          <div key={transaction.id_transaksi} className="mb-4">
            <h4 className="font-bold mb-2">
              Transaksi ID: {transaction.id_transaksi}
            </h4>
            <p className="mb-2">
              Tanggal: {new Date(transaction.tanggal).toLocaleDateString()}
            </p>
            <table className="min-w-full bg-white border mb-6">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Produk</th>
                  <th className="py-2 px-4 border">Jumlah</th>
                  <th className="py-2 px-4 border">Harga</th>
                  <th className="py-2 px-4 border">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaction.detailtransaksi.map((detail) => (
                  <tr key={detail.id_detail}>
                    <td className="py-2 px-4 border">
                      {detail.produk.nama_produk}
                    </td>
                    <td className="py-2 px-4 border">{detail.jumlah}</td>
                    <td className="py-2 px-4 border">{detail.harga}</td>
                    <td className="py-2 px-4 border">{detail.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default LabaRugi;
