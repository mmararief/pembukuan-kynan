// pages/index.tsx
"use client";
import { useSocket } from "@/lib/SocketContext";
import { ChartHpp } from "@/components/ChartHpp";
import { ChartPopuler } from "@/components/ChartPopuler";
import SalesCard from "@/components/SalesCard";
import { TabelTransaksi } from "@/components/TabelTransaksi";
import WaStatus from "@/components/WaStatus";
import { Transaksi } from "@/styles/types"; // Import the shared type
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { checkLoginStatus } from "@/lib/auth";
import { useEffect, useState } from "react";
const Home: React.FC = () => {
  const { transactions, setTransactions } = useSocket();
  const [user, setUser] = useState(null);

  const handleSave = (newTransaction: Transaksi) => {
    setTransactions([newTransaction, ...transactions]);
  };

  // useEffect(() => {
  //   async function fetchUser() {
  //     try {
  //       const loggedInUser = await checkLoginStatus();
  //       setUser(loggedInUser);
  //     } catch (error) {
  //       console.error(error);
  //       window.location.href = "http://192.168.100.199/kynan/login.php";
  //     }
  //   }

  //   fetchUser();
  // }, []);

  // if (!user) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>

      <div className="mb-6">
        <WaStatus />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <SalesCard transactions={transactions} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex-1 items-center">
            <ChartHpp transactions={transactions} />
          </div>
          <div className="flex-1">
            <ChartPopuler transactions={transactions} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <AddTransactionModal onSave={handleSave} />
        <TabelTransaksi
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>
    </div>
  );
};

export default Home;
