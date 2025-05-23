import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Update last login timestamp
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 