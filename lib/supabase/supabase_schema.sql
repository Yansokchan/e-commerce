-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  mrp numeric not null,
  images text[] default array[]::text[],
  category text not null,
  in_stock boolean default true,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  items jsonb not null,
  total numeric not null,
  status text default 'pending',
  phone text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table products enable row level security;
alter table orders enable row level security;

-- Policies for Products
-- Everyone can read products
create policy "Public products are viewable by everyone"
  on products for select
  using ( true );

-- Only authenticated users (admins) can insert/update/delete products
-- Ideally check for specific admin role, but for now allow any auth user (assuming only owner logs in as admin)
create policy "Enable insert for authenticated users only"
  on products for insert
  to authenticated
  with check ( true );

create policy "Enable update for authenticated users only"
  on products for update
  to authenticated
  using ( true );

create policy "Enable delete for authenticated users only"
  on products for delete
  to authenticated
  using ( true );

-- Policies for Orders
-- Users can see their own orders
create policy "Users can view own orders"
  on orders for select
  using ( auth.uid() = user_id );

-- Anyone can insert orders (Guest checkout)
create policy "Enable insert for everyone"
  on orders for insert
  with check ( true );
