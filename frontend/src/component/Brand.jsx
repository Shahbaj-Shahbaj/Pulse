/**
 * Pulse wordmark + logo mark.
 * Pure presentation — no data, no side effects.
 */
export function PulseMark({ size = 'md' }) {
  const px = size === 'lg' ? 26 : size === 'sm' ? 16 : 19;
  return (
    <span className={`brand-mark ${size}`} aria-hidden="true">
      <svg width={px} height={px} viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h4l2.5-7 4 14L15 12h7" />
      </svg>
    </span>
  );
}

export default function Brand({ size = 'md', showName = true, className = '' }) {
  return (
    <span className={`brand ${className}`}>
      <PulseMark size={size} />
      {showName && (
        <span className={`brand-name ${size === 'lg' ? 'lg' : ''}`}>
          Pul<em>se</em>
        </span>
      )}
    </span>
  );
}
