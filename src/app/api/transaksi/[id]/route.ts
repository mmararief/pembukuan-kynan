import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    // Delete related detailtransaksi records first
    await prisma.detailtransaksi.deleteMany({
      where: { id_transaksi: id },
    });

    // Then delete the transaksi record
    const deletedTransaction = await prisma.transaksi.delete({
      where: { id_transaksi: id },
    });

    return NextResponse.json(deletedTransaction);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const { status } = await req.json();

  try {
    // Update the transaction status
    const updatedTransaction = await prisma.transaksi.update({
      where: { id_transaksi: id },
      data: { status },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return NextResponse.json({ error: 'Failed to update transaction status' }, { status: 500 });
  }
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
    });

    return NextResponse.json(createdTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}