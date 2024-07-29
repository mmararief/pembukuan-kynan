import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
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
      },
      include: {
        detailtransaksi: {
          include: {
            produk: true,
          },
        },
      },
      orderBy: {
        tanggal: 'asc',
      },
    });

    const pembukuanEntries: any[] = [];
    let saldo = 0;

    transactions.forEach(transaction => {
      const totalDebit = transaction.detailtransaksi.reduce((total, detail) => {
        if (detail.produk.hpp) {
          total += parseFloat(detail.subtotal.toFixed(2));
        }
        return total;
      }, 0);

      const totalKredit = transaction.detailtransaksi.reduce((total, detail) => {
        if (detail.produk.hpp) {
          total += parseFloat(detail.produk.hpp.toFixed(2)) * detail.jumlah;
        }
        return total;
      }, 0);

      saldo += totalKredit - totalDebit;

      pembukuanEntries.push({
        id: transaction.id_transaksi,
        tanggal: transaction.tanggal,
        keterangan: `Transaksi ID: ${transaction.id_transaksi}`,
        debit: totalDebit,
        kredit: totalKredit,
        saldo: saldo,
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
