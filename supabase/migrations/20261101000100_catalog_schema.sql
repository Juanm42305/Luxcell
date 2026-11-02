-- Esquema del catálogo: tablas, relaciones, restricciones e índices.
-- Los precios se guardan en pesos enteros y las existencias nunca pueden ser negativas.

create type public.product_condition as enum ('new', 'used', 'refurbished');
create type public.inquiry_status as enum ('new', 'in_progress', 'closed');
create type public.pqr_type as enum ('peticion', 'queja', 'reclamo', 'datos_personales');
create type public.pqr_status as enum ('received', 'in_progress', 'resolved');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 500),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 150),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand_id uuid not null references public.brands (id) on delete restrict,
  model text not null check (char_length(model) between 1 and 100),
  category_id uuid not null references public.categories (id) on delete restrict,
  short_description text not null check (char_length(short_description) between 1 and 300),
  description text not null check (char_length(description) between 1 and 5000),
  price bigint not null check (price >= 0 and price <= 1000000000),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  condition public.product_condition not null default 'new',
  storage_capacity text check (char_length(storage_capacity) <= 40),
  color text check (char_length(color) <= 60),
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  warranty_terms text check (char_length(warranty_terms) <= 2000),
  offer_valid_until date,
  is_featured boolean not null default false,
  -- Un producto nuevo no se publica hasta que el negocio lo active.
  is_active boolean not null default false,
  stock_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.products.price is 'Precio total en pesos colombianos (COP), sin decimales.';

create index products_brand_id_idx on public.products (brand_id);
create index products_category_id_idx on public.products (category_id);
create index products_active_created_idx on public.products (created_at desc) where is_active;
create index products_active_price_idx on public.products (price) where is_active;

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Ruta dentro del bucket, no una URL: así un cambio de dominio no rompe las imágenes.
  storage_path text not null unique check (char_length(storage_path) between 1 and 300),
  alt_text text not null check (char_length(alt_text) between 1 and 200),
  is_primary boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id, display_order);
create unique index product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;

-- Historial de solo inserción. Conserva el nombre aunque el producto se elimine.
create table public.inventory_movements (
  id bigint generated always as identity primary key,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  quantity_delta integer not null,
  resulting_quantity integer not null check (resulting_quantity >= 0),
  reason text check (char_length(reason) <= 200),
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_movements_created_idx on public.inventory_movements (created_at desc);
create index inventory_movements_product_idx on public.inventory_movements (product_id);
create index inventory_movements_actor_idx on public.inventory_movements (actor_id);

-- Texto exacto que aceptó cada titular: prueba de la autorización (art. 12, Ley 1581 de 2012).
create table public.consent_versions (
  version text primary key check (char_length(version) between 1 and 40),
  notice_text text not null check (char_length(notice_text) between 1 and 20000),
  effective_from timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_number text not null unique
    default 'CON-' || to_char(now(), 'YYYYMMDD') || '-'
      || upper(left(replace(gen_random_uuid()::text, '-', ''), 8)),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  customer_email text not null check (char_length(customer_email) between 3 and 254),
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text check (char_length(product_name_snapshot) <= 150),
  consent_version text not null references public.consent_versions (version) on delete restrict,
  consent_timestamp timestamptz not null default now(),
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  inquiry_status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (marketing_consent = (marketing_consent_at is not null))
);

create index inquiries_created_idx on public.inquiries (created_at desc);
create index inquiries_product_idx on public.inquiries (product_id);
create index inquiries_consent_version_idx on public.inquiries (consent_version);

create table public.pqr_requests (
  id uuid primary key default gen_random_uuid(),
  filing_number text not null unique
    default 'PQR-' || to_char(now(), 'YYYYMMDD') || '-'
      || upper(left(replace(gen_random_uuid()::text, '-', ''), 8)),
  request_type public.pqr_type not null,
  requester_name text not null check (char_length(requester_name) between 1 and 120),
  requester_email text not null check (char_length(requester_email) between 3 and 254),
  description text not null check (char_length(description) between 1 and 5000),
  consent_version text not null references public.consent_versions (version) on delete restrict,
  status public.pqr_status not null default 'received',
  due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pqr_requests_created_idx on public.pqr_requests (created_at desc);
create index pqr_requests_consent_version_idx on public.pqr_requests (consent_version);

-- Una sola fila: la clave primaria solo admite el valor verdadero.
create table public.business_settings (
  id boolean primary key default true check (id),
  business_name text check (char_length(business_name) <= 120),
  slogan text check (char_length(slogan) <= 160),
  description text check (char_length(description) <= 1000),
  logo_path text check (char_length(logo_path) <= 300),
  whatsapp_number text check (whatsapp_number ~ '^[1-9][0-9]{7,14}$'),
  contact_email text check (char_length(contact_email) <= 254),
  phone text check (char_length(phone) <= 30),
  business_address text check (char_length(business_address) <= 200),
  legal_name text check (char_length(legal_name) <= 160),
  tax_id text check (char_length(tax_id) <= 30),
  judicial_address text check (char_length(judicial_address) <= 200),
  sales_authorization text check (char_length(sales_authorization) <= 80),
  social_media jsonb not null default '[]'::jsonb check (jsonb_typeof(social_media) = 'array'),
  brand_colors jsonb not null default '{}'::jsonb check (jsonb_typeof(brand_colors) = 'object'),
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id) values (true);

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

-- Categorías iniciales solicitadas por el negocio; se administran desde el panel.
insert into public.categories (name, slug, display_order) values
  ('iPhone', 'iphone', 1),
  ('Samsung', 'samsung', 2),
  ('Xiaomi', 'xiaomi', 3),
  ('Motorola', 'motorola', 4),
  ('Otros dispositivos Android', 'otros-android', 5),
  ('Accesorios', 'accesorios', 6),
  ('Cargadores', 'cargadores', 7),
  ('Audífonos', 'audifonos', 8),
  ('Protectores y fundas', 'protectores-fundas', 9),
  ('Otros productos tecnológicos', 'otros-tecnologicos', 10);
