create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key
  on public.waitlist (lower(email));

-- Solo el servidor (service role) escribe; nadie lee desde el navegador.
alter table public.waitlist enable row level security;
