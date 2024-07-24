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
  }, [apiUrl]);

  return (
    <div
      className={` flex justify-center font-bold rounded-full max-w-[15rem] p-2  ${
        isAuthenticated
          ? "bg-green-200 border border-green-500 text-black "
          : "bg-red-200 border text-sm border-red-500 text-black"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full mt-1 mr-2 ${
          isAuthenticated ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <div className="">
        {isAuthenticated ? "Whatsapp Tersambung" : "Whatsapp tidak Tersambung"}
      </div>
    </div>
  );
};

export default WaStatus;
