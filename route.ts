// Single source of truth for trade categories used across the app:
// homepage dropdown, /find grid, /find/[trade] results, and the dashboard signup form.
// To add a new trade, add one entry here — nowhere else.
// NOTE: the `trade` column in Supabase also has a check constraint;
// see db/migrations/add_new_trades.sql for the matching DB change.

export const TRADES = [
  'Electrician',
  'Plumber',
  'Gas Engineer',
  'Builder',
  'Joiner',
  'Plasterer',
  'Painter & Decorator',
  'General Maintenance',
  'Tiler',
  'Landscaper',
  'Roofer',
  'Carpet Fitter',
  'Handyman',
] as const;

export type TradeType = (typeof TRADES)[number];

export const TRADE_LABELS: Record<string, string> = TRADES.reduce(
  (acc, trade) => {
    acc[slugifyTrade(trade)] = trade;
    return acc;
  },
  {} as Record<string, string>
);

export function slugifyTrade(trade: string) {
  return trade
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
