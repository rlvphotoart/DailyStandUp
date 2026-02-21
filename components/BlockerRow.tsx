'use client';
import type { Blocker, SessionUser } from '@/lib/types';

const SEV_CFG = {
  LOW:  { label: 'Low',  cls: 'badge-low' },
  MED:  { label: 'Med',  cls: 'badge-med' },
  HIGH: { label: 'High', cls: 'badge-high' },
};

export function BlockerRow({ blocker, currentUser, onEdit, onDelete }: {
  blocker: Blocker; currentUser: SessionUser;
  onEdit: (b: Blocker) => void; onDelete: (id: string) => void;
}) {
  const sev = SEV_CFG[blocker.severity];
  const isAdmin = currentUser.role === 'ADMIN';
  return (
    <div className="blocker-row">
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
        <span className={`badge ${sev.cls}`}>{sev.label}</span>
        <span className={`badge ${blocker.status === 'RESOLVED' ? 'badge-resolved' : 'badge-open'}`}>
          {blocker.status.toLowerCase()}
        </span>
        <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(blocker)}>✎</button>
          {(isAdmin || blocker.userId === currentUser.id) && (
            <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(blocker.id)}>✕</button>
          )}
        </div>
      </div>
      <div style={{ fontSize:13, lineHeight:1.5 }}>{blocker.text}</div>
      {blocker.needsHelpFrom && (
        <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>Needs: {blocker.needsHelpFrom}</div>
      )}
    </div>
  );
}
