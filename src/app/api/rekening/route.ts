import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';


const prisma = new PrismaClient();

export async function GET() {
    try {
      // Fetch all records from the 'rekening' table
      const rekening = await prisma.rekening.findMany();
      
      return NextResponse.json(rekening);
    } catch (error) {
      // Log the error and return a server error response
      console.error('Error fetching data from rekening table:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
  }