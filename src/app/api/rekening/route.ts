import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';


const prisma = new PrismaClient();

export async function GET() {


    const rekening = await prisma.rekening.findMany({
       
    });

    return NextResponse.json(rekening);
}