import Link from 'next/link';
import {
  BoltIcon,
  FireIcon,
  HomeModernIcon,
  CubeIcon,
  PaintBrushIcon,
  SwatchIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';

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
  switch (trade) {
    case 'Electrician':
      return <BoltIcon className="h-10 w-10 text-[#0A1628]" />;
    case 'Plumber':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#0A1628]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-6 6.5-6 10a6 6 0 0 0 12 0c0-3.5-6-10-6-10z" />
        </svg>
      );
    case 'Gas Engineer':
      return <FireIcon className="h-10 w-10 text-[#0A1628]" />;
    case 'Builder':
      return <HomeModernIcon className="h-10 w-10 text-[#0A1628]" />;
    case 'Joiner':
      return <CubeIcon className="h-10 w-10 text-[#0A1628]" />;
    case 'Plasterer':
      return <PaintBrushIcon className="h-10 w-10 text-[#0A1628]" />;
    case 'Painter & Decorator':
      return <SwatchIcon className="h-10 w-10 text-[#0A1628]" />;
    case 'General Maintenance':
      return <WrenchIcon className="h-10 w-10 text-[#0A1628]" />;
    default:
      return <WrenchIcon className="h-10 w-10 text-[#0A1628]" />;
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
