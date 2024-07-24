"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const WaStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (!apiUrl) {
          throw new Error("API URL is not defined");
        }
        const response = await axios.get(`${apiUrl}/auth-status`);
        setIsAuthenticated(response.data.authenticated);
      } catch (err) {
        console.error("Failed to check auth status", err);
        setError("Failed to check auth status");
      }
    };

    checkAuthStatus();
  }, [apiUrl]);

  return (
    <div className="flex flex-col space-y-4">
      <div
        className={`flex items-center justify-center font-bold rounded-full max-w-xs p-3 ${
          isAuthenticated
            ? "bg-green-200 border border-green-500 text-green-800"
            : "bg-red-200 border border-red-500 text-red-800"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full mr-2 ${
            isAuthenticated ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <div>
          {isAuthenticated
            ? "Whatsapp Tersambung"
            : "Whatsapp tidak Tersambung"}
        </div>
      </div>
    </div>
  );
};

export default WaStatus;
