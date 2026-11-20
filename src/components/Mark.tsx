/** The Owed mark: a heartbeat line with the missed beat in red. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="var(--ink)" />
      <path d="M5 15h3l1.6-6 2.4 9 1.8-5H19" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1.6" fill="var(--red)" />
    </svg>
  );
}
