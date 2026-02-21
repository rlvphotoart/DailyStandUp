import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { today } from '@/lib/utils';
import { Nav } from '@/components/Nav';
import { MyTodayClient } from './client';
import type { SessionUser } from '@/lib/types';

export default async function MyTodayPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const user = session.user as SessionUser;
  const t = today();

  // Server-enforced: only today's tasks for this user
  const [tasks, blockers] = await Promise.all([
    prisma.task.findMany({ where: { assigneeId: user.id, date: t }, orderBy: { createdAt: 'asc' } }),
    prisma.blocker.findMany({ where: { userId: user.id, date: t }, orderBy: { createdAt: 'asc' } }),
  ]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Nav user={user} />
      <main className="main fade-in">
        <MyTodayClient user={user} initialTasks={tasks as any} initialBlockers={blockers as any} today={t} />
      </main>
    </div>
  );
}
