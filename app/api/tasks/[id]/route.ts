import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isAdmin = user.role === 'ADMIN';
  const isOwner = task.assigneeId === user.id;
  if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  // Members can only update status + description — never title/assignee/date
  const allowed = isAdmin
    ? ['title', 'description', 'status', 'date', 'assigneeId']
    : ['status', 'description'];

  const data: Record<string, any> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];

  const updated = await prisma.task.update({
    where: { id: params.id },
    data,
    include: { assignee: { select: { id: true, name: true, color: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
