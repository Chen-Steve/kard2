import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, email } = await request.json();

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        id,
        email,
        profile: {
          create: {} // Creates an empty profile
        }
      },
      include: {
        profile: true
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 