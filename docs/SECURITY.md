# Seguridad

Ningún control hace invulnerable a una aplicación y esta plataforma no tiene certificaciones. Este
documento registra lo implementado, cómo verificarlo y lo que queda por resolver.

## Modelo

Tres barreras independientes: `proxy.ts`, `requireAdmin()` y las políticas RLS. La última es la que
importa: la clave pública está en el navegador por diseño, así que cualquiera puede llamar a la API
directamente. Si el código de la app fallara, RLS debe seguir negando el acceso.

## Credenciales

| Valor                     | Dónde vive              | Riesgo si se expone               |
| ------------------------- | ----------------------- | --------------------------------- |
| URL y clave `publishable` | Navegador, Vercel       | Ninguno por diseño; la limita RLS |
| Clave `secret`            | **No se usa en la app** | Total: nunca agregarla a Vercel   |
| Contraseña de la BD       | Supabase                | Total: nunca compartirla          |

Controles: `.gitignore` excluye `.env*`, un hook local bloquea commits con credenciales y gitleaks
revisa todo el historial en CI. Si una credencial llega a un commit, se considera filtrada: hay que
rotarla, porque borrarla del repositorio no basta.

## Controles implementados

- **Acceso a datos:** RLS en todas las tablas; permisos retirados por defecto a `anon` y
  `authenticated`, y concedidos uno a uno.
- **Autenticación:** registro público desactivado, MFA TOTP obligatorio, contraseñas de 12+
  caracteres, mensajes que no revelan si una cuenta existe, sin redirecciones abiertas. El login se
  hace desde el navegador para que el límite de intentos aplique a la IP real.
- **Inyección y XSS:** consultas parametrizadas, escape de React, sin HTML crudo, enlaces sociales
  solo `https` y colores validados.
- **Encabezados:** CSP con nonce por respuesta y `strict-dynamic`, HSTS, `nosniff`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Panel:** vive en una dirección secreta (`ADMIN_ACCESS_PATH`, solo servidor) y `/admin`
  responde 404. Cada acción del servidor valida con Zod y vuelve a exigir administrador con MFA
  antes de tocar datos; la base lo verifica otra vez con RLS.
- **Fotos:** el navegador sube el original a un bucket privado de cuarentena con nombre aleatorio.
  El servidor comprueba la firma real del archivo, que se pueda decodificar y sus dimensiones, y
  publica un WebP nuevo sin metadatos (GPS, EXIF). El original se borra siempre.
- **Errores:** los registros guardan solo códigos y el visitante ve un mensaje genérico.
- **Cadena de suministro:** acciones de CI fijadas por SHA, Dependabot y `npm audit`.

## Verificación

```bash
npx supabase test db   # 38 pruebas de RLS y permisos, con los roles reales
npm test               # reglas de rutas, validaciones
```

Ataques de punta a punta contra el entorno local (nunca contra producción). Definir `PUB` y `SEC`
con `PUBLISHABLE_KEY` y `SECRET_KEY` de `npx supabase status`, con la app en el puerto 3000:

```bash
node tests/e2e/security-attacks.mjs   # también requiere ADMIN_ACCESS_PATH
node tests/e2e/admin-panel.mjs
```

Cubre lectura y escritura directa a la API, escalada a administrador, enlace de recuperación robado,
usuario sin perfil de administrador, ocultamiento del panel, inyección y XSS en filtros y en nombres
de producto, archivos falsos y políglotas, eliminación de EXIF, encabezados y violaciones de CSP.

## Riesgos residuales

- **Cookies de sesión legibles por JavaScript:** el cliente de Supabase en el navegador las necesita.
  Un XSS podría robar la sesión; la CSP y el escape lo mitigan, no lo eliminan.
- **`style-src 'unsafe-inline'`:** permite inyectar estilos, no ejecutar código.
- **Vistas con permisos del dueño:** una columna sensible agregada por error quedaría pública.
- **Todas las páginas son dinámicas** por el nonce: más carga en cada visita, sin WAF ni límite de
  peticiones propio más allá del de la plataforma.
- **Sin auditoría externa:** las pruebas fueron escritas por quien escribió el código. Conviene una
  revisión independiente antes de manejar datos reales.

## Pendiente antes de producción

- Carga de imágenes con validación en servidor (Fase 4).
- Antispam y límite de envíos del formulario público (Fase 5).
- `robots.txt`, sitemap y revisión final de encabezados en el dominio real (Fases 7 y 8).
- SMTP propio para correos de recuperación.
- Backups de Supabase Pro y una prueba de restauración.
