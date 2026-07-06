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

## Supabase (producción)

Para operar 100% en backend real, deben existir las tablas:

- `products`
- `categories`
- `orders`

Y configurar políticas RLS acordes al modelo de negocio del panel y checkout.

## Deploy en Netlify

El proyecto está preparado con `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Redirect SPA: `/* -> /index.html` (incluye rutas de `/admin/*`)

Recuerda cargar en Netlify las variables de entorno de Supabase antes de publicar.