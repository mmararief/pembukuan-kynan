import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const headersList = headers();
  const referer = headersList.get('referer');
  console.log(referer);

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Please provide both startDate and endDate' }, { status: 400 });
  }

  try {
    const transactions = await prisma.transaksi.findMany({
      where: {
        tanggal: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: "Selesai"
      },
      include: {
        detailtransaksi: {
          include: {
            produk: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    const pembukuanEntries: any[] = [];
    let saldo = 0;

    transactions.forEach(transaction => {
      transaction.detailtransaksi.forEach(detail => {
        // Convert Decimal to number and handle null values
        const debit = parseFloat(detail.harga.toString()) * detail.jumlah;
        const credit = detail.produk.hpp ? parseFloat(detail.produk.hpp.toString()) * detail.jumlah : 0;

        // Add debit transaction
        saldo += debit;
        pembukuanEntries.push({
          id: transaction.id_transaksi,
          tanggal: transaction.tanggal,
          keterangan: `Penjualan ${detail.produk.nama_produk} x ${detail.jumlah}`,
          debit: debit.toFixed(2),
          kredit: '-',
          saldo: saldo.toFixed(2),
        });

        // Subtract credit transaction
        saldo -= credit;
        pembukuanEntries.push({
          id: transaction.id_transaksi,
          tanggal: transaction.tanggal,
          keterangan: `Pembelian Bahan ${detail.produk.nama_produk} x ${detail.jumlah}`,
          debit: '-',
          kredit: credit.toFixed(2),
          saldo: saldo.toFixed(2),
        });
      });
    });

    return NextResponse.json(pembukuanEntries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
