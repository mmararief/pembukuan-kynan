"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Image from "next/image";
import axios from "axios";

const QRCodeDisplay: React.FC = () => {
  const [qrCode, setQRCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError("API URL is not defined");
      return;
    }
    const socket: Socket = io(apiUrl, {
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
  }, [apiUrl]);

  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/logout`);
      setIsAuthenticated(false);
      setQRCode("");
    } catch (err) {
      console.error("Logout failed", err);
      setError("Logout failed");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/send-message`, {
        phoneNumber,
        message,
      });
      console.log("Message response:", response.data);
      setMessage("");
      alert("Message sent");
    } catch (err) {
      console.error("Failed to send message", err);
      setError("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isAuthenticated ? (
          <>
            <p className="text-green-500 font-bold text-lg text-center mb-4">
              Tersambung dengan WhatsApp
            </p>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded w-full mb-4"
              onClick={handleLogout}
            >
              Logout
            </button>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <input
                type="text"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border rounded p-2"
              />
              <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded p-2"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              >
                Send Message
              </button>
            </form>
          </>
        ) : qrCode ? (
          <div className="flex flex-col items-center">
            <p className="text-center text-lg font-semibold mb-4">
              Silahkan Scan Qr dibawah
            </p>
            <div className="bg-gray-200 p-4 rounded-lg shadow-md">
              <Image
                src={qrCode}
                alt="WhatsApp QR Code"
                width={500}
                height={500}
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">Menunggu QR code...</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
