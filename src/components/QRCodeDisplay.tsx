"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import styles from "../styles/QRCodeDisplay.module.css"; // Import CSS module for styling

const QRCodeDisplay: React.FC = () => {
  const [qrCode, setQRCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { toast } = useToast();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/auth-status`);
        setIsAuthenticated(response.data.authenticated);
      } catch (err) {
        console.error("Failed to check auth status", err);
        setError("Failed to check auth status");
      }
    };

    checkAuthStatus();

    if (!apiUrl) {
      setError("API URL is not defined");
      return;
    }

    const socket: Socket = io(apiUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setError(null);
    });

    socket.on("qr", (qr: string) => {
      setQRCode(qr);
    });

    socket.on("authenticated", (status: boolean) => {
      setIsAuthenticated(status);
      if (status) {
        setQRCode(""); // Clear the QR code if authenticated
        toast({
          title: "Berhasil!",
          description: "Anda telah berhasil terhubung ke WhatsApp.",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl, toast]);

  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/logout`);
      setIsAuthenticated(false);
      setQRCode("");
      toast({
        variant: "destructive",
        title: "Berhasil logout!",
        description: "Anda telah berhasil logout dari WhatsApp.",
      });
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
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {isAuthenticated ? (
            <>
              <p className="text-green-500 font-bold text-xl text-center mb-4">
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
            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-center mb-4">
                Menunggu QR code...
              </p>
              <div className="mb-4">
                {/* <div className={styles.ldsgrid}>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div> */}

                <div className="qr-loader grid grid-cols-3 gap-1">
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                  <div className="w-16 h-16 bg-black"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center mt-8 md:mt-0 md:ml-8">
          <h2 className="text-xl font-semibold mb-4">Cara Penggunaan</h2>
          <ol className="list-decimal list-inside">
            <li>Buka aplikasi WhatsApp di ponsel Anda.</li>
            <li>Klik ikon titik tiga di pojok kanan atas.</li>
            <li>Pilih WhatsApp Web atau Perangkat Tertaut.</li>
            <li>Scan QR code yang ditampilkan di layar ini.</li>
            <li>Tunggu hingga tersambung dengan WhatsApp.</li>
            <li>
              Setelah tersambung, Anda bisa mengirim pesan melalui form di bawah
              QR code.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
