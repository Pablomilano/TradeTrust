'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { supabase } from '../../lib/supabaseClient';

interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  created_at: string;
}

type JobStatus = 'pending' | 'active' | 'done';

type TradeType = 'Electrician' | 'Plumber' | 'Gas Engineer' | 'Builder' | 'Joiner' | 'Plasterer' | 'Painter & Decorator' | 'General Maintenance';

interface JobRecord {
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

interface ProfileRecord {
  id: string;
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  trade: TradeType;
  coverage_area?: string | null;
  coverage_radius?: number | null;
  bio?: string | null;
  accreditations: string[];
  phone?: string | null;
  visibility: boolean;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface EnquiryRecord {
  id: string;
  is_read: boolean;
  created_at: string;
}

type ProfileForm = Omit<ProfileRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  first_name: string;
  last_name: string;
  business_name: string;
  coverage_area: string;
  bio: string;
  phone: string;
  coverage_radius: number;
};

function NavIcon({ type }: { type: 'clients' | 'new-job' | 'jobs' | 'profile' | 'add-client' }) {
  const common = 'h-4 w-4';

  switch (type) {
    case 'clients':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M17 8v4" />
          <path d="M19 10h-4" />
        </svg>
      );
    case 'new-job':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'jobs':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M8 11h8" />
          <path d="M8 15h5" />
        </svg>
      );
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        </svg>
      );
    case 'add-client':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M17 8v4" />
          <path d="M19 10h-4" />
          <path d="M17 10h4" />
        </svg>
      );
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });
  const [newJob, setNewJob] = useState({ title: '', description: '', client_id: '', status: 'pending' as JobStatus });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    business_name: '',
    trade: 'Electrician',
    coverage_area: '',
    coverage_radius: 10,
    bio: '',
    accreditations: [],
    phone: '',
    visibility: false,
    photo_url: null,
  });

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (session) {
      fetchClients();
      fetchJobs();
      fetchProfile();
      fetchEnquiries();
    }
  }, [session]);

  const fetchClients = async () => {
    setClientLoading(true);
    setClientError(null);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setClientError(error.message);
      setClients([]);
    } else {
      setClients(data || []);
      if (data && data.length > 0 && !newJob.client_id) {
        setNewJob((prev) => ({ ...prev, client_id: data[0].id }));
      }
    }

    setClientLoading(false);
  };

  const fetchJobs = async () => {
    setJobLoading(true);
    setJobError(null);

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setJobError(error.message);
      setJobs([]);
    } else {
      setJobs(data || []);
    }

    setJobLoading(false);
  };

  const fetchProfile = async () => {
    if (!session) return;

    setProfileLoading(true);
    setProfileError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      setProfileError(error.message);
      setProfile(null);
    } else if (data) {
      setProfile(data);
      setPhotoUrl(data.photo_url || null);
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        business_name: data.business_name || '',
        trade: data.trade,
        coverage_area: data.coverage_area || '',
        coverage_radius: data.coverage_radius || 10,
        bio: data.bio || '',
        accreditations: data.accreditations || [],
        phone: data.phone || '',
        visibility: data.visibility,
        photo_url: data.photo_url || null,
      });
    }

    setProfileLoading(false);
  };

  const fetchEnquiries = async () => {
    if (!session) return;

    setEnquiryLoading(true);

    const { data, error } = await supabase
      .from('enquiries')
      .select('id, is_read, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setEnquiries([]);
    } else {
      setEnquiries(data || []);
    }

    setEnquiryLoading(false);
  };

  const completionFields = ['first_name', 'last_name', 'trade', 'coverage_area', 'coverage_radius', 'bio', 'phone', 'visibility'];
  const profileCompletion = () => {
    const filled = completionFields.reduce((count, field) => {
      const value = (profileForm as any)[field];
      if (field === 'visibility') {
        return value ? count + 1 : count;
      }
      return value ? count + 1 : count;
    }, 0);
    return Math.round((filled / completionFields.length) * 100);
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;

    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);

    const values = {
      first_name: profileForm.first_name || null,
      last_name: profileForm.last_name || null,
      business_name: profileForm.business_name || null,
      trade: profileForm.trade,
      coverage_area: profileForm.coverage_area || null,
      coverage_radius: profileForm.coverage_radius || null,
      bio: profileForm.bio || null,
      accreditations: profileForm.accreditations,
      phone: profileForm.phone || null,
      visibility: profileForm.visibility,
      photo_url: photoUrl || null,
    };

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    let result;
    
    if (existingProfile) {
      // Profile exists, update it
      result = await supabase
        .from('profiles')
        .update(values)
        .eq('user_id', session.user.id)
        .select('*')
        .single();
    } else {
      // Profile doesn't exist, insert it
      result = await supabase
        .from('profiles')
        .insert([{ ...values, user_id: session.user.id }])
        .select('*')
        .single();
    }

    const { data, error } = result;

    if (error) {
      setProfileError(error.message);
      setProfileMessage(null);
    } else if (data) {
      setProfile(data);
      setPhotoUrl(data.photo_url || null);
      setProfileMessage('Profile saved successfully.');
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        business_name: data.business_name || '',
        trade: data.trade,
        coverage_area: data.coverage_area || '',
        coverage_radius: data.coverage_radius || 10,
        bio: data.bio || '',
        accreditations: data.accreditations || [],
        phone: data.phone || '',
        visibility: data.visibility,
        photo_url: data.photo_url || null,
      });
    }

    setProfileSaving(false);
  };

  const tradeOptions: TradeType[] = ['Electrician', 'Plumber', 'Gas Engineer', 'Builder', 'Joiner', 'Plasterer', 'Painter & Decorator', 'General Maintenance'];

  const getProfileInitials = () => {
    const businessName = profileForm.business_name?.trim();
    if (businessName) {
      return businessName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'T';
    }

    const name = `${profileForm.first_name || ''} ${profileForm.last_name || ''}`.trim();
    if (name) {
      return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'T';
    }

    return 'T';
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session) return;

    setUploadingPhoto(true);
    setProfileError(null);
    setProfileMessage(null);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

    if (uploadError) {
      setProfileError(uploadError.message);
      setUploadingPhoto(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const nextPhotoUrl = publicUrlData?.publicUrl || null;

    const { error: updateError } = await supabase.from('profiles').update({ photo_url: nextPhotoUrl }).eq('user_id', session.user.id);

    if (updateError) {
      setProfileError(updateError.message);
      setUploadingPhoto(false);
      return;
    }

    setPhotoUrl(nextPhotoUrl);
    setProfileMessage('Profile photo updated.');
    setUploadingPhoto(false);
    event.target.value = '';
  };

  const handleClientSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;

    setClientLoading(true);
    setClientError(null);

    const { error } = await supabase.from('clients').insert([{
      tradesperson_id: session.user.id,
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email || null,
      address: newClient.address,
    }]);

    if (error) {
      setClientError(error.message);
      setClientLoading(false);
      return;
    }

    setNewClient({ name: '', phone: '', email: '', address: '' });
    setShowAddClient(false);
    await fetchClients();
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!session) return;

    const confirmed = window.confirm('Delete this client and all jobs linked to them?');
    if (!confirmed) return;

    setDeletingClientId(clientId);
    setClientError(null);
    setJobError(null);

    const { error: jobsError } = await supabase.from('jobs').delete().eq('client_id', clientId);
    if (jobsError) {
      setClientError(jobsError.message);
      setDeletingClientId(null);
      return;
    }

    const { error: clientError } = await supabase.from('clients').delete().eq('id', clientId);
    if (clientError) {
      setClientError(clientError.message);
      setDeletingClientId(null);
      return;
    }

    setClients((prev) => prev.filter((client) => client.id !== clientId));
    setJobs((prev) => prev.filter((job) => job.client_id !== clientId));
    setNewJob((prev) => {
      const remainingClients = clients.filter((client) => client.id !== clientId);
      if (!prev.client_id || prev.client_id !== clientId) {
        return prev;
      }

      return {
        ...prev,
        client_id: remainingClients[0]?.id || '',
      };
    });

    setDeletingClientId(null);
    await Promise.all([fetchClients(), fetchJobs()]);
  };

  const handleJobSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    if (!newJob.client_id) {
      setJobError('Please select a client for the job.');
      return;
    }

    setJobLoading(true);
    setJobError(null);

    const { error } = await supabase.from('jobs').insert([{
      tradesperson_id: session.user.id,
      client_id: newJob.client_id,
      title: newJob.title,
      description: newJob.description,
      status: newJob.status,
      last_contacted_at: null,
    }]);

    if (error) {
      setJobError(error.message);
      setJobLoading(false);
      return;
    }

    setNewJob({ title: '', description: '', client_id: clients[0]?.id || '', status: 'pending' });
    await fetchJobs();
    setJobLoading(false);
  };

  const formatContactDate = (value?: string | null) => {
    if (!value) return 'No contact yet';
    return new Date(value).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isGoingCold = (job: JobRecord) => {
    if (!job.last_contacted_at) return true;
    return Date.now() - new Date(job.last_contacted_at).getTime() > 5 * 24 * 60 * 60 * 1000;
  };

  const jobsByStatus = {
    pending: jobs.filter((job) => job.status === 'pending'),
    active: jobs.filter((job) => job.status === 'active'),
    done: jobs.filter((job) => job.status === 'done'),
  };

  const greetingName = session?.user?.user_metadata?.first_name || session?.user?.email || 'there';
  const showFirstNameNote = !session?.user?.user_metadata?.first_name;
  const unreadEnquiriesCount = enquiries.filter((enquiry) => !enquiry.is_read).length;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-white/95 px-4 py-5 backdrop-blur-md shadow-sm">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">TradeTrust</p>
            <h1 className="mt-1 text-2xl font-semibold text-text">Job board</h1>
          </div>
          <button className="rounded-full border border-border px-4 py-2 text-sm text-text" onClick={() => supabase.auth.signOut().then(() => router.push('/'))}>Sign out</button>
        </div>
      </header>

      <section className="container space-y-6 px-0 py-8">
        <div className="rounded-[28px] border border-border bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted">Good morning, {greetingName}</p>
              <h2 className="mt-1 text-2xl font-semibold text-text">Ready to manage your next jobs?</h2>
              {showFirstNameNote && <p className="mt-2 text-xs text-muted">We’ll add your first name to your profile later.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button className="rounded-full bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95" onClick={() => document.getElementById('new-job')?.scrollIntoView({ behavior: 'smooth' })}>Add job</button>
              <button className="rounded-full border border-border bg-white px-4 py-3 text-sm font-semibold text-text hover:bg-[#f8f8fa]" onClick={() => setShowAddClient(true)}>New client</button>
              <div className="rounded-full border border-border bg-[#f8f8fa] px-4 py-3 text-sm font-semibold text-muted">{clients.length} clients</div>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted">Signed in as {session.user.email}</p>

          {unreadEnquiriesCount > 0 && (
            <button
              type="button"
              onClick={() => router.push('/dashboard/enquiries')}
              className="mt-5 flex items-center justify-between rounded-3xl border border-brand-200 bg-brand-50 px-4 py-3 text-left text-sm text-brand-700"
            >
              <span>📩 {unreadEnquiriesCount} new enquiry{unreadEnquiriesCount > 1 ? 'ies' : 'y'}</span>
              <span className="font-semibold">Open inbox →</span>
            </button>
          )}
        </div>

        <div id="clients" className="scroll-mt-24 rounded-[28px] border border-border bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-text">Client directory</h2>
              <p className="text-sm text-muted">Search your client list and keep details handy.</p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">{clients.length} total</span>
          </div>

          {showAddClient && (
            <form onSubmit={handleClientSubmit} className="mt-6 rounded-[24px] border border-border bg-[#fcfcfc] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-text">Add a client</p>
                  <p className="text-sm text-muted">Create a client so you can assign jobs faster.</p>
                </div>
                <button type="button" className="text-sm font-semibold text-muted" onClick={() => setShowAddClient(false)}>Cancel</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Name</span>
                  <input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="rounded-3xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required />
                </label>
                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Phone</span>
                  <input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="rounded-3xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required />
                </label>
                <label className="flex flex-col gap-2 text-sm text-text">
                  <span>Email</span>
                  <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="rounded-3xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </label>
                <label className="flex flex-col gap-2 text-sm text-text sm:col-span-2">
                  <span>Address</span>
                  <input value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} className="rounded-3xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required />
                </label>
              </div>
              {clientError && <p className="mt-3 text-sm text-red-600">{clientError}</p>}
              <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95" disabled={clientLoading}>
                {clientLoading ? 'Saving...' : 'Save client'}
              </button>
            </form>
          )}

          {clientLoading ? (
            <p className="mt-6 text-sm text-muted">Loading clients…</p>
          ) : clients.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-[#fafafa] p-6 text-center text-sm text-muted">
              No clients yet. Add one to assign jobs faster.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {clients.map((client) => (
                <div key={client.id} className="rounded-[24px] border border-border bg-[#fcfcfc] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-text">{client.name}</p>
                      <p className="mt-2 text-sm text-muted">{client.phone}</p>
                      <p className="text-sm text-muted">{client.email || 'No email provided'}</p>
                      <p className="text-sm text-muted">{client.address}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id)}
                      disabled={deletingClientId === client.id}
                      className="rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingClientId === client.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="my-profile" className="scroll-mt-24 rounded-[28px] border border-border bg-white p-6 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text">My Profile</h2>
              <p className="text-sm text-muted">Set up your public tradesperson profile for homeowners.</p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">Profile {profile ? 'ready' : 'setup'}</span>
          </div>

          <div className="mt-5 rounded-3xl bg-[#f8f8fa] p-4 text-sm text-text">
            <p className="font-semibold">Completion: {profileCompletion()}%</p>
            <p className="text-muted">Fill in your profile so homeowners can find you. Public visibility is off until you're ready.</p>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-dashed border-border bg-[#fafafa] p-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-white shadow-sm"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0A1628] text-xl font-semibold text-white">
                  {getProfileInitials()}
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 transition group-hover:opacity-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                  <path d="M12 5v10" />
                  <path d="M7 12h10" />
                  <path d="M5 20h14" />
                </svg>
              </span>
            </button>
            <div className="flex-1">
              <p className="font-semibold text-text">Profile photo</p>
              <p className="mt-1 text-sm text-muted">Tap the circle to upload a square image for your public profile.</p>
              <p className="mt-2 text-sm text-muted">{uploadingPhoto ? 'Uploading photo…' : 'PNG or JPG works well.'}</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-text">
                <span>First name</span>
                <input value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </label>
              <label className="flex flex-col gap-2 text-sm text-text">
                <span>Last name</span>
                <input value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-text">
              <span>Business name</span>
              <input value={profileForm.business_name} onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-text">
                <span>Trade type</span>
                <select value={profileForm.trade} onChange={(e) => setProfileForm({ ...profileForm, trade: e.target.value as TradeType })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {tradeOptions.map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-text">
                <span>Coverage radius (miles)</span>
                <select value={profileForm.coverage_radius} onChange={(e) => setProfileForm({ ...profileForm, coverage_radius: Number(e.target.value) })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {[5, 10, 15, 20, 25].map((radius) => (
                    <option key={radius} value={radius}>{radius}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-text">
              <span>Coverage area</span>
              <input value={profileForm.coverage_area} onChange={(e) => setProfileForm({ ...profileForm, coverage_area: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Widnes, Warrington, Runcorn" />
            </label>

            <label className="flex flex-col gap-2 text-sm text-text">
              <span>About / bio</span>
              <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} maxLength={300} className="min-h-[120px] rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="NICEIC registered electrician with 15 years experience..." />
            </label>

            <div className="grid gap-3">
              <span className="text-sm font-semibold text-text">Accreditations</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {['NICEIC', 'Gas Safe', 'NAPIT', 'FENSA', 'Which? Trusted Trader', 'None'].map((label) => (
                  <label key={label} className="inline-flex items-center gap-2 rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm text-text">
                    <input type="checkbox" checked={profileForm.accreditations.includes(label)} onChange={(e) => {
                      const next = e.target.checked
                        ? [...profileForm.accreditations, label]
                        : profileForm.accreditations.filter((item) => item !== label);
                      setProfileForm({ ...profileForm, accreditations: next });
                    }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm text-text">
              <span>Phone number</span>
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </label>

            <label className="inline-flex items-center gap-3 text-sm text-text">
              <input type="checkbox" checked={profileForm.visibility} onChange={(e) => setProfileForm({ ...profileForm, visibility: e.target.checked })} />
              Make profile public and searchable
            </label>

            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95" disabled={profileSaving}>
              {profileSaving ? 'Saving profile...' : 'Save profile'}
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-border bg-white p-6 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text">Add a new job</h2>
              <p className="text-sm text-muted">Capture the job details and connect them to a client.</p>
            </div>
          </div>

          <form id="new-job" onSubmit={handleJobSubmit} className="mt-6 grid gap-4">
            <label className="flex flex-col gap-2 text-sm text-text">
              <span>Job title</span>
              <input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </label>

            <label className="flex flex-col gap-2 text-sm text-text">
              <span>Description</span>
              <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} className="min-h-[120px] rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-text">
                <span>Client</span>
                <select value={newJob.client_id} onChange={(e) => setNewJob({ ...newJob, client_id: e.target.value })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required>
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-text">
                <span>Status</span>
                <select value={newJob.status} onChange={(e) => setNewJob({ ...newJob, status: e.target.value as JobStatus })} className="rounded-3xl border border-border bg-[#fbfbfb] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="done">Done</option>
                </select>
              </label>
            </div>

            {jobError && <p className="text-sm text-red-600">{jobError}</p>}
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95" disabled={jobLoading || clients.length === 0}>
              {jobLoading ? 'Saving...' : 'Create job'}
            </button>
            {clients.length === 0 && <p className="text-sm text-muted">Add a client first before creating a job.</p>}
          </form>
        </div>

        <div id="job-board" className="scroll-mt-24 rounded-[28px] border border-border bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text">Job board</h2>
              <p className="text-sm text-muted">Review your pending, active, and completed work.</p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">{jobs.length} total</span>
          </div>

          {jobLoading ? (
            <p className="text-sm text-muted">Loading jobs…</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-[#fafafa] p-6 text-center text-sm text-muted">
              No jobs yet. Create one to begin tracking progress.
            </div>
          ) : (
            <div className="space-y-5">
              {(['pending', 'active', 'done'] as JobStatus[]).map((status) => (
                <div key={status} className="rounded-3xl border border-border bg-[#fcfcfc] p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">{status === 'pending' ? 'Pending' : status === 'active' ? 'Active' : 'Done'}</p>
                      <p className="mt-1 text-2xl font-semibold text-text">{jobsByStatus[status].length}</p>
                    </div>
                    {jobsByStatus[status].length > 0 && (
                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-500">{jobsByStatus[status].length} job{jobsByStatus[status].length === 1 ? '' : 's'}</span>
                    )}
                  </div>
                  <div className="grid gap-4">
                    {jobsByStatus[status].length === 0 ? (
                      <p className="text-sm text-muted">No jobs in this section.</p>
                    ) : jobsByStatus[status].map((job) => {
                      const client = clients.find((client) => client.id === job.client_id);
                      const cold = isGoingCold(job);
                      return (
                        <div key={job.id} className="rounded-3xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-text">{job.title}</p>
                              <p className="mt-1 text-sm text-muted">{client?.name || 'Unknown client'}</p>
                            </div>
                            {cold && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Going cold</span>}
                          </div>
                          <p className="mt-3 text-sm text-muted">Status: {job.status.charAt(0).toUpperCase() + job.status.slice(1)}</p>
                          <p className="text-sm text-muted">Last contacted: {formatContactDate(job.last_contacted_at)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/95 backdrop-blur-md">
        <div className="container grid grid-cols-5 gap-2 px-0 py-3">
          <a href="#clients" className="flex flex-col items-center gap-1 rounded-3xl bg-[#f8f8fa] px-2 py-3 text-center text-[11px] font-semibold text-text hover:bg-[#efeff4]">
            <NavIcon type="clients" />
            <span>Clients</span>
          </a>
          <a href="#new-job" className="flex flex-col items-center gap-1 rounded-3xl bg-[#f8f8fa] px-2 py-3 text-center text-[11px] font-semibold text-text hover:bg-[#efeff4]">
            <NavIcon type="new-job" />
            <span>New job</span>
          </a>
          <a href="#my-profile" className="flex flex-col items-center gap-1 rounded-3xl bg-[#f8f8fa] px-2 py-3 text-center text-[11px] font-semibold text-text hover:bg-[#efeff4]">
            <NavIcon type="profile" />
            <span>My Profile</span>
          </a>
          <a href="/dashboard/enquiries" className="relative flex flex-col items-center gap-1 rounded-3xl bg-[#f8f8fa] px-2 py-3 text-center text-[11px] font-semibold text-text hover:bg-[#efeff4]">
            <NavIcon type="jobs" />
            <span>Enquiries</span>
            {unreadEnquiriesCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                {unreadEnquiriesCount}
              </span>
            )}
          </a>
          <button className="flex flex-col items-center gap-1 rounded-3xl bg-[#f8f8fa] px-2 py-3 text-center text-[11px] font-semibold text-text hover:bg-[#efeff4]" onClick={() => setShowAddClient(true)}>
            <NavIcon type="add-client" />
            <span>Add client</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
