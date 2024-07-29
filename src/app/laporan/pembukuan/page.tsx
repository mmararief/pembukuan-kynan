"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PembukuanEntry {
  id: number;
  tanggal: string;
  keterangan: string;
  debit: number;
  kredit: number;
  saldo: number;
}

const Pembukuan: React.FC = () => {
  const [data, setData] = useState<PembukuanEntry[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchData = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const response = await fetch(
      `/api/pembukuan?startDate=${startDate}&endDate=${endDate}`
    );
    const result: PembukuanEntry[] = await response.json();
    setData(result);
  };

  useEffect(() => {
    // Optionally, fetch initial data here if needed
    // fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Pembukuan</h1>

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
        Fetch Data
      </Button>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        {data.length > 0 ? (
          <table className="min-w-full bg-white border mb-6">
            <thead>
              <tr>
                <th className="py-2 px-4 border">No</th>
                <th className="py-2 px-4 border">Tanggal</th>
                <th className="py-2 px-4 border">Keterangan</th>
                <th className="py-2 px-4 border">Debit</th>
                <th className="py-2 px-4 border">Kredit</th>
                <th className="py-2 px-4 border">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr key={entry.id}>
                  <td className="py-2 px-4 border">{index + 1}</td>
                  <td className="py-2 px-4 border">
                    {new Date(entry.tanggal).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">{entry.keterangan}</td>
                  <td className="py-2 px-4 border">
                    {entry.debit.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="py-2 px-4 border">
                    {entry.kredit.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="py-2 px-4 border">
                    {entry.saldo.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available. Please select a date range and fetch data.</p>
        )}
      </div>
    </div>
  );
};

export default Pembukuan;
