import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const user = session.user as any;
  redirect(user.role === 'ADMIN' ? '/team-today' : '/my-today');
}
