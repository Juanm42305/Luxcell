-- Mínimo privilegio. Primero se retira todo lo que Supabase concede por defecto a los roles de la
-- API y luego se concede solo lo necesario. Lo que no aparece aquí queda denegado.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.consent_versions enable row level security;
alter table public.inquiries enable row level security;
alter table public.pqr_requests enable row level security;
alter table public.business_settings enable row level security;
alter table public.admin_profiles enable row level security;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.set_stock_quantity(uuid, integer, text) to authenticated;

-- Lectura pública: solo vistas y datos que por ley o por diseño son públicos.
grant select on public.catalog_products, public.catalog_product_images to anon, authenticated;
grant select on public.categories, public.brands, public.business_settings to anon, authenticated;
grant select on public.consent_versions to anon, authenticated;

create policy "visitantes ven categorías activas" on public.categories
  for select to anon using (is_active);
create policy "visitantes ven marcas activas" on public.brands
  for select to anon using (is_active);
create policy "visitantes ven la configuración del negocio" on public.business_settings
  for select to anon using (true);
create policy "visitantes ven las versiones del aviso" on public.consent_versions
  for select to anon using (true);

-- Con sesión, el mismo acceso de lectura; las escrituras exigen is_admin().
create policy "sesiones ven categorías activas o todas si son admin" on public.categories
  for select to authenticated using (is_active or (select public.is_admin()));
create policy "sesiones ven marcas activas o todas si son admin" on public.brands
  for select to authenticated using (is_active or (select public.is_admin()));
create policy "sesiones ven la configuración del negocio" on public.business_settings
  for select to authenticated using (true);
create policy "sesiones ven las versiones del aviso" on public.consent_versions
  for select to authenticated using (true);

grant insert, update, delete on public.categories, public.brands to authenticated;

create policy "admin crea categorías" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin edita categorías" on public.categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin elimina categorías" on public.categories
  for delete to authenticated using ((select public.is_admin()));

create policy "admin crea marcas" on public.brands
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin edita marcas" on public.brands
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin elimina marcas" on public.brands
  for delete to authenticated using ((select public.is_admin()));

-- Productos: stock_quantity queda fuera del UPDATE; solo cambia con set_stock_quantity().
grant select, delete on public.products to authenticated;
grant insert (
  name, slug, brand_id, model, category_id, short_description, description, price, stock_quantity,
  low_stock_threshold, condition, storage_capacity, color, specs, warranty_terms,
  offer_valid_until, is_featured, is_active
) on public.products to authenticated;
grant update (
  name, slug, brand_id, model, category_id, short_description, description, price,
  low_stock_threshold, condition, storage_capacity, color, specs, warranty_terms,
  offer_valid_until, is_featured, is_active
) on public.products to authenticated;

create policy "admin ve productos" on public.products
  for select to authenticated using ((select public.is_admin()));
create policy "admin crea productos" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin edita productos" on public.products
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin elimina productos" on public.products
  for delete to authenticated using ((select public.is_admin()));

grant select, insert, update, delete on public.product_images to authenticated;

create policy "admin ve imágenes" on public.product_images
  for select to authenticated using ((select public.is_admin()));
create policy "admin crea imágenes" on public.product_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin edita imágenes" on public.product_images
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin elimina imágenes" on public.product_images
  for delete to authenticated using ((select public.is_admin()));

-- El historial solo lo escribe el disparador; ni un admin puede alterarlo.
grant select on public.inventory_movements to authenticated;
create policy "admin ve el historial de inventario" on public.inventory_movements
  for select to authenticated using ((select public.is_admin()));

grant insert on public.consent_versions to authenticated;
create policy "admin publica versiones del aviso" on public.consent_versions
  for insert to authenticated with check ((select public.is_admin()));

-- Datos personales. El registro público se añadirá con una función validada en la Fase 5;
-- hasta entonces nadie sin privilegios puede insertar. El admin solo cambia el estado.
grant select, delete on public.inquiries to authenticated;
grant update (inquiry_status) on public.inquiries to authenticated;
create policy "admin ve consultas" on public.inquiries
  for select to authenticated using ((select public.is_admin()));
create policy "admin actualiza consultas" on public.inquiries
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin elimina consultas" on public.inquiries
  for delete to authenticated using ((select public.is_admin()));

grant select, delete on public.pqr_requests to authenticated;
grant update (status, due_at, resolved_at) on public.pqr_requests to authenticated;
create policy "admin ve pqr" on public.pqr_requests
  for select to authenticated using ((select public.is_admin()));
create policy "admin actualiza pqr" on public.pqr_requests
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin elimina pqr" on public.pqr_requests
  for delete to authenticated using ((select public.is_admin()));

grant update (
  business_name, slogan, description, logo_path, whatsapp_number, contact_email, phone,
  business_address, legal_name, tax_id, judicial_address, sales_authorization, social_media,
  brand_colors
) on public.business_settings to authenticated;
create policy "admin edita la configuración" on public.business_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Cada usuario ve solo su perfil. Nadie crea administradores desde la API.
grant select on public.admin_profiles to authenticated;
create policy "usuario ve su propio perfil" on public.admin_profiles
  for select to authenticated using (auth_user_id = (select auth.uid()));

-- Almacenamiento. Sin política SELECT para visitantes: se sirven archivos por URL pública, pero
-- no se puede listar el contenido del bucket. La cuarentena es privada: las subidas se validan en
-- el servidor (Fase 4) antes de pasar al bucket público.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 5242880, array['image/webp']),
  ('business-assets', 'business-assets', true, 2097152, array['image/webp', 'image/png']),
  ('uploads-quarantine', 'uploads-quarantine', false, 15728640,
    array['image/jpeg', 'image/png', 'image/webp']);

create policy "admin ve archivos" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('product-images', 'business-assets', 'uploads-quarantine')
    and (select public.is_admin())
  );
create policy "admin sube archivos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('product-images', 'business-assets', 'uploads-quarantine')
    and (select public.is_admin())
  );
create policy "admin actualiza archivos" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('product-images', 'business-assets', 'uploads-quarantine')
    and (select public.is_admin())
  )
  with check (
    bucket_id in ('product-images', 'business-assets', 'uploads-quarantine')
    and (select public.is_admin())
  );
create policy "admin elimina archivos" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('product-images', 'business-assets', 'uploads-quarantine')
    and (select public.is_admin())
  );
