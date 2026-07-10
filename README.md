# SJ Joyeros - V1.0

Tienda de joyería construida con React + Vite, con catálogo público, carrito, checkout y panel administrativo.

## Stack

- React 19
- React Router 6
- Vite 5
- Supabase JS
- Respaldo local (localStorage) cuando Supabase no está disponible

## Módulos principales

- Sitio público: catálogo, filtros, detalle de producto, carrito y checkout.
- Panel admin: login, productos, categorías y pedidos.
- Capa de datos: operaciones contra Supabase con fallback automático a almacenamiento local.

## Scripts

- `npm run dev`: entorno local.
- `npm run lint`: validación de código.
- `npm run build`: compilación de producción.
- `npm run preview`: previsualización local del build.

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Opcionales para acceso local de admin cuando Supabase Auth no esté disponible:

- `VITE_ADMIN_EMAIL`
- `VITE_ADMIN_PASSWORD`

Datos comerciales centralizados:

- `VITE_BUSINESS_NAME`
- `VITE_BUSINESS_TAGLINE`
- `VITE_WHATSAPP_NUMBER`
- `VITE_BUSINESS_EMAIL`
- `VITE_INSTAGRAM_URL`
- `VITE_FACEBOOK_URL`
- `VITE_TIKTOK_URL`
- `VITE_BUSINESS_ADDRESS`
- `VITE_BUSINESS_HOURS`

Estos datos se consumen desde `src/config/business.js`.

## Supabase (producción)

Para operar 100% en backend real, deben existir las tablas:

- `products`
- `categories`
- `orders`

Y configurar políticas RLS acordes al modelo de negocio del panel y checkout.

### Storage para imágenes de productos

El panel admin sube imágenes al bucket `productos` usando sesión autenticada de Supabase.

- Bucket esperado: `productos` (público).
- Las subidas usan RLS sobre `storage.objects`.
- Políticas recomendadas: `supabase/storage_policies.sql`.

Importante: si el admin inicia sesión solo con respaldo local (sin sesión real de Supabase), la subida a Storage será rechazada por RLS.

### Esquema y RLS para productos (v1.1)

Antes de publicar catálogo oficial, ejecuta:

- `supabase/schema_products_v11.sql`
- `supabase/storage_policies.sql`

Con esto el admin autenticado puede crear/editar/eliminar productos y subir imágenes al bucket `productos` con seguridad activa.

## Deploy en Netlify

El proyecto está preparado con `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Redirect SPA: `/* -> /index.html` (incluye rutas de `/admin/*`)

Recuerda cargar en Netlify las variables de entorno de Supabase antes de publicar.