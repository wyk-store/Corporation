-- WYK — Partie 4 : lien de panier partageable (page /panier) + image d'aperçu large
-- Supabase > SQL Editor > New query > Run. Sans risque si relancé.
-- (Si Supabase propose « Run and enable RLS » : choisir cette option.)

create table if not exists public.shared_carts (
  code        text primary key check (length(code) between 6 and 16),
  owner_name  text,
  mode        text,
  zone        text,
  fee         numeric default 0,
  total       numeric default 0,
  order_ref   text,
  items       jsonb not null,
  image_path  text,
  user_id     uuid default auth.uid(),
  created_at  timestamptz default now(),
  constraint shared_carts_items_chk check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 60)
);
alter table public.shared_carts enable row level security;

drop policy if exists "wyk_carts_insert" on public.shared_carts;
drop policy if exists "wyk_carts_own"    on public.shared_carts;
drop policy if exists "wyk_carts_admin"  on public.shared_carts;
-- tout le monde (même sans compte) peut créer un panier partagé ; personne ne peut les LISTER
create policy "wyk_carts_insert" on public.shared_carts for insert to anon, authenticated with check (true);
create policy "wyk_carts_own"    on public.shared_carts for select to authenticated using (user_id = auth.uid());
create policy "wyk_carts_admin"  on public.shared_carts for all using (public.is_wyk_admin()) with check (public.is_wyk_admin());

-- lecture d'UN panier à partir de son code (le lien) : sans exposer le téléphone ni l'identifiant du client
create or replace function public.wyk_get_cart(p_code text) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(c) - 'user_id' from public.shared_carts c where c.code = p_code;
$$;
grant execute on function public.wyk_get_cart(text) to anon, authenticated;

-- image d'aperçu du panier (publique, 2 Mo max, png/jpg)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cart-cards', 'cart-cards', true, 2097152, array['image/png','image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png','image/jpeg'];
drop policy if exists "wyk_cartcards_up" on storage.objects;
create policy "wyk_cartcards_up" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'cart-cards' and name ~ '^[a-z0-9]{6,16}\.(png|jpg)$');

-- lien entre une commande et son panier
alter table public.orders add column if not exists cart_code text;
