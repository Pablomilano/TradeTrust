export type Trade = 'electrician' | 'plumber' | 'builder' | 'multi-trade';

export type SubscriptionPlan = 'basic' | 'pro';

export interface Tradesperson {
  id: string;
  user_id: string;
  business_name: string;
  trade: Trade;
  coverage_area: string;
  photo_url?: string | null;
  accreditations: string[];
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tradesperson_id: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  created_at: string;
}

export type JobStatus = 'pending' | 'active' | 'done';

export interface Job {
  id: string;
  tradesperson_id: string;
  client_id: string;
  title: string;
  description: string;
  status: JobStatus;
  last_contacted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  tradesperson_id: string;
  plan: SubscriptionPlan;
  stripe_subscription_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_end: string;
  created_at: string;
}
