"use client";
import { useEffect, useState } from "react";
import { ChartHpp } from "@/components/ChartHpp";
import { ChartPopuler } from "@/components/ChartPopuler";
import SalesCard from "@/components/SalesCard";
import { TabelTransaksi } from "@/components/TabelTransaksi";
import WaStatus from "@/components/WaStatus";

export default function Home() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("/api/transaksi")
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
      });
  }, []);

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <WaStatus />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <SalesCard transactions={transactions} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex-1">
            <ChartHpp transactions={transactions} />
          </div>
          <div className="flex-1">
            <ChartPopuler transactions={transactions} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <TabelTransaksi />
      </div>
    </div>
  );
}
