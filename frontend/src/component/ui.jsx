/**
 * Small shared presentational primitives used across Pulse pages.
 * These contain no API logic — they only render.
 */

/* Deterministic gradient per username so avatars stay stable across pages. */
const GRADIENTS = [
  'linear-gradient(135deg, #6d45f0, #0d8bff)',
  'linear-gradient(135deg, #7c3aed, #db2777)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f43f5e, #f59e0b)',
  'linear-gradient(135deg, #10b981, #0d8bff)',
  'linear-gradient(135deg, #8b5cf6, #22d3ee)',
];

export const gradientFor = (str = '') => {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return GRADIENTS[sum % GRADIENTS.length];
};

export const initials = (name = '') => (name || '?').substring(0, 2).toUpperCase();

export function Avatar({ name, size = '', ring = false, className = '' }) {
  const node = (
    <span
      className={`avatar ${size} ${className}`}
      style={{ background: gradientFor(name) }}
      title={name ? `@${name}` : undefined}
    >
      {initials(name)}
    </span>
  );
  return ring ? <span className="avatar-ring">{node}</span> : node;
}

export function Loader({ label }) {
  return (
    <div className="loading-spinner">
      <div style={{ display: 'grid', placeItems: 'center', gap: 14 }}>
        <div className="spinner" />
        {label && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>}
      </div>
    </div>
  );
}

export function PostSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skel-card" key={i}>
          <div className="skel-row">
            <div className="skeleton" style={{ width: 46, height: 46, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skel-line" style={{ width: '32%', marginBottom: 8 }} />
              <div className="skeleton skel-line" style={{ width: '18%', height: 10 }} />
            </div>
          </div>
          <div className="skeleton skel-line" style={{ width: '62%', height: 16, marginBottom: 12 }} />
          <div className="skeleton skel-line" style={{ width: '100%', marginBottom: 8 }} />
          <div className="skeleton skel-line" style={{ width: '88%', marginBottom: 8 }} />
          <div className="skeleton skel-line" style={{ width: '44%' }} />
        </div>
      ))}
    </>
  );
}

export function EmptyState({ icon, title, message, action, variant = '' }) {
  return (
    <div className={`empty-state ${variant}`}>
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
