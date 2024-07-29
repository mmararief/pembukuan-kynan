export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export type MenuItemWithSubMenuProps = {
  item: SideNavItem;
  toggleOpen: () => void;
};

// types.ts
export interface Produk {
  id_produk: number;
  id_kategori: number;
  nama_produk: string;
  status: string;
  gambar: string;
  harga_jual: string;
  hpp: string | null; // Ensure this is consistent
}

export interface DetailTransaksi {
  id_detail: number;
  id_transaksi: number;
  id_produk: number;
  jumlah: number;
  harga: string;
  subtotal: string;
  produk: Produk;
}

export interface Transaksi {
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

interface PaymentMethod {
  id: number;
  nama_bank: string;
  no_rekening: string;
  nama_pemilik: string;
}
