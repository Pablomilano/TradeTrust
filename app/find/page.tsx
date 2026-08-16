import Link from 'next/link';
import { TRADES, slugifyTrade } from '../../lib/trades';

const TRADE_HINTS: Record<string, string> = {
  'Electrician': 'Rewires · EICR · Sockets',
  'Plumber': 'Leaks · Bathrooms · Taps',
  'Gas Engineer': 'Boilers · Gas Safe',
  'Builder': 'Extensions · Groundwork',
  'Joiner': 'Doors · Fitted units',
  'Plasterer': 'Skimming · Rendering',
  'Painter & Decorator': 'Interior · Exterior',
  'General Maintenance': 'Odd jobs · Repairs',
  'Tiler': 'Walls · Floors · Grouting',
  'Landscaper': 'Gardens · Fencing · Patios',
  'Roofer': 'Repairs · Guttering',
  'Carpet Fitter': 'Carpet · Vinyl · LVT',
  'Handyman': 'Small jobs · Flatpack',
};

function TradeIcon({ trade }: { trade: string }) {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-5 w-5',
  };

  switch (trade) {
    case 'Electrician':
      return <svg {...common}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
    case 'Plumber':
      return <svg {...common}><path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3Z" /></svg>;
    case 'Gas Engineer':
      return <svg {...common}><path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 .5-2-1-4 1-7Z" /></svg>;
    case 'Builder':
      return <svg {...common}><path d="M3 3h18v18H3z" /><path d="M3 9h18M3 15h18M9 3v6M15 9v6M9 15v6" /></svg>;
    case 'Joiner':
      return <svg {...common}><path d="M3 17h13l5-5-5-5H3z" /><path d="M7 12h.01M11 12h.01M15 12h.01" /></svg>;
    case 'Plasterer':
      return <svg {...common}><path d="m5 19 5-5" /><path d="M9 13 20 2l2 2-11 11-4 1z" /></svg>;
    case 'Painter & Decorator':
      return <svg {...common}><path d="M4 4h11v5H4z" /><path d="M15 6.5h3a2 2 0 0 1 2 2V12" /><path d="M18 12h2v9h-2z" /></svg>;
    case 'General Maintenance':
      return <svg {...common}><path d="M15 4a5 5 0 0 0-4.5 7L4 17.5 6.5 20l6.5-6.5A5 5 0 1 0 15 4Z" /></svg>;
    case 'Tiler':
      return <svg {...common}><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>;
    case 'Landscaper':
      return <svg {...common}><path d="M12 3 6 12h4l-4 6h12l-4-6h4Z" /><path d="M12 18v3" /></svg>;
    case 'Roofer':
      return <svg {...common}><path d="m2 11 10-7 10 7" /><path d="M5 10v10h14V10" /></svg>;
    case 'Carpet Fitter':
      return <svg {...common}><path d="M3 6h18v12H3z" /><path d="M3 10h18M3 14h18" /></svg>;
    case 'Handyman':
      return <svg {...common}><path d="m4 20 7-7" /><path d="M13 11 20 4" /><path d="m4 4 5 5" /><path d="m16 14 4 4" /></svg>;
    default:
      return <svg {...common}><path d="M15 4a5 5 0 0 0-4.5 7L4 17.5 6.5 20l6.5-6.5A5 5 0 1 0 15 4Z" /></svg>;
  }
}

export default function FindPage() {
  return (
    <div className="min-h-screen bg-[#14171B]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <span className="inline-block rounded-full border border-[#E8631C] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8631C]">
          Verified · Real reviews · No commission
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          Find a tradesperson
          <br />
          you can <span className="text-[#E8631C]">actually trust</span>.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#A8A49C] sm:text-base">
          Tell us where you are and what you need. Every trade on TradeTrust is verified, and the
          reviews come from real jobs.
        </p>

        <div className="mt-9 rounded-2xl bg-[#F2E9D8] p-5 sm:p-6">
          <label
            htmlFor="trade-search"
            className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8A7F6A]"
          >
            Where are you?
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="trade-search"
              type="search"
              placeholder="Postcode or town — e.g. Widnes, WA8"
              className="w-full rounded-xl border-[1.5px] border-[#D9CCB4] bg-white px-4 py-3.5 text-sm text-[#14171B] outline-none focus:border-[#E8631C]"
            />
            <button className="rounded-xl bg-[#14171B] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E8631C]">
              Search
            </button>
          </div>
        </div>

        <div className="mt-12 flex items-baseline justify-between gap-4 sm:mt-14">
          <h2 className="text-sm font-semibold text-white">Or pick a trade</h2>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E6A63]">
            {TRADES.length} trades
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRADES.map((trade) => (
            <Link
              key={trade}
              href={`/find/${slugifyTrade(trade)}`}
              className="group flex items-center gap-3.5 rounded-xl border border-[#2F2F2F] bg-[#1E1E1E] px-4 py-4 transition hover:-translate-y-0.5 hover:border-[#E8631C] hover:bg-[#262626]"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-[#2B2B2B] text-white transition group-hover:bg-[#E8631C]">
                <TradeIcon trade={trade} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-white">{trade}</span>
                {TRADE_HINTS[trade] && (
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.1em] text-[#7D7871]">
                    {TRADE_HINTS[trade]}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
