-- Mateando entre Almas - Supabase schema para panel /admin
-- Ejecutar en Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  name text,
  email text,
  role text not null default 'Operador',
  status text not null default 'Activo',
  photo text,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  customer_name text,
  customer_email text,
  customer_whatsapp text,
  customer_address text,
  customer_street text,
  customer_number text,
  customer_neighborhood text,
  customer_city text,
  customer_province text,
  customer_postal_code text,
  payment_method text,
  payment_label text,
  payment_status text,
  order_status text not null default 'Pendiente',
  book_title text,
  book_price numeric(12,2) default 0,
  shipping_price numeric(12,2) default 0,
  subtotal numeric(12,2) default 0,
  mp_fee numeric(12,2) default 0,
  total numeric(12,2) default 0,
  tracking_number text default '',
  tracking_url text default '',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.admin_roles (name, permissions)
values
('SuperAdmin', array['dashboard','pedidos','usuarios','roles','perfil','exportar','eliminar','editar_estado']),
('Operador', array['dashboard','pedidos','perfil'])
on conflict (name) do nothing;

-- Usuario inicial: fmgambino / Jamboree0342$$
insert into public.admin_users (username, name, email, role, status, password_hash)
values ('fmgambino', 'Ing. Fernando M. Gambino', 'fernando.m.gambino@gmail.com', 'SuperAdmin', 'Activo', 'a5c5a351e8079e134e64560be75a47462c18a088d0e52a3be9ff2200552e4aae')
on conflict (username) do nothing;

-- Para proyecto estático con anon key. Para producción se recomienda endurecer RLS con Supabase Auth.
alter table public.admin_roles enable row level security;
alter table public.admin_users enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public_admin_roles_all" on public.admin_roles;
drop policy if exists "public_admin_users_all" on public.admin_users;
drop policy if exists "public_orders_all" on public.orders;

create policy "public_admin_roles_all" on public.admin_roles for all using (true) with check (true);
create policy "public_admin_users_all" on public.admin_users for all using (true) with check (true);
create policy "public_orders_all" on public.orders for all using (true) with check (true);
