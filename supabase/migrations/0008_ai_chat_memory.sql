create table public.ai_chat_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  day_context integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.ai_chat_memory enable row level security;

-- Policies
create policy "Users can view their own chat memory"
  on public.ai_chat_memory for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat memory"
  on public.ai_chat_memory for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat memory"
  on public.ai_chat_memory for delete
  using (auth.uid() = user_id);

-- Indexes for fast querying
create index ai_chat_memory_user_id_idx on public.ai_chat_memory(user_id);
create index ai_chat_memory_created_at_idx on public.ai_chat_memory(created_at);
