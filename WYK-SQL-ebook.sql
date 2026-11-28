-- ════════════════════════════════════════════════════════════════════
-- WYK — Page Ebook : enregistrement par l'admin + suggestions des lecteurs
-- Supabase > SQL Editor > New query > coller TOUT > Run.
-- ✔ Sans risque si relancé (aucun doublon créé, aucune donnée supprimée).
-- ✔ Les livres, slides et affiches de l'Ebook sont enregistrés dans la table
--   site_pages (ligne « ebook-data ») : ils ne passent PAS par la table
--   products → jamais visibles sur la page d'accueil, ni dans les catégories.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.wyk_is_site_admin() returns boolean
language sql stable as $$
  select auth.uid() = 'dcdb1af5-6305-4138-b991-cf3a931740ed'::uuid
$$;
grant execute on function public.wyk_is_site_admin() to anon, authenticated;

-- 0b) Catégorie « Ebook » du magasin : la case « Catégorie Ebook » (Admin > Catégories) envoie vers /ebook
alter table public.categories add column if not exists is_ebook boolean default false;
-- si aucune catégorie n'est encore cochée, on coche celle qui s'appelle exactement Ebook / E-book / Ebooks
update public.categories set is_ebook = true
 where name ~* '^\s*(e-?books?|livres?\s+num[eé]riques?)\s*$'
   and not exists (select 1 from public.categories where is_ebook is true);

-- 1) Contenu de la page (livres, slides, affiches, rayons) + pages légales
create table if not exists public.site_pages (
  slug       text primary key,
  title      text,
  content    text,
  updated_at timestamptz default now()
);
alter table public.site_pages enable row level security;
drop policy if exists "lecture publique" on public.site_pages;
drop policy if exists "ecriture admin"   on public.site_pages;
drop policy if exists "wyk_sp_read"      on public.site_pages;
drop policy if exists "wyk_sp_admin"     on public.site_pages;
create policy "wyk_sp_read"  on public.site_pages for select to anon, authenticated using (true);
create policy "wyk_sp_admin" on public.site_pages for all to authenticated
  using (public.wyk_is_site_admin()) with check (public.wyk_is_site_admin());

-- 2) Suggestions de livres + votes (une voix par navigateur ou par compte)
create table if not exists public.ebook_requests (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 2 and 120),
  title_key  text not null,
  author     text,
  note       text,
  votes      int  not null default 0,
  status     text not null default 'open',
  proposer   text,
  created_at timestamptz not null default now()
);
alter table public.ebook_requests add column if not exists title_key text;
alter table public.ebook_requests add column if not exists proposer  text;
alter table public.ebook_requests add column if not exists votes     int  not null default 0;
alter table public.ebook_requests add column if not exists status    text not null default 'open';
update public.ebook_requests
   set title_key = regexp_replace(lower(translate(title,'àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ','aaaeeeeiioouuucaaaeeeeiioouuuc')),'[^a-z0-9]+','','g')
 where title_key is null or title_key = '';
create index if not exists ebook_requests_key_idx   on public.ebook_requests (title_key);
create index if not exists ebook_requests_votes_idx on public.ebook_requests (votes desc, created_at desc);

create table if not exists public.ebook_votes (
  request_id uuid not null references public.ebook_requests(id) on delete cascade,
  voter      text not null,
  created_at timestamptz not null default now(),
  primary key (request_id, voter)
);

alter table public.ebook_requests enable row level security;
alter table public.ebook_votes    enable row level security;
drop policy if exists "wyk_ebr_read"  on public.ebook_requests;
drop policy if exists "wyk_ebr_admin" on public.ebook_requests;
drop policy if exists "wyk_ebv_admin" on public.ebook_votes;
-- tout le monde peut LIRE les suggestions ; l'écriture se fait par les fonctions ci-dessous
create policy "wyk_ebr_read"  on public.ebook_requests for select to anon, authenticated using (true);
create policy "wyk_ebr_admin" on public.ebook_requests for all to authenticated
  using (public.wyk_is_site_admin()) with check (public.wyk_is_site_admin());
create policy "wyk_ebv_admin" on public.ebook_votes for all to authenticated
  using (public.wyk_is_site_admin()) with check (public.wyk_is_site_admin());

-- Proposer un titre (3 nouvelles suggestions max par jour et par lecteur ; les doublons sont regroupés)
create or replace function public.ebook_add_request(p_title text, p_author text, p_note text, p_voter text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t text := left(btrim(regexp_replace(coalesce(p_title,''),'\s+',' ','g')),120);
  k text; r public.ebook_requests; n int; ins int;
begin
  if char_length(t) < 2 or coalesce(char_length(p_voter),0) < 3 or char_length(p_voter) > 80 then
    return jsonb_build_object('error','invalid');
  end if;
  k := regexp_replace(lower(translate(t,'àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ','aaaeeeeiioouuucaaaeeeeiioouuuc')),'[^a-z0-9]+','','g');
  if k = '' then return jsonb_build_object('error','invalid'); end if;

  select * into r from public.ebook_requests where title_key = k order by created_at limit 1;
  if found then
    insert into public.ebook_votes(request_id, voter) values (r.id, p_voter) on conflict do nothing;
    get diagnostics ins = row_count;
    if ins > 0 then update public.ebook_requests set votes = votes + 1 where id = r.id returning * into r; end if;
    return jsonb_build_object('id', r.id, 'existing', true, 'votes', r.votes);
  end if;

  select count(*) into n from public.ebook_requests
   where proposer = p_voter and created_at > now() - interval '1 day';
  if n >= 3 then return jsonb_build_object('error','limit'); end if;

  insert into public.ebook_requests(title, title_key, author, note, votes, proposer)
  values (t, k, nullif(left(btrim(coalesce(p_author,'')),80),''), nullif(left(btrim(coalesce(p_note,'')),240),''), 1, p_voter)
  returning * into r;
  insert into public.ebook_votes(request_id, voter) values (r.id, p_voter) on conflict do nothing;
  return jsonb_build_object('id', r.id, 'existing', false, 'votes', 1);
end $$;

-- Soutenir un titre
create or replace function public.ebook_vote(p_request uuid, p_voter text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare ins int; v int;
begin
  if p_request is null or coalesce(char_length(p_voter),0) < 3 or char_length(p_voter) > 80 then
    return jsonb_build_object('error','invalid');
  end if;
  insert into public.ebook_votes(request_id, voter) values (p_request, p_voter) on conflict do nothing;
  get diagnostics ins = row_count;
  if ins > 0 then update public.ebook_requests set votes = votes + 1 where id = p_request; end if;
  select votes into v from public.ebook_requests where id = p_request;
  return jsonb_build_object('votes', coalesce(v,0), 'added', ins > 0);
end $$;

-- Les suggestions déjà soutenues par ce lecteur (pour afficher le bouton « soutenu »)
create or replace function public.ebook_my_votes(p_voter text)
returns table(request_id uuid) language sql stable security definer set search_path = public as $$
  select request_id from public.ebook_votes where voter = p_voter
$$;

revoke all on function public.ebook_add_request(text,text,text,text) from public;
revoke all on function public.ebook_vote(uuid,text) from public;
revoke all on function public.ebook_my_votes(text) from public;
grant execute on function public.ebook_add_request(text,text,text,text) to anon, authenticated;
grant execute on function public.ebook_vote(uuid,text) to anon, authenticated;
grant execute on function public.ebook_my_votes(text) to anon, authenticated;

-- 3) Images téléversées depuis l'éditeur (couvertures, affiches…) : bucket public « wyk-images »
insert into storage.buckets (id, name, public)
values ('wyk-images', 'wyk-images', true)
on conflict (id) do update set public = true;
drop policy if exists "wyk_images_admin_ins" on storage.objects;
drop policy if exists "wyk_images_admin_upd" on storage.objects;
drop policy if exists "wyk_images_admin_sel" on storage.objects;
drop policy if exists "wyk_images_admin_del" on storage.objects;
create policy "wyk_images_admin_ins" on storage.objects for insert to authenticated
  with check (bucket_id = 'wyk-images' and public.wyk_is_site_admin());
create policy "wyk_images_admin_upd" on storage.objects for update to authenticated
  using (bucket_id = 'wyk-images' and public.wyk_is_site_admin());
create policy "wyk_images_admin_sel" on storage.objects for select to authenticated
  using (bucket_id = 'wyk-images' and public.wyk_is_site_admin());
create policy "wyk_images_admin_del" on storage.objects for delete to authenticated
  using (bucket_id = 'wyk-images' and public.wyk_is_site_admin());
