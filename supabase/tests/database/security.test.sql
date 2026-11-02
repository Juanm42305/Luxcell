-- Pruebas de seguridad: cada caso actúa con el rol real que usaría la API.
begin;
create extension if not exists pgtap with schema extensions;
select plan(38);

-- Datos de prueba (todos ficticios)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@prueba.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'intruso@prueba.invalid');
insert into public.admin_profiles (auth_user_id) values ('00000000-0000-0000-0000-00000000000a');
insert into public.brands (id, name, slug) values
  ('00000000-0000-0000-0000-0000000000b1', 'Marca de prueba', 'marca-prueba');
insert into public.products (
  id, name, slug, model, brand_id, category_id, short_description, description, price,
  stock_quantity, low_stock_threshold, is_active
) values
  ('00000000-0000-0000-0000-0000000000f1', 'Visible', 'visible', 'T1',
   '00000000-0000-0000-0000-0000000000b1', (select id from public.categories limit 1),
   'b', 'd', 1000, 2, 3, true),
  ('00000000-0000-0000-0000-0000000000f2', 'Oculto', 'oculto', 'T2',
   '00000000-0000-0000-0000-0000000000b1', (select id from public.categories limit 1),
   'b', 'd', 1000, 9, 3, false);
insert into public.consent_versions (version, notice_text) values ('prueba', 'aviso');
insert into public.inquiries (customer_name, customer_email, consent_version)
  values ('Persona ficticia', 'ficticia@prueba.invalid', 'prueba');

-- Configuración global
select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0, 'todas las tablas de public tienen RLS activo');
select is(
  (select count(*)::int from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'anon' and privilege_type <> 'SELECT'),
  0, 'anon no tiene ningún permiso de escritura en public');
select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prosecdef
     and not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')),
  0, 'toda función SECURITY DEFINER fija search_path');
select ok(not has_function_privilege('anon', 'public.is_admin()', 'execute'),
  'anon no ejecuta is_admin');
select ok(not has_function_privilege('anon', 'public.set_stock_quantity(uuid,integer,text)', 'execute'),
  'anon no ejecuta set_stock_quantity');
select ok(not has_function_privilege('anon', 'public.log_inventory_movement()', 'execute'),
  'anon no ejecuta funciones internas');
select ok((select public from storage.buckets where id = 'uploads-quarantine') = false,
  'el bucket de cuarentena es privado');
select is(
  (select allowed_mime_types from storage.buckets where id = 'product-images'),
  array['image/webp'], 'el bucket público solo admite WebP');

-- Visitante anónimo
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select is((select count(*)::int from public.catalog_products where slug = 'visible'), 1,
  'anon ve productos activos');
select is((select count(*)::int from public.catalog_products where slug = 'oculto'), 0,
  'anon no ve productos ocultos');
select is((select stock_status from public.catalog_products where slug = 'visible'), 'low_stock',
  'anon ve el estado calculado');
select throws_ok($$ select stock_quantity from public.catalog_products $$, '42703', null,
  'la vista no expone existencias');
select throws_ok($$ select * from public.products $$, '42501', null,
  'anon no lee la tabla products');
select throws_ok($$ select * from public.inquiries $$, '42501', null, 'anon no lee consultas');
select throws_ok($$ select * from public.pqr_requests $$, '42501', null, 'anon no lee PQR');
select throws_ok($$ select * from public.admin_profiles $$, '42501', null,
  'anon no lee administradores');
select throws_ok($$ select * from public.inventory_movements $$, '42501', null,
  'anon no lee el historial');
select throws_ok(
  $$ insert into public.inquiries (customer_name, customer_email, consent_version)
     values ('x', 'x@x.co', 'prueba') $$,
  '42501', null, 'anon no inserta directamente consultas');
select throws_ok(
  $$ update public.products set price = 1 $$, '42501', null, 'anon no modifica precios');
select throws_ok(
  $$ select public.set_stock_quantity('00000000-0000-0000-0000-0000000000f1', 99) $$,
  '42501', null, 'anon no modifica inventario');
select throws_ok(
  $$ update public.business_settings set whatsapp_number = '573000000000' $$,
  '42501', null, 'anon no cambia el número de WhatsApp');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('product-images', 'malicioso.webp') $$,
  '42501', null, 'anon no sube archivos');
select is_empty($$ select 1 from storage.objects $$, 'anon no puede listar archivos');
reset role;

-- Usuario autenticado que no es administrador, aun con MFA
set local role authenticated;
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000b","aal":"aal2"}', true);

select is_empty($$ select 1 from public.inquiries $$, 'un no-admin no ve consultas');
select is_empty($$ select 1 from public.products $$, 'un no-admin no ve la tabla products');
select throws_ok(
  $$ select public.set_stock_quantity('00000000-0000-0000-0000-0000000000f1', 99) $$,
  '42501', 'No autorizado', 'un no-admin no modifica inventario');
select throws_ok(
  $$ insert into public.admin_profiles (auth_user_id)
     values ('00000000-0000-0000-0000-00000000000b') $$,
  '42501', null, 'nadie se convierte en admin por la API');
select results_eq(
  $$ with changed as (update public.products set price = 1 returning 1) select count(*)::int from changed $$,
  $$ values (0) $$, 'un no-admin no modifica productos');
reset role;

-- Administrador con contraseña pero sin segundo factor
set local role authenticated;
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000a","aal":"aal1"}', true);

select is_empty($$ select 1 from public.inquiries $$, 'sin MFA el admin no ve consultas');
select throws_ok(
  $$ select public.set_stock_quantity('00000000-0000-0000-0000-0000000000f1', 99) $$,
  '42501', 'No autorizado', 'sin MFA el admin no modifica inventario');
reset role;

-- Administrador con MFA
set local role authenticated;
select set_config('request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-0000-0000-00000000000a","aal":"aal2"}', true);

select is((select count(*)::int from public.inquiries), 1, 'el admin con MFA ve consultas');
select is(public.set_stock_quantity('00000000-0000-0000-0000-0000000000f1', 7, 'Conteo'), 7,
  'el admin con MFA actualiza existencias');
select throws_ok(
  $$ select public.set_stock_quantity('00000000-0000-0000-0000-0000000000f1', -1) $$,
  '23514', null, 'las existencias no pueden ser negativas');
select throws_ok(
  $$ update public.products set stock_quantity = 50 $$, '42501', null,
  'ni el admin cambia existencias sin pasar por la función');
select results_eq(
  $$ select quantity_delta, resulting_quantity, reason from public.inventory_movements
     where product_id = '00000000-0000-0000-0000-0000000000f1' order by id desc limit 1 $$,
  $$ values (5, 7, 'Conteo'::text) $$, 'el cambio queda en el historial con su motivo');
select throws_ok(
  $$ delete from public.inventory_movements $$, '42501', null, 'el historial no se puede borrar');
select throws_ok(
  $$ update public.inquiries set customer_email = 'otro@prueba.invalid' $$, '42501', null,
  'el admin no altera los datos ni la prueba de consentimiento de una consulta');
reset role;

select is(
  (select stock_status from public.catalog_products where slug = 'visible'), 'available',
  'el estado cambia a disponible al superar el umbral');

select * from finish();
rollback;
