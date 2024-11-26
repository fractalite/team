-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop existing trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop existing tables if they exist (in correct order)
drop table if exists comments cascade;
drop table if exists tasks cascade;
drop table if exists projects cascade;
drop table if exists team_members cascade;
drop table if exists teams cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

-- Drop existing types
drop type if exists task_status cascade;
drop type if exists task_priority cascade;

-- Create custom types
create type task_status as enum ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'ARCHIVED');
create type task_priority as enum ('URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create teams table
create table teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create team_members table
create table team_members (
  team_id uuid references teams on delete cascade,
  user_id uuid references profiles on delete cascade,
  created_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- Create categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  team_id uuid references teams on delete cascade,
  category_id uuid references categories on delete set null,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status task_status default 'TODO',
  priority task_priority default 'MEDIUM',
  project_id uuid references projects on delete cascade,
  assignee_id uuid references profiles on delete set null,
  due_date timestamptz,
  labels text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  task_id uuid references tasks on delete cascade,
  author_id uuid references profiles on delete cascade,
  mentions uuid[] default array[]::uuid[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table categories enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;

-- Allow all authenticated users to do everything
create policy "Allow authenticated users full access"
on profiles for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access"
on teams for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access"
on team_members for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access"
on categories for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access"
on projects for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access"
on tasks for all using (auth.role() = 'authenticated');

create policy "Allow authenticated users full access"
on comments for all using (auth.role() = 'authenticated');

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;