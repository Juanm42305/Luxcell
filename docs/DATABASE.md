# Base de datos

PostgreSQL en Supabase. Los cambios se hacen solo con migraciones en `supabase/migrations/`.
`supabase/seed.sql` contiene datos ficticios y solo corre en local.

## Tablas

| Tabla                 | Contenido                                                 | Acceso público   |
| --------------------- | --------------------------------------------------------- | ---------------- |
| `categories`          | Categorías administrables                                 | Solo las activas |
| `brands`              | Marcas                                                    | Solo las activas |
| `products`            | Productos, precio en COP entero, existencias              | Ninguno          |
| `product_images`      | Ruta en Storage, orden, foto principal (una por producto) | Ninguno          |
| `inventory_movements` | Historial de existencias; solo lo escribe un disparador   | Ninguno          |
| `consent_versions`    | Texto exacto de cada versión del aviso                    | Lectura          |
| `inquiries`           | Consultas (datos personales) y prueba de autorización     | Ninguno          |
| `pqr_requests`        | Peticiones, quejas y reclamos con radicado                | Ninguno          |
| `business_settings`   | Fila única con los datos del negocio                      | Lectura          |
| `admin_profiles`      | Quién es administrador; no se puede crear desde la API    | Ninguno          |

## Vistas públicas

- `catalog_products`: productos activos con `stock_status` calculado. No expone `stock_quantity` ni
  `low_stock_threshold`.
- `catalog_product_images`: imágenes de productos activos.

Se ejecutan con permisos del dueño a propósito, porque el visitante no tiene acceso a las tablas
base. Por eso cada columna que se agregue a una vista debe revisarse.

## Reglas en la base de datos

- `stock_quantity >= 0` por restricción.
- Las existencias de un producto creado solo cambian con `set_stock_quantity()`.
- El estado de disponibilidad se calcula, no se guarda.
- `is_admin()` exige perfil de administrador y sesión con segundo factor (`aal2`).

## Storage

| Bucket               | Visibilidad | Tipos           | Límite |
| -------------------- | ----------- | --------------- | ------ |
| `product-images`     | Pública     | WebP            | 5 MB   |
| `business-assets`    | Pública     | WebP, PNG       | 2 MB   |
| `uploads-quarantine` | Privada     | JPEG, PNG, WebP | 15 MB  |

Solo un administrador con MFA puede escribir. El contenido de los buckets no se puede listar.

## Pendiente en fases posteriores

- Registro público de consultas y PQR mediante funciones validadas con límite de envíos (Fases 5 y 6).
  Hoy ningún visitante puede insertar.
- Plazo de conservación y purga de consultas: lo debe definir el negocio.
