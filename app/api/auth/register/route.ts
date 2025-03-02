import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedFields = SignUpSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: 'Invalid fields',
          details: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true }, // Only select id for efficiency
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Create user following NextAuth's expected schema
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        // Don't select password
      },
    });

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
