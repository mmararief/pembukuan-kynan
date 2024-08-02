"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DatePicker } from "@/components/DatePicker"; // Adjust the import path as needed
import { exportToPDF } from "@/lib/pdfUtils";
import { exportToExcel } from "@/lib/excelUtils";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/formatRupiah";
import { checkLoginStatus } from "@/lib/auth";

interface PembukuanEntry {
  id: number;
  tanggal: string;
  keterangan: string;
  debit: string;
  kredit: string;
  saldo: string;
}

const BookkeepingTable: React.FC = () => {
  const [data, setData] = useState<PembukuanEntry[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const fetchData = async (start: Date, end: Date) => {
    try {
      const response = await axios.get("/api/pembukuan", {
        params: {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        },
      });
      console.log(response);
      const fetchedData: PembukuanEntry[] = response.data;
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const calculateTotalSaldo = () => {
    return data.reduce((total, entry) => {
      const saldoNumber = parseFloat(entry.saldo.replace(/[^0-9.-]+/g, ""));
      return saldoNumber;
    }, 0);
  };

  const totalSaldo = calculateTotalSaldo();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pembukuan</h1>
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
          onClick={() =>
            exportToPDF(
              "table-container",
              `pembukuan-${startDate?.toLocaleDateString(
                "id-ID"
              )}-${endDate?.toLocaleDateString("id-ID")}.pdf`
            )
          }
          className=" px-4 py-2"
        >
          Export to PDF
        </Button>
        <Button
          onClick={() => exportToExcel(data, "pembukuan")}
          className=" px-4 py-2"
        >
          Export to Excel
        </Button>
      </div>
      <div
        id="table-container"
        className="overflow-x-auto bg-white p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Laporan Keuangan</h2>
        <p className="mb-2">Dapur Kynan</p>
        <p className="mb-6">
          Dari {startDate?.toLocaleDateString("id-ID")} Sampai{" "}
          {endDate?.toLocaleDateString("id-ID")}
        </p>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border">No</th>
              <th className="py-2 px-4 border">Tanggal</th>
              <th className="py-2 px-4 border">ID Transaksi</th>
              <th className="py-2 px-4 border">Keterangan</th>
              <th className="py-2 px-4 border">Debit</th>
              <th className="py-2 px-4 border">Kredit</th>
              <th className="py-2 px-4 border">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">
                  {new Date(entry.tanggal).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border">{entry.id}</td>
                <td className="py-2 px-4 border">{entry.keterangan}</td>
                <td className="py-2 px-4 border">
                  {entry.debit !== "-"
                    ? formatRupiah(parseFloat(entry.debit))
                    : "-"}
                </td>
                <td className="py-2 px-4 border">
                  {entry.kredit !== "-"
                    ? formatRupiah(parseFloat(entry.kredit))
                    : "-"}
                </td>
                <td className="py-2 px-4 border">
                  {formatRupiah(parseFloat(entry.saldo))}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={6}
                className="py-2 px-4 border text-center font-bold"
              >
                Total Saldo
              </td>
              <td className="py-2 px-4 border">{formatRupiah(totalSaldo)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookkeepingTable;
