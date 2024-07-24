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
