"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Image from "next/image";

const QRCodeDisplay: React.FC = () => {
  const [qrCode, setQRCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const socket: Socket = io("http://localhost:8000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to server");
      setError(null);
    });

    socket.on("qr", (qr: string) => {
      console.log("QR code received:", qr);
      setQRCode(qr);
    });

    socket.on("authenticated", (status: boolean) => {
      setIsAuthenticated(status);
      if (status) {
        setQRCode("");
      }
    });

    socket.on("connect_error", (err) => {
      setError("Failed to connect to the server.");
      console.error("Connection error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center border-gray-400 shadow-2xl min-h-screen">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isAuthenticated ? (
        <p className="text-green-500 font-bold">Tersambung dengan WhatsApp</p>
      ) : qrCode ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Image src={qrCode} alt="WhatsApp QR Code" width={500} height={500} />
        </div>
      ) : (
        <p className="text-gray-500">Menunggu QR code...</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
