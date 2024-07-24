"use client";
import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart } from "lucide-react";

interface DetailTransaksi {
  id_detail: number;
  id_transaksi: number;
  id_produk: number;
  jumlah: number;
  harga: string;
  subtotal: string;
  produk: {
    id_produk: number;
    id_kategori: number;
    nama_produk: string;
    harga_jual: string;
    hpp: string | null;
    status: string;
    gambar: string;
  };
}

interface Transaksi {
  id_transaksi: number;
  tanggal: string;
  via: string;
  nama: string;
  whatsapp: string;
  alamat: string;
  metode_pembayaran: string;
  total: string;
  status: string;
  detailtransaksi: DetailTransaksi[];
}

interface SalesCardProps {
  transactions: Transaksi[];
}

const SalesCard: React.FC<SalesCardProps> = ({ transactions = [] }) => {
  const [todaySales, setTodaySales] = useState<number>(0);
  const [monthSales, setMonthSales] = useState<number>(0);
  const [todayItems, setTodayItems] = useState<number>(0);
  const [monthItems, setMonthItems] = useState<number>(0);

  useEffect(() => {
    calculateSales(transactions);
  }, [transactions]);

  const calculateSales = (transactions: Transaksi[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    let todaySalesTotal = 0;
    let monthSalesTotal = 0;
    let todayItemsTotal = 0;
    let monthItemsTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.status !== "Selesai") return;

      const transactionDate = new Date(transaction.tanggal);
      const transactionDateString = transactionDate.toISOString().slice(0, 10);

      if (transactionDateString === today) {
        todaySalesTotal += parseFloat(transaction.total);
        transaction.detailtransaksi.forEach((detail) => {
          todayItemsTotal += detail.jumlah;
        });
      }

      if (transactionDate.getMonth() === currentMonth) {
        monthSalesTotal += parseFloat(transaction.total);
        transaction.detailtransaksi.forEach((detail) => {
          monthItemsTotal += detail.jumlah;
        });
      }
    });

    setTodaySales(todaySalesTotal);
    setMonthSales(monthSalesTotal);
    setTodayItems(todayItemsTotal);
    setMonthItems(monthItemsTotal);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <div className="p-4 bg-white shadow-md rounded-lg flex items-center">
        <DollarSign className="w-10 h-10 text-green-500 mr-4" />
        <div>
          <h2 className="text-lg font-bold">Penjualan Hari Ini</h2>
          <p className="text-xl font-semibold text-gray-700">
            Rp {todaySales.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Jumlah Barang Terjual: {todayItems}
          </p>
        </div>
      </div>
      <div className="p-4 bg-white shadow-md rounded-lg flex items-center">
        <ShoppingCart className="w-10 h-10 text-blue-500 mr-4" />
        <div>
          <h2 className="text-lg font-bold">Penjualan Bulan Ini</h2>
          <p className="text-xl font-semibold text-gray-700">
            Rp {monthSales.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            Jumlah Barang Terjual: {monthItems}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesCard;
