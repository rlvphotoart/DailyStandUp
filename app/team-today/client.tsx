'use client';
import { useState, useCallback } from 'react';
import { Modal } from '@/components/Modal';
import { TaskRow } from '@/components/TaskRow';
import { BlockerRow } from '@/components/BlockerRow';
import { TaskForm } from '@/components/TaskForm';
import { BlockerForm } from '@/components/BlockerForm';
import { AddMemberForm } from '@/components/AddMemberForm';
import { formatDate, getInitials } from '@/lib/utils';
import type { Task, Blocker, User, SessionUser } from '@/lib/types';

type ModalState =
  | null
  | { type: 'addTask'; assigneeId?: string }
  | { type: 'editTask'; item: Task }
  | { type: 'addBlocker'; userId?: string }
  | { type: 'editBlocker'; item: Blocker }
  | { type: 'addMember' };

export function TeamTodayClient({ currentUser, initialUsers, initialTasks, initialBlockers, today }: {
  currentUser: SessionUser; initialUsers: User[]; initialTasks: Task[]; initialBlockers: Blocker[]; today: string;
}) {
  const [users, setUsers]       = useState<User[]>(initialUsers);
  const [tasks, setTasks]       = useState<Task[]>(initialTasks);
  const [blockers, setBlockers] = useState<Blocker[]>(initialBlockers);
  const [modal, setModal]       = useState<ModalState>(null);
  const [tab, setTab]           = useState<'team' | 'members'>('team');

  const members = users.filter(u => u.role !== 'ADMIN');

  // Stats
  const total = tasks.length;
  const done  = tasks.filter(t => t.status === 'DONE').length;
  const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const peopleWithBlockers = new Set(blockers.filter(b => b.status === 'OPEN').map(b => b.userId)).size;

  const saveTask = useCallback(async (data: Partial<Task>) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/tasks' : `/api/tasks/${data.id}`, {
      method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    const saved = await res.json();
    setTasks(prev => isNew ? [...prev, saved] : prev.map(t => t.id === saved.id ? saved : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveBlocker = useCallback(async (data: Partial<Blocker>) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/blockers' : `/api/blockers/${data.id}`, {
      method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    const saved = await res.json();
    setBlockers(prev => isNew ? [...prev, saved] : prev.map(b => b.id === saved.id ? saved : b));
  }, []);

  const deleteBlocker = useCallback(async (id: string) => {
    await fetch(`/api/blockers/${id}`, { method: 'DELETE' });
    setBlockers(prev => prev.filter(b => b.id !== id));
  }, []);

  const saveMember = useCallback(async (data: any) => {
    const res = await fetch('/api/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); alert(e.error); return; }
    const saved = await res.json();
    setUsers(prev => [...prev, saved]);
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    if (!confirm('Delete this member? Their tasks will also be deleted.')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
    setTasks(prev => prev.filter(t => t.assigneeId !== id));
    setBlockers(prev => prev.filter(b => b.userId !== id));
  }, []);

  return (
    <>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-syne,Syne)', fontSize:22, fontWeight:800, lineHeight:1.2 }}>Team Today</h1>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{formatDate(today)}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type:'addMember' })}>+ Member</button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ type:'addTask' })}>+ Task</button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-grid">
        {[
          { num: total,              label: 'Total Tasks',      color: undefined },
          { num: `${pct}%`,          label: 'Complete',         color: 'var(--green)' },
          { num: blocked,            label: 'Blocked Tasks',    color: blocked ? 'var(--red)' : undefined },
          { num: peopleWithBlockers, label: 'People Blocked',   color: peopleWithBlockers ? 'var(--orange)' : undefined },
        ].map(({ num, label, color }) => (
          <div key={label} className="summary-card" style={{ borderColor: color || undefined }}>
            <div className="summary-num" style={{ color: color || 'var(--text)' }}>{num}</div>
            <div className="summary-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>Team View</button>
        <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Members</button>
      </div>

      {tab === 'team' && (
        <>
          {members.length === 0 && <div className="empty">No team members yet — add some!</div>}
          {members.map(member => {
            const mTasks    = tasks.filter(t => t.assigneeId === member.id);
            const mBlockers = blockers.filter(b => b.userId === member.id);
            const mDone     = mTasks.filter(t => t.status === 'DONE').length;
            return (
              <div key={member.id} style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div className="avatar" style={{ background: member.color + '22', color: member.color, border: `1.5px solid ${member.color}44` }}>
                    {getInitials(member.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{member.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>
                      {mDone}/{mTasks.length} tasks · {mBlockers.filter(b=>b.status==='OPEN').length} open blockers
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type:'addBlocker', userId: member.id })}>+ Blocker</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type:'addTask', assigneeId: member.id })}>+ Task</button>
                  </div>
                </div>
                {mTasks.length === 0 && mBlockers.length === 0
                  ? <div className="empty" style={{ padding:'14px 16px', fontSize:12 }}>Nothing assigned today.</div>
                  : <>
                      {mTasks.map(t => (
                        <TaskRow key={t.id} task={t} currentUser={currentUser}
                          onEdit={item => setModal({ type:'editTask', item })}
                          onDelete={deleteTask} />
                      ))}
                      {mBlockers.length > 0 && (
                        <div style={{ marginTop: mTasks.length ? 8 : 0 }}>
                          {mBlockers.map(b => (
                            <BlockerRow key={b.id} blocker={b} currentUser={currentUser}
                              onEdit={item => setModal({ type:'editBlocker', item })}
                              onDelete={deleteBlocker} />
                          ))}
                        </div>
                      )}
                    </>
                }
                <hr />
              </div>
            );
          })}
        </>
      )}

      {tab === 'members' && (
        <div>
          {users.map(u => (
            <div key={u.id} className="card-sm" style={{ marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
              <div className="avatar" style={{ background: u.color + '22', color: u.color, border: `1.5px solid ${u.color}44` }}>
                {getInitials(u.name)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{u.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:6 }}>
                  {u.email}
                  <span className={`badge badge-${u.role.toLowerCase()}`} style={{ padding:'1px 6px', fontSize:10, borderRadius:4 }}>{u.role}</span>
                </div>
              </div>
              {u.id !== currentUser.id && (
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteMember(u.id)}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'addTask' && (
        <Modal title="Add Task" onClose={() => setModal(null)}>
          <TaskForm users={users} currentUser={currentUser}
            prefillAssigneeId={(modal as any).assigneeId}
            onSave={saveTask} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editTask' && (
        <Modal title="Edit Task" onClose={() => setModal(null)}>
          <TaskForm task={(modal as any).item} users={users} currentUser={currentUser}
            onSave={saveTask} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'addBlocker' && (
        <Modal title="Add Blocker" onClose={() => setModal(null)}>
          <BlockerForm users={users} currentUser={currentUser}
            prefillUserId={(modal as any).userId}
            onSave={saveBlocker} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editBlocker' && (
        <Modal title="Edit Blocker" onClose={() => setModal(null)}>
          <BlockerForm blocker={(modal as any).item} users={users} currentUser={currentUser}
            onSave={saveBlocker} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'addMember' && (
        <Modal title="Add Team Member" onClose={() => setModal(null)}>
          <AddMemberForm onSave={saveMember} onClose={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}
