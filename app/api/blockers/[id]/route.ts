import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocker = await prisma.blocker.findUnique({ where: { id: params.id } });
  if (!blocker) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isAdmin = user.role === 'ADMIN';
  const isOwner = blocker.userId === user.id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.blocker.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocker = await prisma.blocker.findUnique({ where: { id: params.id } });
  if (!blocker) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (user.role !== 'ADMIN' && blocker.userId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.blocker.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
