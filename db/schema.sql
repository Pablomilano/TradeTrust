-- TradeTrust database schema proposal

create extension if not exists "uuid-ossp";

create table tradespeople (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  business_name text not null,
  trade text not null,
  coverage_area text not null,
  photo_url text,
  accreditations text[] not null default ARRAY[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  tradesperson_id uuid references auth.users(id) not null,
  name text not null,
  phone text not null,
  email text,
  address text not null,
  created_at timestamptz not null default now()
);

alter table clients enable row level security;
create policy "Clients can read their own clients" on clients for select using (auth.uid() = tradesperson_id);
create policy "Clients can insert their own clients" on clients for insert with check (auth.uid() = tradesperson_id);
create policy "Clients can update their own clients" on clients for update using (auth.uid() = tradesperson_id) with check (auth.uid() = tradesperson_id);
create policy "Clients can delete their own clients" on clients for delete using (auth.uid() = tradesperson_id);

create type job_status as enum ('pending', 'active', 'done');

create table jobs (
  id uuid primary key default uuid_generate_v4(),
  tradesperson_id uuid references auth.users(id) not null,
  client_id uuid references clients(id) on delete cascade not null,
  title text not null,
  description text not null,
  status job_status not null default 'pending',
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table jobs enable row level security;
create policy "Jobs can read own jobs" on jobs for select using (auth.uid() = tradesperson_id);
create policy "Jobs can insert own jobs" on jobs for insert with check (auth.uid() = tradesperson_id);
create policy "Jobs can update own jobs" on jobs for update using (auth.uid() = tradesperson_id) with check (auth.uid() = tradesperson_id);
create policy "Jobs can delete own jobs" on jobs for delete using (auth.uid() = tradesperson_id);

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null unique,
  first_name text,
  last_name text,
  business_name text,
  trade text not null check (trade in ('Electrician','Plumber','Gas Engineer','Builder','Joiner','Plasterer','Painter & Decorator','General Maintenance')),
  coverage_area text,
  coverage_radius smallint check (coverage_radius in (5, 10, 15, 20, 25)),
  bio text,
  accreditations text[] not null default ARRAY[]::text[],
  phone text,
  photo_url text,
  visibility boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Public can read visible profiles" on profiles for select using (visibility = true or auth.uid() = user_id);
create policy "Tradesperson can insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "Tradesperson can update own profile" on profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Tradesperson can delete own profile" on profiles for delete using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table enquiries (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  homeowner_name text not null,
  phone text not null,
  email text,
  description text not null,
  preferred_contact_time text not null check (preferred_contact_time in ('Morning','Afternoon','Evening','Anytime')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_read boolean not null default false
);

alter table enquiries enable row level security;
create policy "Public can submit enquiries" on enquiries for insert with check (true);
create policy "Tradesperson can read own enquiries" on enquiries for select using (
  auth.uid() = (select user_id from profiles where profiles.id = enquiries.profile_id)
);
create policy "Tradesperson can update own enquiries" on enquiries for update using (
  auth.uid() = (select user_id from profiles where profiles.id = enquiries.profile_id)
) with check (
  auth.uid() = (select user_id from profiles where profiles.id = enquiries.profile_id)
);
create policy "Tradesperson can delete own enquiries" on enquiries for delete using (
  auth.uid() = (select user_id from profiles where profiles.id = enquiries.profile_id)
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) not null,
  job_id uuid references jobs(id),
  reviewer_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;
create policy "Public can read reviews" on reviews for select using (true);
create policy "Public can insert reviews" on reviews for insert with check (true);
create policy "No review updates" on reviews for update using (false) with check (false);
create policy "No review deletes" on reviews for delete using (false);

create type subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');

create type subscription_plan as enum ('basic', 'pro');

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  tradesperson_id uuid references auth.users(id) not null,
  plan subscription_plan not null,
  stripe_subscription_id text not null,
  status subscription_status not null,
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = true;

create policy "Avatar images are publicly accessible" on storage.objects
for select using (bucket_id = 'avatars');

create policy "Users can upload avatar images" on storage.objects
for insert with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update avatar images" on storage.objects
for update using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
) with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete avatar images" on storage.objects
for delete using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
