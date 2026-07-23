type TradeTrustLogoProps = {
  variant?: 'dark' | 'light';
  className?: string;
};

/**
 * TradeTrust wordmark — the docket tab (folded orange corner) pairs with the
 * stamp mark used for the favicon and social avatar.
 *
 * variant="dark"  -> text renders dark, for use on light/white backgrounds
 * variant="light" -> text renders light, for use on dark backgrounds (e.g. the early-access hero)
 */
export default function TradeTrustLogo({ variant = 'dark', className }: TradeTrustLogoProps) {
  const textColor = variant === 'dark' ? '#14171B' : '#F8F5EE';
  const foldStroke = variant === 'dark' ? '#F8F5EE' : '#14171B';

  return (
    <svg viewBox="0 0 200 50" className={className} style={{ height: '28px', width: 'auto' }}>
      <text x="0" y="34" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="800" letterSpacing="-0.5" fill={textColor}>
        TradeTrust
      </text>
      <path d="M 180 4 L 197 4 L 197 21 Z" fill="#E8631C" />
      <path d="M 180 4 L 197 21" stroke={foldStroke} strokeWidth="1" />
    </svg>
  );
}
