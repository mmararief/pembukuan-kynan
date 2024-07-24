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
