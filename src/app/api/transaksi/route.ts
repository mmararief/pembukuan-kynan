import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
    const headersList = headers();
    const referer = headersList.get('referer');
    console.log(referer);

    const orders = await prisma.transaksi.findMany({
        orderBy: {
            tanggal: 'desc',
        },
        include: {
            detailtransaksi: {
                include: {
                    produk: true,
                },
            },
        },
    });

    return NextResponse.json(orders);
}


export async function POST(req: Request) {
  try {
    const { tanggal, via, nama, whatsapp, alamat, metode_pembayaran, total, status, detailtransaksi } = await req.json();

    // Create the transaksi record
    const createdTransaction = await prisma.transaksi.create({
      data: {
        tanggal: new Date(tanggal),
        via,
        nama,
        whatsapp,
        alamat,
        metode_pembayaran,
        total,
        status,
        detailtransaksi: {
          create: detailtransaksi.map((detail: any) => ({
            id_produk: detail.id_produk,
            jumlah: detail.jumlah,
            harga: detail.harga,
            subtotal: detail.subtotal,
          })),
        },
      },

      include: {
        detailtransaksi: {
          include: {
            produk: true
          }
        }
      }
    });

    return NextResponse.json(createdTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}