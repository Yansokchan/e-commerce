-- Create carts table
create table if not exists public.carts (
  user_id uuid references auth.users not null primary key,
  items jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.carts enable row level security;

-- Policies
create policy "Users can view their own cart" 
  on public.carts for select 
  using (auth.uid() = user_id);

create policy "Users can insert/update their own cart" 
  on public.carts for all 
  using (auth.uid() = user_id);
