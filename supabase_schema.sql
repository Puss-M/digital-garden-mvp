-- Enable pgvector extension
create extension if not exists vector;

-- Create table if not exists (idempotent)
create table if not exists ideas (
  id bigint primary key generated always as identity,
  content text not null,
  title text,
  author text not null,
  tags text[],
  is_public boolean default true,
  embedding vector(384),
  created_at timestamptz default now()
);

-- Ensure columns exist (in case table existed but columns didn't)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'ideas' and column_name = 'title') then
    alter table ideas add column title text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ideas' and column_name = 'tags') then
    alter table ideas add column tags text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'ideas' and column_name = 'is_public') then
    alter table ideas add column is_public boolean default true;
  end if;
end $$;
