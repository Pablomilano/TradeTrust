import Link from 'next/link';

const TRADES = [
  'Electrician',
  'Plumber',
  'Gas Engineer',
  'Builder',
  'Joiner',
  'Plasterer',
  'Painter & Decorator',
  'General Maintenance',
];

function TradeIcon({ trade }: { trade: string }) {
  const electricianProps = {
    width: 40,
    height: 40,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className: 'h-10 w-10',
  };

  const tradeProps = {
    width: 40,
    height: 40,
    viewBox: '0 0 40 40',
    fill: 'none',
    stroke: '#0A1628',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-10 w-10',
  };

  switch (trade) {
    case 'Electrician':
      return (
        <svg {...electricianProps}>
          <path d="m13 2-7 10h4l-1 10 8-12h-4l2-8Z" />
        </svg>
      );
    case 'Plumber':
      return (
        <svg {...tradeProps}>
          <path d="M10 14V11a3 3 0 0 1 3-3h8" />
          <path d="M21 8v5" />
          <path d="M18 11h6" />
          <path d="M24 11v3a4 4 0 0 1-4 4h-6" />
          <path d="M14 18v5a4 4 0 0 0 8 0v-5" />
        </svg>
      );
    case 'Gas Engineer':
      return (
        <svg {...tradeProps}>
          <path d="M20 7c-4 4-7 7-7 12a7 7 0 0 0 14 0c0-4-2-7-7-12Z" />
          <path d="M20 12c-2 2-3.5 4-3.5 6.5A3.5 3.5 0 0 0 20 22a3.5 3.5 0 0 0 3.5-3.5c0-2-1-3.5-3.5-6.5Z" />
        </svg>
      );
    case 'Builder':
      return (
        <svg {...tradeProps}>
          <path d="M12 20a8 8 0 0 1 16 0" />
          <path d="M10 20h20" />
          <path d="M14 20v-5a6 6 0 0 1 12 0v5" />
          <path d="M10 20v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4" />
        </svg>
      );
    case 'Joiner':
      return (
        <svg {...tradeProps}>
          <path d="M9 15h18v8H9z" />
          <path d="M27 15v8" />
          <path d="M11 23l1 2 1-2 1 2 1-2 1 2 1-2 1 2 1-2 1 2 1-2" />
          <path d="M14 15V11" />
        </svg>
      );
    case 'Plasterer':
      return (
        <svg {...tradeProps}>
          <path d="M17 9l9 9-7 7-9-9 7-7Z" />
          <path d="M12 18l10 10" />
          <path d="M23 13l4-4" />
          <path d="M12 18l-4 4" />
        </svg>
      );
    case 'Painter & Decorator':
      return (
        <svg {...tradeProps}>
          <path d="M12 14h9a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-9" />
          <path d="M21 14v8" />
          <path d="M12 17h-2a5 5 0 0 0 0 10h3" />
          <path d="M10 27l-2 5" />
        </svg>
      );
    case 'General Maintenance':
      return (
        <svg {...tradeProps}>
          <path d="M27 13a7 7 0 0 0-9 9l-9 9 3 3 9-9a7 7 0 0 0 9-9l-4 4-3-1-1-3 5-3Z" />
          <path d="M19 21l6 6" />
        </svg>
      );
    default:
      return (
        <svg {...tradeProps}>
          <path d="M27 13a7 7 0 0 0-9 9l-9 9 3 3 9-9a7 7 0 0 0 9-9l-4 4-3-1-1-3 5-3Z" />
          <path d="M19 21l6 6" />
        </svg>
      );
  }
}

function slugifyTrade(trade: string) {
  return trade
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function FindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-text">Find a Tradesperson</h1>
          <p className="mt-2 text-sm text-text-secondary">Choose a trade to view local professionals near you.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-6">
          <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-3 sm:p-4">
            <label htmlFor="trade-search" className="mb-2 block text-sm font-semibold text-text">Postcode or town</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="trade-search"
                type="search"
                placeholder="Enter postcode or town"
                className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-text outline-none ring-0"
              />
              <button className="rounded-xl bg-[#0A1628] px-4 py-3 text-sm font-semibold text-white">Search</button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {TRADES.map((trade) => {
              const firstWord = trade === 'Painter & Decorator' ? 'Painter' : trade.split(' ')[0];

              return (
                <Link
                  key={trade}
                  href={`/find/${slugifyTrade(trade)}`}
                  className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-[#e5e7eb] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8fafc] text-[#0A1628] transition group-hover:bg-[#0A1628] group-hover:text-white sm:h-14 sm:w-14">
                    <TradeIcon trade={trade} />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-text transition group-hover:text-[#0A1628]">{trade}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-text">Results</h2>
          <p className="mt-2 text-sm text-text-secondary">Choose a trade above to browse nearby professionals.</p>
        </div>
      </div>
    </div>
  );
}
