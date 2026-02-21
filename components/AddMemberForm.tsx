'use client';
import { useState } from 'react';
import type { User } from '@/lib/types';

const COLORS = ['#6c63ff','#22c55e','#f97316','#3b82f6','#ec4899','#14b8a6','#f59e0b'];

export function AddMemberForm({ onSave, onClose }: {
  onSave: (data: Partial<User> & { password: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'pass123', role:'MEMBER' as const, color: COLORS[0] });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <label className="input-label">Full Name *</label>
        <input className="input" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
      </div>
      <div className="form-row">
        <label className="input-label">Email *</label>
        <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" required />
      </div>
      <div className="form-row form-row-2">
        <div>
          <label className="input-label">Password</label>
          <input className="input" value={form.password} onChange={set('password')} placeholder="pass123" required />
        </div>
        <div>
          <label className="input-label">Role</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <label className="input-label">Avatar Color</label>
        <div style={{ display:'flex', gap:8, marginTop:6 }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setForm(p => ({...p, color: c}))} style={{
              width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer',
              border: form.color === c ? '2.5px solid white' : '2.5px solid transparent',
              boxSizing:'border-box', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
              transition:'all 0.15s',
            }} />
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:4 }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Adding…' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}
