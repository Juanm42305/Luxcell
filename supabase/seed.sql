-- SOLO DESARROLLO LOCAL: datos ficticios para revisar el diseño. Nombres, modelos, precios y
-- especificaciones no describen productos reales. `supabase db push` no ejecuta este archivo.

insert into public.brands (name, slug) values
  ('Apple', 'apple'),
  ('Samsung', 'samsung'),
  ('Xiaomi', 'xiaomi'),
  ('Motorola', 'motorola'),
  ('Genérica', 'generica');

insert into public.products (
  name, slug, model, brand_id, category_id, short_description, description, price, stock_quantity,
  condition, storage_capacity, colors, sale_price, offer_valid_until, specs, is_featured,
  is_active
)
select
  seed.name,
  seed.slug,
  seed.model,
  (select id from public.brands where slug = seed.brand),
  (select id from public.categories where slug = seed.category),
  'Descripción breve de ejemplo. El negocio la reemplazará por la real.',
  'Descripción completa de ejemplo. El negocio escribirá aquí la información real del producto desde el panel administrativo.',
  seed.price,
  seed.stock,
  seed.condition::public.product_condition,
  seed.storage,
  seed.colors,
  seed.sale_price,
  case when seed.sale_price is not null then current_date + 5 end,
  '[{"label": "Especificación 1", "value": "[Dato del negocio]"}, {"label": "Especificación 2", "value": "[Dato del negocio]"}]'::jsonb,
  seed.featured,
  true
from (values
  ('iPhone de ejemplo A', 'ejemplo-iphone-a', 'DEMO-001', 'apple', 'iphone', 4500000, 12, 'new', '256 GB', array['Titanio de ejemplo', 'Negro de ejemplo', 'Blanco de ejemplo'], 4100000, true),
  ('iPhone de ejemplo B', 'ejemplo-iphone-b', 'DEMO-002', 'apple', 'iphone', 2500000, 2, 'refurbished', '128 GB', array['Azul de ejemplo'], null, false),
  ('Galaxy de ejemplo A', 'ejemplo-galaxy-a', 'DEMO-003', 'samsung', 'samsung', 3800000, 8, 'new', '256 GB', array['Negro de ejemplo', 'Gris de ejemplo'], null, true),
  ('Galaxy de ejemplo B', 'ejemplo-galaxy-b', 'DEMO-004', 'samsung', 'samsung', 1200000, 0, 'display', '128 GB', array['Verde de ejemplo'], null, false),
  ('Xiaomi de ejemplo A', 'ejemplo-xiaomi-a', 'DEMO-005', 'xiaomi', 'xiaomi', 1650000, 15, 'new', '256 GB', array['Lila de ejemplo'], 1490000, true),
  ('Motorola de ejemplo A', 'ejemplo-motorola-a', 'DEMO-006', 'motorola', 'motorola', 980000, 3, 'like_new', '128 GB', array['Coral de ejemplo'], null, false),
  ('Audífonos de ejemplo A', 'ejemplo-audifonos-a', 'DEMO-007', 'generica', 'audifonos', 320000, 20, 'new', null, array['Blanco de ejemplo'], null, true),
  ('Cargador de ejemplo A', 'ejemplo-cargador-a', 'DEMO-008', 'generica', 'cargadores', 95000, 30, 'new', null, array['Blanco de ejemplo'], null, false),
  ('Funda de ejemplo A', 'ejemplo-funda-a', 'DEMO-009', 'generica', 'protectores-fundas', 60000, 1, 'new', null, array['Arena de ejemplo'], null, false),
  ('Accesorio de ejemplo A', 'ejemplo-accesorio-a', 'DEMO-010', 'generica', 'accesorios', 150000, 0, 'new', null, array['Grafito de ejemplo'], null, false)
) as seed(
  name, slug, model, brand, category, price, stock, condition, storage, colors, sale_price, featured
);
