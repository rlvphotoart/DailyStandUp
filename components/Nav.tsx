'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import type { SessionUser } from '@/lib/types';

export function Nav({ user }: { user: SessionUser }) {
  const path = usePathname();
  return (
    <nav className="nav">
      <div className="nav-logo">StandupLoop</div>
      <div className="nav-sep" />
      {user.role === 'ADMIN' && (
        <>
          <Link href="/team-today" className={`btn btn-sm ${path === '/team-today' ? 'btn-primary' : 'btn-ghost'}`}>
            Team Today
          </Link>
          <Link href="/my-today" className={`btn btn-sm ${path === '/my-today' ? 'btn-primary' : 'btn-ghost'}`}>
            My Tasks
          </Link>
        </>
      )}
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
        <div className="avatar" style={{ background: user.color + '22', color: user.color, border: `1.5px solid ${user.color}44` }}>
          {getInitials(user.name ?? '')}
        </div>
        <span style={{ fontSize:13, color:'var(--text2)' }} className="hidden sm:block">{user.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => signOut({ callbackUrl: '/login' })}>Sign out</button>
      </div>
    </nav>
  );
}
