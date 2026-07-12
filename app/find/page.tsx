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
  const commonProps = {
    width: 40,
    height: 40,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className: 'h-10 w-10',
  };

  switch (trade) {
    case 'Electrician':
      return (
        <svg {...commonProps}>
          <path d="m13 2-7 10h4l-1 10 8-12h-4l2-8Z" />
        </svg>
      );
    case 'Plumber':
      return (
        <svg {...commonProps}>
          <path d="M8 3h8v4a4 4 0 0 1-8 0V3Z" />
          <path d="M8 11v7a4 4 0 0 0 8 0v-7" />
        </svg>
      );
    case 'Gas Engineer':
      return (
        <svg {...commonProps}>
          <path d="M8 3h8" />
          <path d="M9 3v5.5A2.5 2.5 0 0 0 11.5 11h1A2.5 2.5 0 0 0 15 8.5V3" />
          <path d="M8 10h8v8a4 4 0 0 1-8 0v-8Z" />
        </svg>
      );
    case 'Builder':
      return (
        <svg {...commonProps}>
          <path d="M5 6h14v12H5z" />
          <path d="M9 6v12" />
          <path d="M15 6v12" />
          <path d="M5 11h14" />
        </svg>
      );
    case 'Joiner':
      return (
        <svg {...commonProps}>
          <path d="M5 18h14" />
          <path d="m7 18 7-12 3 4-7 8" />
          <path d="M10 8h4" />
        </svg>
      );
    case 'Plasterer':
      return (
        <svg {...commonProps}>
          <path d="M5 19h14" />
          <path d="M7 19V8.5A2.5 2.5 0 0 1 12 6a2.5 2.5 0 0 1 0 5V12" />
          <path d="M12 12h5v7" />
        </svg>
      );
    case 'Painter & Decorator':
      return (
        <svg {...commonProps}>
          <path d="M6 4h10" />
          <path d="M8 4v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4" />
          <path d="M8 10h8v5a4 4 0 0 1-8 0v-5Z" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M12 3v18" />
          <path d="M3 12h18" />
          <circle cx="12" cy="12" r="8" />
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
