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
    const tasks = await prisma.task.findMany({
      where: { date },
      include: { assignee: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(tasks);
  }

  // MEMBER: today only + own only — enforced in DB query
  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id, date: t },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { title, description, status, date, assigneeId } = body;
  if (!title?.trim() || !assigneeId)
    return NextResponse.json({ error: 'title and assigneeId required' }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'PLANNED',
      date: date || today(),
      assigneeId,
      createdById: user.id,
    },
    include: { assignee: { select: { id: true, name: true, color: true } } },
  });
  return NextResponse.json(task, { status: 201 });
}
