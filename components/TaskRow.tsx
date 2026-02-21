'use client';
import type { Task, SessionUser } from '@/lib/types';

const STATUS_CFG = {
  PLANNED:    { label: 'Planned',     badgeCls: 'badge-planned',    dotCls: 'dot-planned' },
  INPROGRESS: { label: 'In Progress', badgeCls: 'badge-inprogress', dotCls: 'dot-inprogress' },
  DONE:       { label: 'Done',        badgeCls: 'badge-done',       dotCls: 'dot-done' },
  BLOCKED:    { label: 'Blocked',     badgeCls: 'badge-blocked',    dotCls: 'dot-blocked' },
};

export function TaskRow({ task, currentUser, onEdit, onDelete }: {
  task: Task; currentUser: SessionUser;
  onEdit: (t: Task) => void; onDelete: (id: string) => void;
}) {
  const cfg = STATUS_CFG[task.status];
  const isAdmin = currentUser.role === 'ADMIN';
  return (
    <div className={`task-row ${task.status === 'DONE' ? 'done' : ''}`}>
      <div className={`dot ${cfg.dotCls}`} style={{ marginTop: 6 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="task-title" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, fontWeight:500 }}>{task.title}</span>
          <span className={`badge ${cfg.badgeCls}`}>{cfg.label}</span>
        </div>
        {task.description && (
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{task.description}</div>
        )}
      </div>
      <div style={{ display:'flex', gap:4, flexShrink:0 }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(task)} title="Edit">✎</button>
        {isAdmin && (
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(task.id)} title="Delete">✕</button>
        )}
      </div>
    </div>
  );
}
