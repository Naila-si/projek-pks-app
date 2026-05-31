// src/components/common/StatusBadge.jsx
export default function StatusBadge({ status }) {
  // Normalize status string
  const normStatus = String(status || '').trim();

  let styles = 'bg-slate-50 text-slate-600 border-slate-200';
  let label = normStatus;
// 
  if (normStatus === 'Aktif') {
    styles = 'bg-[var(--color-status-aktif-bg)] text-[var(--color-status-aktif-text)] border-[var(--color-status-aktif-border)]';
    label = 'Aktif';
  } else if (normStatus === 'Segera Berakhir') {
    styles = 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)] border-[var(--color-status-warning-border)]';
    label = 'Segera Berakhir';
  } else if (normStatus === 'Berakhir') {
    styles = 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)] border-[var(--color-status-danger-border)]';
    label = 'Berakhir';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-soft"></span>
      {label}
    </span>
  );
}
