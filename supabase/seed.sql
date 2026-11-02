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
  condition, storage_capacity, color, specs, is_featured, is_active
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
  seed.color,
  '[{"label": "Especificación 1", "value": "[Dato del negocio]"}, {"label": "Especificación 2", "value": "[Dato del negocio]"}]'::jsonb,
  seed.featured,
  true
from (values
  ('iPhone de ejemplo A', 'ejemplo-iphone-a', 'DEMO-001', 'apple', 'iphone', 4500000, 12, 'new', '256 GB', 'Titanio de ejemplo', true),
  ('iPhone de ejemplo B', 'ejemplo-iphone-b', 'DEMO-002', 'apple', 'iphone', 2500000, 2, 'refurbished', '128 GB', 'Azul de ejemplo', false),
  ('Galaxy de ejemplo A', 'ejemplo-galaxy-a', 'DEMO-003', 'samsung', 'samsung', 3800000, 8, 'new', '256 GB', 'Negro de ejemplo', true),
  ('Galaxy de ejemplo B', 'ejemplo-galaxy-b', 'DEMO-004', 'samsung', 'samsung', 1200000, 0, 'new', '128 GB', 'Verde de ejemplo', false),
  ('Xiaomi de ejemplo A', 'ejemplo-xiaomi-a', 'DEMO-005', 'xiaomi', 'xiaomi', 1650000, 15, 'new', '256 GB', 'Lila de ejemplo', true),
  ('Motorola de ejemplo A', 'ejemplo-motorola-a', 'DEMO-006', 'motorola', 'motorola', 980000, 3, 'used', '128 GB', 'Coral de ejemplo', false),
  ('Audífonos de ejemplo A', 'ejemplo-audifonos-a', 'DEMO-007', 'generica', 'audifonos', 320000, 20, 'new', null, 'Blanco de ejemplo', true),
  ('Cargador de ejemplo A', 'ejemplo-cargador-a', 'DEMO-008', 'generica', 'cargadores', 95000, 30, 'new', null, 'Blanco de ejemplo', false),
  ('Funda de ejemplo A', 'ejemplo-funda-a', 'DEMO-009', 'generica', 'protectores-fundas', 60000, 1, 'new', null, 'Arena de ejemplo', false),
  ('Accesorio de ejemplo A', 'ejemplo-accesorio-a', 'DEMO-010', 'generica', 'accesorios', 150000, 0, 'new', null, 'Grafito de ejemplo', false)
) as seed(name, slug, model, brand, category, price, stock, condition, storage, color, featured);
