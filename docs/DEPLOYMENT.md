# Despliegue

Flujo: GitHub → CI → Vercel. Cada rama genera una vista previa y `main` publica en producción.

## Bloqueos antes de abrir al público

- Autorización de venta de equipos móviles (AVETM de MinTIC) y datos legales del proveedor.
- Revisión jurídica de los documentos legales (Fase 6).
- Vercel Hobby prohíbe el uso comercial: se requiere Vercel Pro. Supabase Free no incluye backups y
  pausa el proyecto tras una semana sin actividad: se requiere Supabase Pro.

## 1. GitHub

1. Crear un repositorio **privado**.
2. En Settings → Code security, activar _Secret scanning_ y _Push protection_ si están disponibles.
3. En Settings → Branches, proteger `main` exigiendo que pase CI.

## 2. Supabase

1. Crear el proyecto y guardar la contraseña de la base de datos en un gestor de contraseñas.
2. En una terminal propia (nunca pegar credenciales en un chat):

   ```bash
   npx supabase login
   npx supabase link --project-ref <referencia-del-proyecto>
   npx supabase db push
   ```

   `db push` aplica las migraciones y no ejecuta los datos ficticios.

3. Configurar en el panel de Supabase, porque `config.toml` solo aplica en local:
   - **Authentication → Sign In / Providers:** desactivar _Allow new users to sign up_ y dejar
     **activado** el proveedor de correo (si se apaga, tampoco funciona el login).
   - **Authentication → Multi-Factor:** activar TOTP.
   - **Passwords:** mínimo 12 caracteres, con mayúsculas, minúsculas y números.
   - **URL Configuration:** _Site URL_ con el dominio real y, en _Redirect URLs_,
     `https://<dominio>/auth/callback`.
   - **SMTP:** configurar un proveedor propio para los correos de recuperación.

## 3. Crear el administrador

1. **Authentication → Users → Add user**, con una contraseña larga y única.
2. En el **SQL Editor**, con el correo de esa cuenta:

   ```sql
   insert into public.admin_profiles (auth_user_id)
   select id from auth.users where email = 'correo-del-administrador';
   ```

3. Entrar a `https://<dominio>/<ADMIN_ACCESS_PATH>/login` y configurar el autenticador. Sin este
   paso no hay acceso al panel.

## 4. Vercel

1. Importar el repositorio de GitHub.
2. Agregar estas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ADMIN_ACCESS_PATH`: dirección secreta del panel, 16 a 64 caracteres (letras, números, `-`,
     `_`). **Sin prefijo `NEXT_PUBLIC_`**: así nunca llega al navegador de los visitantes. Sin
     este valor el panel queda desactivado. Para generar uno en PowerShell:

     ```powershell
     $b = New-Object byte[] 12; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); "panel-" + (($b | ForEach-Object { $_.ToString("x2") }) -join "")
     ```

   **No agregar la clave `secret` ni la contraseña de la base de datos.**

   La dirección del panel no es una contraseña: oculta el panel de los robots que buscan `/admin`,
   pero la protección real son la contraseña, el segundo factor y las políticas RLS. Si se filtra,
   cámbiala en Vercel y vuelve a desplegar.

3. Las vistas previas usan esta misma base de datos si comparten variables. Mientras no exista un
   proyecto de pruebas, no usar datos personales reales.

## Verificación tras cada despliegue

- `https://securityheaders.com` sobre el dominio.
- `/admin` responde 404 y `/<ADMIN_ACCESS_PATH>` sin sesión redirige a su `/login`.
- La consulta directa a la tabla `inquiries` con la clave pública devuelve 401.
