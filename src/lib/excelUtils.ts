import * as XLSX from "xlsx";
import { Transaksi } from "@/styles/types";
interface PembukuanEntry {
  id: number;
  tanggal: string;
  keterangan: string;
  debit: string;
  kredit: string;
  saldo: string;
}
export const exportToExcel = (data: PembukuanEntry[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pembukuan");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

export const exportLabaRugiToExcel = (
  transactions: Transaksi[],
  startDate: string,
  endDate: string
) => {
  let totalRevenue = 0;
  let totalCost = 0;
  const productSales: { [key: string]: number } = {};
  const productCosts: { [key: string]: number } = {};

  transactions.forEach((transaction) => {
    transaction.detailtransaksi.forEach((detail) => {
      totalRevenue += parseFloat(detail.subtotal);
      const hpp = detail.produk.hpp ? parseFloat(detail.produk.hpp) : 0;
      totalCost += hpp * detail.jumlah;

      const productName = detail.produk.nama_produk;
      const productSale = parseFloat(detail.subtotal);
      const productCost = hpp * detail.jumlah;

      if (!productSales[productName]) {
        productSales[productName] = 0;
      }
      if (!productCosts[productName]) {
        productCosts[productName] = 0;
      }

      productSales[productName] += productSale;
      productCosts[productName] += productCost;
    });
  });

  const profitLossData = [
    ["Deskripsi", "Jumlah"],
    ["Pendapatan", ""],
    ...Object.entries(productSales).map(([product, amount]) => [
      `Penjualan ${product}`,
      amount,
    ]),
    ["Total Pendapatan", totalRevenue],
    ["Beban", ""],
    ...Object.entries(productCosts).map(([product, amount]) => [
      `Harga Pokok Penjualan ${product}`,
      amount,
    ]),
    ["Total Beban", totalCost],
    ["Laba/Rugi Bersih", totalRevenue - totalCost],
  ];

  const ws = XLSX.utils.aoa_to_sheet(profitLossData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laba Rugi");
  XLSX.writeFile(wb, `Laba_Rugi_${startDate}_to_${endDate}.xlsx`);
};
