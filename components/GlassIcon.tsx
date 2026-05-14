interface GlassIconProps {
  glass: string;
  className?: string;
}

export default function GlassIcon({ glass, className = "" }: GlassIconProps) {
  const base = {
    viewBox: "0 0 80 80",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    className: `w-full h-full ${className}`,
  };

  switch (glass) {
    case "Highball":
      return (
        <svg {...base}>
          <path
            d="M22 12 L25 68 L55 68 L58 12 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M23.5 26 L24.8 68 L55.2 68 L56.5 26 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <rect
            x="30"
            y="32"
            width="9"
            height="9"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(-8 34.5 36.5)"
          />
          <rect
            x="41"
            y="35"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(6 45 39)"
          />
          <line
            x1="46"
            y1="12"
            x2="52"
            y2="42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="27" cy="50" r="1.2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="28" cy="57" r="0.9" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case "Coupe":
    case "Nick & Nora":
      return (
        <svg {...base}>
          <path
            d="M14 16 Q14 46 40 50 Q66 46 66 16 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M17 22 Q18 44 40 47 Q62 44 63 22 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="40"
            y1="50"
            x2="40"
            y2="66"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="28"
            y1="66"
            x2="52"
            y2="66"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M52 18 Q56 14 58 18 Q60 22 56 24"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "Tiki":
      return (
        <svg {...base}>
          <path
            d="M20 18 L23 68 L57 68 L60 18 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M22 32 L23 68 L57 68 L58 32 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="20"
            y1="22"
            x2="60"
            y2="22"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <path
            d="M24 31 Q30 27 36 31"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M44 31 Q50 27 56 31"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="30" cy="37" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="37" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M36 45 Q40 49 44 45"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M27 54 Q40 60 53 54"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="33"
            y1="54"
            x2="33"
            y2="58"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="40"
            y1="56"
            x2="40"
            y2="60"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="47"
            y1="54"
            x2="47"
            y2="58"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );

    case "Rocks":
      return (
        <svg {...base}>
          <path
            d="M16 28 L20 66 L60 66 L64 28 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 42 L20 66 L60 66 L61.5 42 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="16"
            y1="28"
            x2="64"
            y2="28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="30" cy="52" r="1.4" fill="currentColor" fillOpacity="0.2" />
          <circle cx="44" cy="56" r="1" fill="currentColor" fillOpacity="0.2" />
          <circle cx="50" cy="48" r="1.2" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case "Beer":
      return (
        <svg {...base}>
          <path
            d="M18 22 L20 66 L52 66 L54 22 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M54 30 Q66 30 66 44 Q66 58 54 58"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 22 Q22 16 28 22 Q34 16 40 22 Q46 16 52 22 Q55 16 58 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19.5 34 L20.8 66 L51.2 66 L52.5 34 Z"
            fill="currentColor"
            fillOpacity="0.07"
          />
          <circle cx="32" cy="52" r="1.5" fill="currentColor" fillOpacity="0.2" />
          <circle cx="38" cy="44" r="1" fill="currentColor" fillOpacity="0.2" />
          <circle cx="42" cy="55" r="1.2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case "Wine":
      return (
        <svg {...base}>
          <path
            d="M20 12 Q20 38 40 44 Q60 38 60 12 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M24 28 Q25 40 40 44 Q55 40 56 28 Z"
            fill="currentColor"
            fillOpacity="0.09"
          />
          <line
            x1="40"
            y1="44"
            x2="40"
            y2="64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="27"
            y1="64"
            x2="53"
            y2="64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M34 43 Q36 47 40 48 Q44 47 46 43"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    default:
      return null;
  }
}
