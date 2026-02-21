'use client';
import { useState, useCallback } from 'react';
import { Modal } from '@/components/Modal';
import { TaskRow } from '@/components/TaskRow';
import { BlockerRow } from '@/components/BlockerRow';
import { TaskForm } from '@/components/TaskForm';
import { BlockerForm } from '@/components/BlockerForm';
import { formatDate } from '@/lib/utils';
import type { Task, Blocker, SessionUser, User } from '@/lib/types';

type Modal_ = null | 'addTask' | 'addBlocker' | { type: 'editTask'; item: Task } | { type: 'editBlocker'; item: Blocker };

export function MyTodayClient({ user, initialTasks, initialBlockers, today }: {
  user: SessionUser; initialTasks: Task[]; initialBlockers: Blocker[]; today: string;
}) {
  const [tasks, setTasks]       = useState<Task[]>(initialTasks);
  const [blockers, setBlockers] = useState<Blocker[]>(initialBlockers);
  const [modal, setModal]       = useState<Modal_>(null);

  const users: User[] = [{ ...user, createdAt: '' }];

  const saveTask = useCallback(async (data: Partial<Task>) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/tasks' : `/api/tasks/${data.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const saved = await res.json();
    setBlockers(prev => isNew ? [...prev, saved] : prev.map(b => b.id === saved.id ? saved : b));
  }, []);

  const deleteBlocker = useCallback(async (id: string) => {
    await fetch(`/api/blockers/${id}`, { method: 'DELETE' });
    setBlockers(prev => prev.filter(b => b.id !== id));
  }, []);

  const done = tasks.filter(t => t.status === 'DONE').length;
  const total = tasks.length;

  return (
    <>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-syne,Syne)', fontSize:22, fontWeight:800, lineHeight:1.2 }}>My Today</h1>
          <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>{formatDate(today)}</div>
        </div>
        <span className="today-chip">{today}</span>
      </div>

      {total > 0 && (
        <div className="card-sm" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>Progress</span>
            <span style={{ fontSize:11, fontFamily:'var(--font-mono,monospace)', color:'var(--green)' }}>{done}/{total} done</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${total ? (done/total)*100 : 0}%` }} />
          </div>
        </div>
      )}

      <div className="section-title">
        Tasks for Today
        <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => setModal('addTask')}>+ Add</button>
      </div>
      {tasks.length === 0
        ? <div className="empty" style={{ marginBottom:16 }}>No tasks assigned for today.</div>
        : <div style={{ marginBottom:16 }}>
            {tasks.map(t => (
              <TaskRow key={t.id} task={t} currentUser={user}
                onEdit={item => setModal({ type:'editTask', item })}
                onDelete={deleteTask} />
            ))}
          </div>
      }

      <div className="section-title">
        Blockers
        <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => setModal('addBlocker')}>+ Add</button>
      </div>
      {blockers.length === 0
        ? <div className="empty">No blockers — you're clear! 🚀</div>
        : blockers.map(b => (
            <BlockerRow key={b.id} blocker={b} currentUser={user}
              onEdit={item => setModal({ type:'editBlocker', item })}
              onDelete={deleteBlocker} />
          ))
      }

      {modal === 'addTask' && (
        <Modal title="Add Task" onClose={() => setModal(null)}>
          <TaskForm users={users} currentUser={user} onSave={saveTask} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'addBlocker' && (
        <Modal title="Add Blocker" onClose={() => setModal(null)}>
          <BlockerForm users={users} currentUser={user} onSave={saveBlocker} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'editTask' && (
        <Modal title="Edit Task" onClose={() => setModal(null)}>
          <TaskForm task={modal.item} users={users} currentUser={user} onSave={saveTask} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal && typeof modal === 'object' && modal.type === 'editBlocker' && (
        <Modal title="Edit Blocker" onClose={() => setModal(null)}>
          <BlockerForm blocker={modal.item} users={users} currentUser={user} onSave={saveBlocker} onClose={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}
