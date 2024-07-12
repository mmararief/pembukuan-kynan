import QRCodeDisplay from "@/components/QRCodeDisplay";
import React from "react";

const WhatsappPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold p-4">Koneksi Whatsapp</h1>
      <QRCodeDisplay />
    </div>
  );
};

export default WhatsappPage;
