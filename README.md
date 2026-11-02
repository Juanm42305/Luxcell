# Catálogo de celulares y accesorios

Catálogo con inventario y contacto por WhatsApp. No incluye pagos, carrito ni checkout.

**Estado:** Fase 3 (backend). Sin los datos del negocio completos, el sitio muestra un aviso y no se
indexa. No apto para producción todavía: ver `docs/DEPLOYMENT.md`.

## Puesta en marcha local

Requiere Node 24 y Docker.

```bash
npm install
git config core.hooksPath .githooks   # activa el bloqueo de credenciales en cada commit
npx supabase start                    # base de datos con productos ficticios
cp .env.example .env.local            # completar con los valores de `npx supabase status`
npm run dev                           # http://localhost:3000
```

## Comandos

```bash
npm run lint
npm run typecheck
npm test                # pruebas unitarias
npx supabase test db    # pruebas de seguridad de la base de datos
npm run build
```

## Documentación

- `docs/DATABASE.md`: modelo de datos y migraciones.
- `docs/SECURITY.md`: controles, verificación y riesgos residuales.
- `docs/DEPLOYMENT.md`: despliegue y creación del administrador.

Todo texto entre corchetes (`[Nombre comercial]`, `[NIT]`…) es un dato pendiente del negocio.
