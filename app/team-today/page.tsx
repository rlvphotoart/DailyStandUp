import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { today } from '@/lib/utils';
import { Nav } from '@/components/Nav';
import { TeamTodayClient } from './client';
import type { SessionUser } from '@/lib/types';

export default async function TeamTodayPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const user = session.user as SessionUser;
  if (user.role !== 'ADMIN') redirect('/my-today');

  const t = today();
  const [users, tasks, blockers] = await Promise.all([
    prisma.user.findMany({ select:{ id:true,name:true,email:true,role:true,color:true }, orderBy:{ createdAt:'asc' } }),
    prisma.task.findMany({ where:{ date:t }, include:{ assignee:{ select:{ id:true,name:true,color:true } } }, orderBy:{ createdAt:'asc' } }),
    prisma.blocker.findMany({ where:{ date:t }, include:{ user:{ select:{ id:true,name:true,color:true } } }, orderBy:{ createdAt:'asc' } }),
  ]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Nav user={user} />
      <main className="main fade-in">
        <TeamTodayClient currentUser={user} initialUsers={users as any} initialTasks={tasks as any} initialBlockers={blockers as any} today={t} />
      </main>
    </div>
  );
}
