// Faithful port of the prototype's ProductArt — minimalist SVG illustrations
// per category so we can render rich product imagery without external assets.

interface Props {
  kind?: string | null;
  paletteJson?: string | null;
  className?: string;
}

const DEFAULT_PALETTE = ["#dbeafe", "#c7d2fe", "#2563EB"];

export const ProductArt = ({ kind, paletteJson, className }: Props) => {
  const palette = (() => {
    try {
      return paletteJson ? (JSON.parse(paletteJson) as string[]) : DEFAULT_PALETTE;
    } catch {
      return DEFAULT_PALETTE;
    }
  })();
  const [c1, c2, accent] = palette;
  const W = 400;
  const H = 400;
  const gradId = `g-${kind}-${accent}`.replace(/[^a-z0-9-]/gi, "");

  const wrap = (children: React.ReactNode) => (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${gradId})`} />
      {children}
    </svg>
  );

  switch (kind) {
    case "watch":
      return wrap(
        <>
          <circle cx="200" cy="200" r="100" fill="#0b1220" stroke={accent} strokeWidth="6" />
          <circle cx="200" cy="200" r="86" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1" />
          <line x1="200" y1="200" x2="200" y2="135" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="200" y1="200" x2="245" y2="200" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <circle cx="200" cy="200" r="5" fill="white" />
          <rect x="180" y="80" width="40" height="30" rx="6" fill="#0b1220" />
          <rect x="180" y="290" width="40" height="30" rx="6" fill="#0b1220" />
        </>,
      );
    case "sneaker":
      return wrap(
        <>
          <path
            d="M70 250 Q90 200 160 200 L260 200 Q310 200 330 250 L340 290 Q340 310 320 310 L90 310 Q70 310 70 290 Z"
            fill="#0b1220"
          />
          <path d="M160 200 Q160 170 200 170 L240 170 Q260 170 260 200" fill={accent} />
          <circle cx="200" cy="190" r="8" fill="white" />
          <path d="M90 280 L320 280" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity=".4" />
        </>,
      );
    case "phone":
      return wrap(
        <>
          <rect x="140" y="80" width="120" height="240" rx="22" fill="#0b1220" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
          <rect x="148" y="92" width="104" height="216" rx="14" fill={accent} opacity=".9" />
          <circle cx="200" cy="100" r="3" fill="rgba(0,0,0,.4)" />
        </>,
      );
    case "bag":
      return wrap(
        <>
          <path d="M120 160 L280 160 L300 320 L100 320 Z" fill={accent} />
          <path d="M150 160 Q150 110 200 110 Q250 110 250 160" fill="none" stroke="#0b1220" strokeWidth="6" />
          <rect x="180" y="220" width="40" height="6" rx="3" fill="#0b1220" />
        </>,
      );
    case "art":
      return wrap(
        <>
          <rect x="80" y="80" width="240" height="240" rx="6" fill="white" />
          <circle cx="170" cy="180" r="40" fill={accent} />
          <path d="M80 300 L160 220 L220 280 L320 200 L320 320 Z" fill="#0b1220" />
        </>,
      );
    case "headphones":
      return wrap(
        <>
          <path d="M120 200 Q120 100 200 100 Q280 100 280 200" fill="none" stroke="#0b1220" strokeWidth="14" strokeLinecap="round" />
          <rect x="100" y="195" width="50" height="80" rx="14" fill="#0b1220" />
          <rect x="250" y="195" width="50" height="80" rx="14" fill={accent} />
          <circle cx="125" cy="235" r="10" fill="rgba(255,255,255,.2)" />
        </>,
      );
    case "camera":
      return wrap(
        <>
          <rect x="90" y="140" width="220" height="140" rx="14" fill="#0b1220" />
          <circle cx="200" cy="210" r="50" fill={c1} stroke="white" strokeWidth="3" />
          <circle cx="200" cy="210" r="32" fill="#0b1220" />
          <circle cx="200" cy="210" r="20" fill={accent} />
          <rect x="240" y="120" width="40" height="22" rx="3" fill="#0b1220" />
        </>,
      );
    case "chair":
      return wrap(
        <>
          <path d="M130 100 L270 100 L270 230 L130 230 Z" fill={accent} />
          <rect x="130" y="220" width="140" height="20" fill="#0b1220" />
          <rect x="135" y="240" width="8" height="80" fill="#0b1220" />
          <rect x="257" y="240" width="8" height="80" fill="#0b1220" />
        </>,
      );
    default:
      return wrap(<circle cx="200" cy="200" r="80" fill={accent} />);
  }
};
