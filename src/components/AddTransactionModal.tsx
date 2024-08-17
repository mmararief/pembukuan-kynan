import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "./ui/use-toast";
import { Transaksi, Produk } from "@/styles/types";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
interface AddTransactionModalProps {
  onSave: (transaction: Transaksi) => void;
}

interface PaymentMethod {
  id: number;
  nama_bank: string;
  no_rekening: string;
  nama_pemilik: string;
}

export function AddTransactionModal({ onSave }: AddTransactionModalProps) {
  const [form, setForm] = useState({
    tanggal: "",
    via: "Manual",
    nama: "",
    whatsapp: "",
    alamat: "",
    metode_pembayaran: "",
    total: 0,
    status: "Proses", // default status
    detailtransaksi: [],
  });

  const [products, setProducts] = useState<Produk[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id_produk: number;
      nama_produk: string;
      jumlah: number;
      harga: number;
      subtotal: number;
    }[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/produk");
        if (response.ok) {
          const products = await response.json();
          setProducts(products);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          description: "Gagal mengambil produk.",
        });
      }
    }

    async function fetchPaymentMethods() {
      try {
        const response = await fetch("/api/rekening");
        if (response.ok) {
          const methods = await response.json();
          setPaymentMethods(methods);
        } else {
          throw new Error("Failed to fetch payment methods");
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast({
          description: "Gagal mengambil metode pembayaran.",
        });
      }
    }

    fetchProducts();
    fetchPaymentMethods();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (
    id_produk: number,
    nama_produk: string,
    jumlah: number,
    harga: number
  ) => {
    setSelectedProducts((prevSelectedProducts) => {
      const existingProductIndex = prevSelectedProducts.findIndex(
        (product) => product.id_produk === id_produk
      );

      let updatedProducts;
      const subtotal = jumlah * harga;
      if (existingProductIndex !== -1) {
        updatedProducts = [...prevSelectedProducts];
        updatedProducts[existingProductIndex] = {
          id_produk,
          nama_produk,
          jumlah,
          harga,
          subtotal,
        };
      } else {
        updatedProducts = [
          ...prevSelectedProducts,
          { id_produk, nama_produk, jumlah, harga, subtotal },
        ];
      }

      const total = updatedProducts.reduce(
        (sum, product) => sum + product.subtotal,
        0
      );
      setForm((prevForm) => ({ ...prevForm, total }));

      return updatedProducts;
    });
  };

  const handleRemoveProduct = (id_produk: number) => {
    setSelectedProducts((prevSelectedProducts) => {
      const updatedProducts = prevSelectedProducts.filter(
        (product) => product.id_produk !== id_produk
      );

      const total = updatedProducts.reduce(
        (sum, product) => sum + product.subtotal,
        0
      );
      setForm((prevForm) => ({ ...prevForm, total }));

      return updatedProducts;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPaymentMethod = paymentMethods.find(
      (method) => method.nama_bank === form.metode_pembayaran
    );

    const formattedPaymentMethod = selectedPaymentMethod
      ? `${selectedPaymentMethod.nama_bank} - ${selectedPaymentMethod.no_rekening} - ${selectedPaymentMethod.nama_pemilik}`
      : form.metode_pembayaran;

    const transactionData = {
      ...form,
      metode_pembayaran: formattedPaymentMethod,
      detailtransaksi: selectedProducts,
    };

    try {
      // Save the transaction
      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const newTransaction = await response.json();
        onSave(newTransaction);

        // Transform the transaction for the invoice API
        const transformedTransaction = transformTransaction(newTransaction);

        // Send the invoice
        const sendInvoiceResponse = await fetch(`${apiUrl}/send-invoice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transformedTransaction),
        });

        if (sendInvoiceResponse.ok) {
          toast({
            description: "Pesanan diproses dan faktur berhasil dikirim!",
          });
        } else {
          alert("Gagal mengirim faktur.");
        }

        toast({
          description: "Transaksi berhasil disimpan.",
        });
        setForm({
          tanggal: "",
          via: "",
          nama: "",
          whatsapp: "",
          alamat: "",
          metode_pembayaran: "",
          total: 0,
          status: "Proses",
          detailtransaksi: [],
        });
        setSelectedProducts([]);
        setSelectedProduct(null);
      } else {
        throw new Error("Failed to save transaction");
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        description: "Gagal menyimpan transaksi.",
      });
    }
  };

  // Function to transform transaction object
  const transformTransaction = (transaction: Transaksi) => {
    return {
      id_transaksi: String(transaction.id_transaksi),
      tanggal: transaction.tanggal,
      via: transaction.via,
      nama: transaction.nama,
      whatsapp: transaction.whatsapp,
      alamat: transaction.alamat,
      metode_pembayaran: transaction.metode_pembayaran,
      status: transaction.status,
      total: Number(transaction.total),
      details: transaction.detailtransaksi.map((item) => ({
        nama_produk: item.produk.nama_produk,
        jumlah: item.jumlah,
        harga_satuan: Number(item.harga),
        subtotal: Number(item.subtotal),
      })),
    };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Tambah Transaksi</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Lengkapi form berikut untuk menambah transaksi baru.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              name="tanggal"
              type="date"
              placeholder="Tanggal"
              value={form.tanggal}
              onChange={handleChange}
            />
            {/* <Input
              name="via"
              placeholder="Via"
              value={form.via}
              onChange={handleChange}
            /> */}
            <Input
              name="nama"
              placeholder="Nama"
              value={form.nama}
              onChange={handleChange}
            />
            <Input
              name="whatsapp"
              placeholder="WhatsApp"
              value={form.whatsapp}
              onChange={handleChange}
            />
            <Input
              name="alamat"
              placeholder="Alamat"
              value={form.alamat}
              onChange={handleChange}
            />
            <div>
              <label>Metode Pembayaran:</label>
              <Select
                onValueChange={(value) => {
                  setForm((prevForm) => ({
                    ...prevForm,
                    metode_pembayaran: value,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method: PaymentMethod) => (
                    <SelectItem key={method.id} value={method.nama_bank}>
                      {method.nama_bank} - {method.no_rekening} (
                      {method.nama_pemilik})
                    </SelectItem>
                  ))}
                  <SelectItem value={"Tunai"}>Tunai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Produk:</label>
              <Select
                onValueChange={(value) => {
                  const selectedProduct = products.find(
                    (product) => product.id_produk === parseInt(value)
                  );
                  if (selectedProduct) {
                    setSelectedProduct(selectedProduct.id_produk);
                    handleProductChange(
                      selectedProduct.id_produk,
                      selectedProduct.nama_produk,
                      1,
                      parseInt(selectedProduct.harga_jual)
                    );
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.id_produk}
                      value={product.id_produk.toString()}
                    >
                      {product.nama_produk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduct && (
              <div className="mt-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  onChange={(e) => {
                    const jumlah = parseInt(e.target.value);
                    const selectedProductDetail = products.find(
                      (product) => product.id_produk === selectedProduct
                    );
                    if (selectedProductDetail) {
                      handleProductChange(
                        selectedProduct,
                        selectedProductDetail.nama_produk,
                        jumlah,
                        parseInt(selectedProductDetail.harga_jual)
                      );
                    }
                  }}
                />
                <Button
                  className="my-2"
                  onClick={() => {
                    setSelectedProduct(null);
                  }}
                >
                  Tambah Produk
                </Button>
              </div>
            )}
            <div>
              <label>Produk yang dipilih:</label>
              <ul className="selected-products-list">
                {selectedProducts.map((product) => (
                  <li key={product.id_produk}>
                    {product.nama_produk} - Jumlah: {product.jumlah} - Subtotal:{" "}
                    {product.subtotal}
                    <Button
                      variant="secondary"
                      onClick={() => handleRemoveProduct(product.id_produk)}
                    >
                      Hapus
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label>Total: </label>
              <span>{form.total}</span>
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
