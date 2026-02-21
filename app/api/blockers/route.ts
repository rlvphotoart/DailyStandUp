import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { today } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const t = today();

  if (user.role === 'ADMIN') {
    const date = req.nextUrl.searchParams.get('date') || t;
    const blockers = await prisma.blocker.findMany({
      where: { date },
      include: { user: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(blockers);
  }

  // MEMBER: own + today only — enforced in DB
  const blockers = await prisma.blocker.findMany({
    where: { userId: user.id, date: t },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(blockers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });

  // Admin can assign to anyone; member can only assign to self
  const userId = user.role === 'ADMIN' && body.userId ? body.userId : user.id;

  const blocker = await prisma.blocker.create({
    data: {
      text: body.text.trim(),
      severity: body.severity || 'MED',
      needsHelpFrom: body.needsHelpFrom?.trim() || null,
      status: 'OPEN',
      date: body.date || today(),
      userId,
    },
    include: { user: { select: { id: true, name: true, color: true } } },
  });
  return NextResponse.json(blocker, { status: 201 });
}
