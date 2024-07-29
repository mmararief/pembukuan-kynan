import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
  }

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
  });

  return NextResponse.json(transactions);
}
