import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
    const headersList = headers();
    const referer = headersList.get('referer');
    console.log(referer);

    const produk = await prisma.produk.findMany({
       
    });

    return NextResponse.json(produk);
}