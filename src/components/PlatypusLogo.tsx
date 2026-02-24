interface PlatypusLogoProps {
  size?: number;
  className?: string;
}

const PlatypusLogo: React.FC<PlatypusLogoProps> = ({ size = 48, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="-14 0 114 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Platypus"
  >
    {/* Body */}
    <ellipse cx="48" cy="58" rx="28" ry="20" fill="#7c5c3a" />

    {/* Tail - flat beaver tail */}
    <ellipse cx="78" cy="64" rx="16" ry="8" fill="#6b4f30" transform="rotate(-10 78 64)" />
    <ellipse cx="78" cy="64" rx="16" ry="8" fill="none" stroke="#5a4020" strokeWidth="0.8"
      transform="rotate(-10 78 64)"
      strokeDasharray="3 2" />

    {/* Head */}
    <ellipse cx="30" cy="52" rx="18" ry="15" fill="#8d6840" />

    {/* Ear */}
    <ellipse cx="28" cy="38" rx="5" ry="7" fill="#7c5c3a" />

    {/* Bill - flat and readable */}
    <path d="M 14 54 Q 4 52 6 58 Q 4 62 14 60 Z" fill="#c8964a" />
    <line x1="6" y1="57" x2="14" y2="57" stroke="#b07a30" strokeWidth="0.8" />

    {/* Coin scooped up below bill tip, being offered forward */}
    <circle cx="-1" cy="67" r="8" fill="#f5c518" />
    <circle cx="-1" cy="67" r="8" fill="none" stroke="#d4a800" strokeWidth="1.2" />
    <text x="-1" y="71" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#a07800">$</text>

    {/* Eye */}
    <circle cx="22" cy="49" r="3" fill="#1a0f00" />
    <circle cx="23" cy="48" r="1" fill="white" />

    {/* Front leg */}
    <ellipse cx="38" cy="76" rx="6" ry="4" fill="#7c5c3a" transform="rotate(-20 38 76)" />
    {/* Webbed foot hint */}
    <path d="M 33 78 Q 31 82 36 82 Q 34 82 39 82 Q 44 82 42 78" fill="#6b4f30" />

    {/* Rear leg */}
    <ellipse cx="58" cy="76" rx="6" ry="4" fill="#7c5c3a" transform="rotate(15 58 76)" />
    <path d="M 53 78 Q 51 82 56 82 Q 54 82 61 82 Q 66 82 64 78" fill="#6b4f30" />

    {/* Belly highlight */}
    <ellipse cx="47" cy="62" rx="16" ry="9" fill="#b8926a" opacity="0.4" />
  </svg>
);

export default PlatypusLogo;
