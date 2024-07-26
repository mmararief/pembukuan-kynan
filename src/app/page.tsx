// pages/index.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { ChartHpp } from "@/components/ChartHpp";
import { ChartPopuler } from "@/components/ChartPopuler";
import SalesCard from "@/components/SalesCard";
import { TabelTransaksi } from "@/components/TabelTransaksi";
import WaStatus from "@/components/WaStatus";
import io, { Socket } from "socket.io-client";
import { Transaksi } from "@/styles/types"; // Import the shared type

import { toast } from "@/components/ui/use-toast";
const Home: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch initial transaction data
    fetch("/api/transaksi")
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
      });

    const weebhookUrl = `${apiUrl}`;
    const socket: Socket = io(weebhookUrl, {
      transports: ["websocket", "polling"],
    });

    console.log("Connecting to Socket.io...");
    socket.on("newTransaction", (data: Transaksi) => {
      console.log("New transaction received:", data);
      toast({
        description: "Ada pesanan baru !",
      });
      setTransactions((prevTransactions) => [data, ...prevTransactions]);
      // Play the notification sound
      if (notificationSoundRef.current) {
        notificationSoundRef.current.play().catch((error) => {
          console.error("Error playing notification sound:", error);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("newTransaction");
    };
  }, [apiUrl]);

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
        <TabelTransaksi
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>
      {/* Audio element for notification sound */}
      <audio
        ref={notificationSoundRef}
        src="/mixkit-correct-answer-tone-2870.wav"
        preload="auto"
      />
    </div>
  );
};

export default Home;
