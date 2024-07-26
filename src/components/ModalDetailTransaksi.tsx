// components/Modal.tsx
import { Transaksi } from "@/styles/types";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaksi | null;
}

export function Modal({ isOpen, onClose, transaction }: ModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg z-10 max-w-2xl w-full mx-4 md:mx-auto transition-transform transform-gpu scale-100 md:scale-105">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Order Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-lg font-medium">
              <strong>Transaction ID:</strong> {transaction.id_transaksi}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(transaction.tanggal).toLocaleDateString()}
            </p>
            <p>
              <strong>Via:</strong> {transaction.via}
            </p>
            <p>
              <strong>Name:</strong> {transaction.nama}
            </p>
            <p>
              <strong>WhatsApp:</strong> {transaction.whatsapp}
            </p>
            <p>
              <strong>Address:</strong> {transaction.alamat}
            </p>
            <p>
              <strong>Payment Method:</strong> {transaction.metode_pembayaran}
            </p>
            <p>
              <strong>Total:</strong> {transaction.total}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`text-sm font-semibold ${
                  transaction.status === "Selesai"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.status}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Order Items</h3>
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {transaction.detailtransaksi.map((item) => (
                <li
                  key={item.id_detail}
                  className="p-4 border rounded-md shadow-sm bg-gray-50"
                >
                  <p className="font-medium mb-2">
                    <strong>Product:</strong> {item.produk.nama_produk}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.jumlah}
                  </p>
                  <p>
                    <strong>Unit Price:</strong> {item.harga}
                  </p>
                  <p>
                    <strong>Subtotal:</strong> {item.subtotal}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
