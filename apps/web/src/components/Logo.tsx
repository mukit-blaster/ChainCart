export const Logo = ({ size = 28, withText = true }: { size?: number; withText?: boolean }) => (
  <span className="inline-flex items-center gap-2.5 select-none">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="cc-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#cc-logo)" />
      <path
        d="M11 12 L11 20 L19 20"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="11" r="2.4" fill="white" />
      <path d="M22 13.4 L22 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
    {withText && (
      <span style={{ fontWeight: 600, fontSize: size * 0.6, letterSpacing: "-0.02em" }}>
        ChainCart
      </span>
    )}
  </span>
);
