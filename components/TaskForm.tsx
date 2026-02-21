'use client';
import { useState } from 'react';
import type { Task, User, SessionUser } from '@/lib/types';
import { today } from '@/lib/utils';

const STATUS_OPTS = [
  { value: 'PLANNED',    label: 'Planned' },
  { value: 'INPROGRESS', label: 'In Progress' },
  { value: 'DONE',       label: 'Done' },
  { value: 'BLOCKED',    label: 'Blocked' },
];

export function TaskForm({ task, users, currentUser, onSave, onClose, prefillAssigneeId }: {
  task?: Task | null; users: User[]; currentUser: SessionUser;
  onSave: (data: Partial<Task>) => Promise<void>;
  onClose: () => void; prefillAssigneeId?: string;
}) {
  const isAdmin = currentUser.role === 'ADMIN';
  const members = users.filter(u => u.role !== 'ADMIN');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    assigneeId:  task?.assigneeId  || prefillAssigneeId || (isAdmin ? '' : currentUser.id),
    date:        task?.date        || today(),
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'PLANNED',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({ id: task?.id, ...form });
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={submit}>
      {isAdmin && (
        <div className="form-row">
          <label className="input-label">Assignee</label>
          <select className="input" value={form.assigneeId} onChange={set('assigneeId')} required>
            <option value="">Select person…</option>
            {members.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}
      <div className="form-row">
        <label className="input-label">Title *</label>
        <input className="input" value={form.title} onChange={set('title')}
          placeholder="What needs to be done?" required
          disabled={!isAdmin && !!task} />
      </div>
      <div className="form-row">
        <label className="input-label">Details</label>
        <textarea className="input" value={form.description} onChange={set('description')} placeholder="Optional context…" />
      </div>
      <div className={`form-row ${isAdmin ? 'form-row-2' : ''}`}>
        <div>
          <label className="input-label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="input-label">Date</label>
            <input className="input" type="date" value={form.date} onChange={set('date')} />
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:4 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : (task ? 'Update Task' : 'Add Task')}
        </button>
      </div>
    </form>
  );
}
