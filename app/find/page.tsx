import Link from 'next/link';
import {
  BoltIcon,
  FireIcon,
  HomeModernIcon,
  CubeIcon,
  PaintBrushIcon,
  WrenchIcon,
  Squares2X2Icon,
  SunIcon,
  HomeIcon,
  RectangleGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { TRADES, slugifyTrade } from '../../lib/trades';

function TradeIcon({ trade }: { trade: string }) {
  switch (trade) {
    case 'Electrician':
      return <BoltIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Plumber':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#14171B]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-6 6.5-6 10a6 6 0 0 0 12 0c0-3.5-6-10-6-10z" />
        </svg>
      );
    case 'Gas Engineer':
      return <FireIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Builder':
      return <HomeModernIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Joiner':
      return <CubeIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Plasterer':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#14171B]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-4 10-10 3 3L10 16 6 20l-3-3zm4-4l3 3" />
        </svg>
      );
    case 'Painter & Decorator':
      return <PaintBrushIcon className="h-10 w-10 text-[#14171B]" />;
    case 'General Maintenance':
      return <WrenchIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Tiler':
      return <Squares2X2Icon className="h-10 w-10 text-[#14171B]" />;
    case 'Landscaper':
      return <SunIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Roofer':
      return <HomeIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Carpet Fitter':
      return <RectangleGroupIcon className="h-10 w-10 text-[#14171B]" />;
    case 'Handyman':
      return <WrenchScrewdriverIcon className="h-10 w-10 text-[#14171B]" />;
    default:
      return <WrenchIcon className="h-10 w-10 text-[#14171B]" />;
  }
}

export default function FindPage() {
  return (
    <div className="min-h-screen bg-[#14171B]">
      <div className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-text">Find a Tradesperson</h1>
          <p className="mt-2 text-sm text-muted">Choose a trade to view local professionals near you.</p>
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
              <button className="rounded-xl bg-[#14171B] px-4 py-3 text-sm font-semibold text-white">Search</button>
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8fafc] text-[#14171B] transition group-hover:bg-[#14171B] group-hover:text-white sm:h-14 sm:w-14">
                    <TradeIcon trade={trade} />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-text transition group-hover:text-[#14171B]">{trade}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-text">Results</h2>
          <p className="mt-2 text-sm text-muted">Choose a trade above to browse nearby professionals.</p>
        </div>
      </div>
    </div>
  );
}
