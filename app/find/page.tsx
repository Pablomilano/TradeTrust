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

const PHOTO_URLS: Record<string, string> = {
  Electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80',
  Plumber: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80',
  'Gas Engineer': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  Builder: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
  Joiner: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200&q=80',
  Plasterer: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
  'Painter & Decorator': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80',
  'General Maintenance': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80',
};

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
        <div className="space-y-6">
          {TRADES.map((trade) => {
            const imageUrl = PHOTO_URLS[trade] || '';
            const firstWord = trade === 'Painter & Decorator' ? 'Painter' : trade.split(' ')[0];

            return (
              <div key={trade} className="relative w-full h-56 overflow-hidden rounded-2xl shadow-sm">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />

                <div className="relative z-10 h-full flex items-end px-6 pb-6">
                  <div className="flex-1">
                    <div className="text-white font-bold text-2xl md:text-3xl drop-shadow-md">{trade}</div>
                  </div>
                  <div>
                    <Link href={`/find/${slugifyTrade(trade)}`} className="bg-white text-[#0A1628] rounded-full px-5 py-2 font-semibold inline-flex">
                      {`Find ${firstWord} →`}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
