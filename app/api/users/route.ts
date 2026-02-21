import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, color: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, email, password, role, color } = body;
  if (!name?.trim() || !email?.trim() || !password)
    return NextResponse.json({ error: 'name, email, password required' }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { name: name.trim(), email: email.trim(), password: hash, role: role || 'MEMBER', color: color || '#6c63ff' },
    select: { id: true, name: true, email: true, role: true, color: true },
  });
  return NextResponse.json(newUser, { status: 201 });
}
