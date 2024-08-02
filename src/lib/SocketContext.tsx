// context/SocketContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";
import { Transaksi } from "@/styles/types"; // Import the shared type
import { toast } from "@/components/ui/use-toast";

interface SocketContextProps {
  transactions: Transaksi[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaksi[]>>;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
    <SocketContext.Provider value={{ transactions, setTransactions }}>
      {children}
      {/* Audio element for notification sound */}
      <audio
        ref={notificationSoundRef}
        src="/mixkit-correct-answer-tone-2870.wav"
        preload="auto"
      />
    </SocketContext.Provider>
  );
};
