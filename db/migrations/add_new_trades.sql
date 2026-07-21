-- Adds Tiler, Landscaper, Roofer, Carpet Fitter, Handyman to the allowed trades.
-- Run this against your live Supabase DB (SQL editor) — it does not touch existing data.

-- Postgres auto-names unnamed check constraints as "<table>_<column>_check".
-- If this DROP fails because the name differs, run the query below first to find it:
--   select conname from pg_constraint where conrelid = 'profiles'::regclass and contype = 'c';

alter table profiles drop constraint if exists profiles_trade_check;

alter table profiles add constraint profiles_trade_check
  check (trade in (
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
    'Handyman'
  ));
