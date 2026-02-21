'use client';
import { useState } from 'react';
import type { Blocker, User, SessionUser } from '@/lib/types';
import { today } from '@/lib/utils';

export function BlockerForm({ blocker, users, currentUser, onSave, onClose, prefillUserId }: {
  blocker?: Blocker | null; users: User[]; currentUser: SessionUser;
  onSave: (data: Partial<Blocker>) => Promise<void>;
  onClose: () => void; prefillUserId?: string;
}) {
  const isAdmin = currentUser.role === 'ADMIN';
  const members = users.filter(u => u.role !== 'ADMIN');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    userId:       blocker?.userId       || prefillUserId || (isAdmin ? '' : currentUser.id),
    date:         blocker?.date         || today(),
    text:         blocker?.text         || '',
    severity:     blocker?.severity     || 'MED',
    needsHelpFrom:blocker?.needsHelpFrom|| '',
    status:       blocker?.status       || 'OPEN',
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSaving(true);
    await onSave({ id: blocker?.id, ...form });
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={submit}>
      {isAdmin && (
        <div className="form-row">
          <label className="input-label">Person</label>
          <select className="input" value={form.userId} onChange={set('userId')} required>
            <option value="">Select person…</option>
            {members.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}
      <div className="form-row">
        <label className="input-label">Blocker *</label>
        <textarea className="input" value={form.text} onChange={set('text')} placeholder="Describe what's blocking…" required />
      </div>
      <div className="form-row form-row-2">
        <div>
          <label className="input-label">Severity</label>
          <select className="input" value={form.severity} onChange={set('severity')}>
            <option value="LOW">Low</option>
            <option value="MED">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className="input-label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <label className="input-label">Needs Help From</label>
        <input className="input" value={form.needsHelpFrom} onChange={set('needsHelpFrom')} placeholder="Team or person name (optional)" />
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:4 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : (blocker ? 'Update Blocker' : 'Add Blocker')}
        </button>
      </div>
    </form>
  );
}
