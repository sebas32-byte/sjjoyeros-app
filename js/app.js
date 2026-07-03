const currencyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
import { getProducts, getFeaturedProducts, getBestSellerProducts, subscribeToProducts } from '../services/products.js';
const storageKeys = { cart: 'sjjoyeros-cart', favorites: 'sjjoyeros-favorites' };

const baseProducts = [
  { id: '1', family: 'ORO', subcategory: 'ANILLOS', name: 'Anillo Aurora Imperial', category: 'Anillos', price: 690000, material: 'Oro 18K', guarantee: '2 años', stock: 4, featured: true, sales_count: 48, accent: 'Icónico', collection: 'Iconic Line', gradient: 'linear-gradient(135deg, #3b2e14 0%, #111111 55%, #8d6e25 100%)', description: 'Anillo de silueta impecable con brillo equilibrado y presencia elegante.', features: ['Acabado pulido', 'Ajuste cómodo', 'Uso diario o gala'] },
  { id: '2', family: 'ORO LAMINADO', subcategory: 'PULSERAS', name: 'Pulsera Lienzo Dorado', category: 'Pulseras', price: 540000, material: 'Oro laminado 18K', guarantee: '1 año', stock: 7, featured: true, sales_count: 43, accent: 'Bestseller', collection: 'Maison Glow', gradient: 'linear-gradient(135deg, #2b2517 0%, #121212 55%, #c2a24d 100%)', description: 'Pulsera refinada con ritmo visual sobrio y acabado luminoso.', features: ['Detalle fino', 'Ligera al tacto', 'Cierre seguro'] },
  { id: '3', family: 'ORO', subcategory: 'CADENAS', name: 'Cadena Eclipse Royale', category: 'Cadenas', price: 780000, material: 'Oro 18K', guarantee: '2 años', stock: 5, featured: true, sales_count: 55, accent: 'Top ventas', collection: 'Signature', gradient: 'linear-gradient(135deg, #191919 0%, #090909 50%, #7b662d 100%)', description: 'Cadena protagonista para elevar el cuello y la presencia general.', features: ['Brillo intenso', 'Caída firme', 'Estilo premium'] },
  { id: '4', family: 'PLATA', subcategory: 'ARETES', name: 'Aretes Perla Noche', category: 'Aretes', price: 620000, material: 'Plata 925', guarantee: '2 años', stock: 6, featured: true, sales_count: 36, accent: 'Elegante', collection: 'Pearl Studio', gradient: 'linear-gradient(135deg, #1d1d24 0%, #0b0b0f 50%, #9b9b9b 100%)', description: 'Aretes refinados con lectura limpia y sofisticación atemporal.', features: ['Acabado brillante', 'Versátiles', 'Detalle de gala'] },
  { id: '5', family: 'RELOJERÍA', subcategory: 'HOMBRE', name: 'Reloj Atlas Prestige', category: 'Relojería', price: 1890000, material: 'Acero y zafiro', guarantee: '5 años', stock: 2, featured: true, sales_count: 18, accent: 'Edición limitada', collection: 'Horology', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 56%, #6b5a28 100%)', description: 'Relojería con lenguaje sobrio para marcar estatus con precisión.', features: ['Cristal premium', 'Caja robusta', 'Estética de legado'] },
  { id: '6', family: 'ORO LAMINADO', subcategory: 'DIJES', name: 'Dije Brisa Dorada', category: 'Dijes', price: 310000, material: 'Oro laminado', guarantee: '1 año', stock: 9, featured: false, sales_count: 24, accent: 'Ligero', collection: 'Everyday', gradient: 'linear-gradient(135deg, #2b2017 0%, #111111 50%, #8c6a30 100%)', description: 'Dije delicado para sumar brillo a cadenas, capas y regalos personales.', features: ['Uso diario', 'Versátil', 'Combina fácil'] },
  { id: '7', family: 'PLATA', subcategory: 'TOBILLERAS', name: 'Tobillera Mareas', category: 'Tobilleras', price: 280000, material: 'Plata 925', guarantee: '1 año', stock: 12, featured: false, sales_count: 31, accent: 'Verano', collection: 'Coastal', gradient: 'linear-gradient(135deg, #1a2430 0%, #0a0a0a 56%, #88a7c7 100%)', description: 'Tobillera fresca y ligera con lectura moderna y femenina.', features: ['Ajuste cómodo', 'Ligera', 'Detalle sutil'] },
  { id: '8', family: 'ORO LAMINADO', subcategory: 'SETS', name: 'Set Gala Essential', category: 'Sets', price: 1190000, material: 'Oro laminado', guarantee: '2 años', stock: 3, featured: true, sales_count: 22, accent: 'Bundle', collection: 'Occasion', gradient: 'linear-gradient(135deg, #3a2a18 0%, #111111 50%, #d1b159 100%)', description: 'Set coordinado con piezas compatibles para una compra más completa.', features: ['Look completo', 'Regalo ideal', 'Ahorro por conjunto'] },
  { id: '9', family: 'RODIO', subcategory: 'ANILLOS', name: 'Anillo Nudo Royale', category: 'Rodio', price: 830000, material: 'Rodio premium', guarantee: '2 años', stock: 3, featured: false, sales_count: 29, accent: 'Bajo stock', collection: 'Iconic Line', gradient: 'linear-gradient(135deg, #202026 0%, #0a0a0a 56%, #a7a7b1 100%)', description: 'Diseño con carácter escultórico y terminado contemporáneo.', features: ['Silhouette moderna', 'Acabado suave', 'Statement piece'] },
  { id: '10', family: 'ORO', subcategory: 'TEJIDOS', name: 'Cadena Tejido Solar', category: 'Tejidos', price: 920000, material: 'Oro 18K', guarantee: '2 años', stock: 4, featured: true, sales_count: 41, accent: 'Tejido', collection: 'Woven Gold', gradient: 'linear-gradient(135deg, #3b2c12 0%, #111111 52%, #a78832 100%)', description: 'Cadena tejida con textura elegante y lectura de lujo más artesanal.', features: ['Textura fina', 'Brillo controlado', 'Pieza protagonista'] },
  { id: '11', family: 'RODIO', subcategory: 'CADENAS', name: 'Cadena Rodio Vértice', category: 'Rodio', price: 610000, material: 'Rodio premium', guarantee: '1 año', stock: 8, featured: false, sales_count: 27, accent: 'Moderna', collection: 'Edge', gradient: 'linear-gradient(135deg, #16181f 0%, #0a0a0a 56%, #8d99b0 100%)', description: 'Cadena sobria con brillo frío y una presencia contemporánea.', features: ['Línea limpia', 'Acabado frío', 'Uso diario'] },
  { id: '12', family: 'RODIO', subcategory: 'ARETES', name: 'Aretes Rodio Aura', category: 'Rodio', price: 470000, material: 'Rodio premium', guarantee: '1 año', stock: 10, featured: false, sales_count: 21, accent: 'Ligero', collection: 'Aurora', gradient: 'linear-gradient(135deg, #1c1f26 0%, #0a0a0a 56%, #9ca7bb 100%)', description: 'Aretes discretos con brillo pulido para un look elegante y versátil.', features: ['Sutiles', 'Elegancia fría', 'Ligereza'] }
];

const defaultConfig = { hero_title: 'Joyas premium que se entienden en segundos.', hero_subtitle: 'Descubre Oro, Oro Laminado, Plata, Relojería y Rodio con navegación rápida y asesoría privada por WhatsApp.', cta_title: 'Tu estilo merece una pieza que hable por ti.', whatsapp_number: '+573001234567' };

let allProducts = [...baseProducts];
let cart = [];
let favorites = [];
let activeProduct = null;
let config = { ...defaultConfig };
const state = { query: '', family: 'all', subcategory: 'all', sort: 'featured', view: 'grid' };

const familyCatalog = {
  all: { label: 'Todos', subcategories: [] },
  ORO: { label: 'Oro', subcategories: ['ANILLOS', 'CADENAS', 'PULSERAS', 'DIJES', 'ARETES', 'TOBILLERAS', 'TEJIDOS'] },
  'ORO LAMINADO': { label: 'Oro Laminado', subcategories: ['ANILLOS', 'CADENAS', 'PULSERAS', 'DIJES', 'ARETES', 'TOBILLERAS'] },
  PLATA: { label: 'Plata', subcategories: ['ANILLOS', 'CADENAS', 'PULSERAS', 'DIJES', 'ARETES'] },
  'RELOJERÍA': { label: 'Relojería', subcategories: ['HOMBRE', 'MUJER', 'CLÁSICOS', 'DEPORTIVOS'] },
  RODIO: { label: 'Rodio', subcategories: ['ANILLOS', 'CADENAS', 'PULSERAS', 'ARETES'] }
};

const els = {
  heroTitle: document.getElementById('hero-title'),
  heroSubtitle: document.getElementById('hero-subtitle'),
  ctaTitle: document.getElementById('cta-title'),
  shopGrid: document.getElementById('shop-grid'),
  topSellers: document.getElementById('top-sellers'),
  favoritesGrid: document.getElementById('favorites-grid'),
  noFavorites: document.getElementById('no-favorites'),
  productCount: document.getElementById('product-count'),
  productCountHero: document.getElementById('product-count-hero'),
  cartItems: document.getElementById('cart-items'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartTotal: document.getElementById('cart-total'),
  cartCountNav: document.getElementById('cart-count-nav'),
  cartCountMobile: document.getElementById('cart-count-mobile'),
  mobileMenu: document.getElementById('mobile-menu'),
  productModal: document.getElementById('product-modal'),
  productModalBody: document.getElementById('product-modal-body')
};

function normalizeText(value = '') { return value.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function formatCurrency(value) { return currencyFormatter.format(value); }
function getWhatsappNumber() { return (config.whatsapp_number || defaultConfig.whatsapp_number).replace(/[^0-9]/g, ''); }
function buildWhatsAppUrl(message) { return `https://wa.me/${getWhatsappNumber()}?text=${encodeURIComponent(message)}`; }

function syncWhatsAppLinks() {
  const message = 'Hola, vi el catálogo de SJJOYEROS y quiero recibir asesoría personalizada.';
  const url = buildWhatsAppUrl(message);
  ['nav-whatsapp', 'mobile-whatsapp', 'hero-whatsapp', 'cta-whatsapp', 'floating-whatsapp', 'footer-whatsapp'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = url;
  });
}

function loadLocalState() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(storageKeys.cart) || '[]');
    const savedFavorites = JSON.parse(localStorage.getItem(storageKeys.favorites) || '[]');
    if (Array.isArray(savedCart)) cart = savedCart;
    if (Array.isArray(savedFavorites)) favorites = savedFavorites;
  } catch {
    cart = [];
    favorites = [];
  }
}

function persistLocalState() {
  localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
}

function normalizeProduct(product, index = 0) {
  if (!product) return null;
  return {
    id: String(product.id ?? index + 1),
    name: product.name || 'Joya SJJOYEROS',
    category: product.category || 'COLECCIÓN',
    price: Number(product.price || 0),
    material: product.material || 'Material premium',
    guarantee: product.guarantee || '1 año',
    stock: Number(product.stock || 0),
    featured: Boolean(product.featured ?? product.is_featured),
    sales_count: Number(product.sales_count || 0),
    accent: product.accent || 'Selección',
    collection: product.collection || 'Signature',
    gradient: product.gradient || 'linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 56%, #6c5a24 100%)',
    description: product.description || 'Pieza premium con acabado refinado.',
    features: Array.isArray(product.features) && product.features.length ? product.features : ['Acabado fino', 'Uso versátil', 'Presentación premium']
  };
}

function renderFeaturedProducts() {
  const featured = [...allProducts].filter((product) => product.featured).sort((a, b) => b.sales_count - a.sales_count).slice(0, 6);
  if (!els.topSellers) return;
  els.topSellers.innerHTML = featured.map((product) => renderProductCard(product, 'grid')).join('');
  if (window.lucide) lucide.createIcons();
}

function renderCatalogHighlights() {
  const target = document.getElementById('catalog-highlights');
  if (!target) return;
  const familyKeys = Object.keys(familyCatalog).filter((key) => key !== 'all');
  target.innerHTML = familyKeys.map((familyKey) => {
    const family = familyCatalog[familyKey];
    const familyCount = allProducts.filter((product) => product.family === familyKey).length;
    return `
      <button class="rounded-[1.4rem] border border-white/5 bg-black/20 p-4 text-left transition hover:border-gold/30 hover:bg-black/30" data-action="filter-family" data-family="${familyKey}">
        <p class="text-xs uppercase tracking-[0.25em] text-white/45">Familia</p>
        <h3 class="mt-2 text-lg font-semibold text-white">${family.label}</h3>
        <p class="mt-2 text-sm text-white/55">${familyCount} productos seleccionados</p>
      </button>
    `;
  }).join('');
}

function getFilteredProducts() {
  let products = [...allProducts];
  if (state.family !== 'all') products = products.filter((product) => product.family === state.family);
  if (state.subcategory !== 'all') products = products.filter((product) => product.subcategory === state.subcategory);
  if (state.query) {
    const query = normalizeText(state.query);
    products = products.filter((product) => normalizeText([product.name, product.category, product.material, product.description, product.collection].join(' ')).includes(query));
  }

  switch (state.sort) {
    case 'sales':
      products.sort((a, b) => b.sales_count - a.sales_count);
      break;
    case 'newest':
      products = [...products].reverse();
      break;
    case 'price-low':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'featured':
    default:
      products.sort((a, b) => Number(b.featured) - Number(a.featured) || b.sales_count - a.sales_count);
      break;
  }

  return products;
}

function renderProductCard(product, mode = 'grid') {
  const isFavorite = favorites.includes(product.id);
  const stockLabel = product.stock <= 3 ? 'Últimas unidades' : 'Disponible';
  const productClass = mode === 'list' ? 'premium-card product-card rounded-[1.6rem] overflow-hidden lg:flex lg:items-stretch' : 'premium-card product-card rounded-[1.6rem] overflow-hidden';
  const visualClass = mode === 'list' ? 'product-art lg:w-[18rem] lg:min-h-full' : 'product-art';

  return `
    <article class="${productClass}" data-product-id="${product.id}">
      <div class="${visualClass}" style="background-image:${product.gradient};" data-label="${product.name}">
        <span class="product-badge">${product.accent}</span>
        <button class="icon-button product-bookmark" data-action="toggle-favorite" data-product-id="${product.id}" aria-label="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
          <i data-lucide="heart" style="width:16px;height:16px;${isFavorite ? 'fill:currentColor;' : ''}"></i>
        </button>
      </div>
      <div class="product-body ${mode === 'list' ? 'flex-1' : ''}">
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="product-stock">${stockLabel}</span>
        </div>
        <h3 class="product-title line-clamp-2">${product.name}</h3>
        <p class="product-copy line-clamp-2">${product.description}</p>
        <div class="product-specs">
          <span class="detail-pill"><i data-lucide="sparkles" style="width:14px;height:14px"></i>${product.material}</span>
          <span class="detail-pill"><i data-lucide="shield-check" style="width:14px;height:14px"></i>Garantía ${product.guarantee}</span>
        </div>
        <div class="mt-4 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-white/45">Precio</p>
            <p class="mt-1 text-2xl font-bold text-gold">${formatCurrency(product.price)}</p>
          </div>
        </div>
        <div class="product-actions">
          <button class="secondary-button flex-1 py-3 text-sm" data-action="view-product" data-product-id="${product.id}">Ver ficha</button>
          <button class="primary-button flex-1 py-3 text-sm" data-action="add-to-cart" data-product-id="${product.id}">Comprar</button>
        </div>
      </div>
    </article>
  `;
}

function renderCatalog() {
  // Si no hay productos cargados globalmente, mostrar mensaje elegante
  if (!allProducts || allProducts.length === 0) {
    if (!els.shopGrid) return;
    els.shopGrid.className = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';
    els.shopGrid.innerHTML = `<div class="premium-card rounded-[2rem] px-6 py-14 text-center sm:px-10"><p class="text-lg font-semibold text-white">Por ahora no hay productos en el catálogo</p><p class="mt-2 text-sm text-white/55">Estamos preparando nuestras piezas. Vuelve en unos minutos o contacta por WhatsApp para asistencia personalizada.</p></div>`;
    if (els.productCount) els.productCount.textContent = `Mostrando 0 productos`;
    return;
  }

  const products = getFilteredProducts();
  const mode = state.view;
  if (!els.shopGrid) return;
  els.shopGrid.className = mode === 'grid' ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-5';
  els.shopGrid.innerHTML = products.length ? products.map((product) => renderProductCard(product, mode)).join('') : `<div class="premium-card rounded-[2rem] px-6 py-14 text-center sm:px-10"><p class="text-lg font-semibold text-white">No encontramos coincidencias</p><p class="mt-2 text-sm text-white/55">Prueba otro término de búsqueda o cambia la categoría.</p></div>`;
  if (els.productCount) els.productCount.textContent = `Mostrando ${products.length} productos`;
  syncViewButtons();
  if (window.lucide) lucide.createIcons();
}

function renderFavorites() {
  if (!els.favoritesGrid || !els.noFavorites) return;
  const products = allProducts.filter((product) => favorites.includes(product.id));
  els.favoritesGrid.innerHTML = products.length ? products.map((product) => renderProductCard(product, 'grid')).join('') : '';
  els.noFavorites.classList.toggle('hidden', products.length > 0);
  if (window.lucide) lucide.createIcons();
}

function renderCart() {
  if (!els.cartItems) return;
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  [els.cartCountNav, els.cartCountMobile].forEach((countEl) => {
    if (!countEl) return;
    countEl.textContent = String(count);
    countEl.classList.toggle('hidden', count === 0);
  });

  if (els.cartSubtotal) els.cartSubtotal.textContent = formatCurrency(subtotal);
  if (els.cartTotal) els.cartTotal.textContent = formatCurrency(subtotal);

  if (!cart.length) {
    els.cartItems.innerHTML = '<p class="rounded-[1.3rem] border border-white/5 bg-black/20 px-5 py-8 text-center text-sm text-white/60">Tu carrito está vacío. Agrega una pieza para continuar.</p>';
    return;
  }

  els.cartItems.innerHTML = cart.map((item) => `
    <article class="rounded-[1.3rem] border border-white/5 bg-black/20 p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-white">${item.name}</p>
          <p class="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">${item.category}</p>
        </div>
        <button class="text-white/45 transition hover:text-gold" data-action="remove-cart" data-product-id="${item.id}" aria-label="Eliminar producto">
          <i data-lucide="trash-2" style="width:16px;height:16px"></i>
        </button>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <p class="text-gold font-semibold">${formatCurrency(item.price)}</p>
        <div class="flex items-center gap-2">
          <button class="icon-button !px-3 !py-2" data-action="update-qty" data-product-id="${item.id}" data-delta="-1">−</button>
          <span class="min-w-8 text-center text-sm text-white">${item.quantity}</span>
          <button class="icon-button !px-3 !py-2" data-action="update-qty" data-product-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
    </article>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function updateCounters() {
  if (els.productCountHero) els.productCountHero.textContent = `+${allProducts.length}`;
}

function syncViewButtons() {
  const gridBtn = document.getElementById('view-grid');
  const listBtn = document.getElementById('view-list');
  if (!gridBtn || !listBtn) return;
  const gridActive = state.view === 'grid';
  gridBtn.classList.toggle('active', gridActive);
  listBtn.classList.toggle('active', !gridActive);
}

function syncFilterButtons() {
  document.querySelectorAll('.shop-filter').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === state.family || (button.dataset.filter === 'all' && state.family === 'all'));
  });
}

function renderSubcategoryNav() {
  const nav = document.getElementById('subcategory-nav');
  if (!nav) return;
  const currentFamily = familyCatalog[state.family] || familyCatalog.all;
  if (!currentFamily.subcategories.length) {
    nav.innerHTML = '<div class="rounded-full border border-white/5 bg-black/20 px-4 py-3 text-sm text-white/55">Selecciona una familia para ver sus subcategorías.</div>';
    return;
  }
  const chips = currentFamily.subcategories;
  nav.innerHTML = ['all', ...chips].map((item) => {
    const label = item === 'all' ? 'Todas' : item;
    const isActive = state.subcategory === item || (item === 'all' && state.subcategory === 'all');
    return `<button class="control-chip ${isActive ? 'active' : ''}" data-action="subcategory-filter" data-subcategory="${item}">${label}</button>`;
  }).join('');
}

function updateSections(section) {
  ['home', 'shop', 'favorites'].forEach((name) => {
    const element = document.getElementById(`${name}-section`);
    if (element) element.classList.toggle('hidden', name !== section);
  });
}

function showSection(section) {
  const normalized = section === 'faq' ? 'home' : section;
  updateSections(normalized);
  document.getElementById('mobile-menu')?.classList.add('hidden');
  if (normalized === 'shop') renderCatalog();
  if (normalized === 'favorites') renderFavorites();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (section === 'faq') {
    setTimeout(() => {
      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed right-4 top-24 z-[80] rounded-full border border-gold/25 bg-gold px-5 py-3 text-sm font-semibold text-deep-black shadow-glow';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

function findProduct(productId) {
  return allProducts.find((product) => product.id === String(productId));
}

function addToCart(productId) {
  const product = findProduct(productId);
  if (!product) return;
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  persistLocalState();
  renderCart();
  showToast(`${product.name} agregado al carrito`);
}

function removeCart(productId) {
  cart = cart.filter((item) => item.id !== String(productId));
  persistLocalState();
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find((entry) => entry.id === String(productId));
  if (!item) return;
  item.quantity += Number(delta);
  if (item.quantity <= 0) {
    removeCart(productId);
    return;
  }
  persistLocalState();
  renderCart();
}

function toggleFavorite(productId) {
  const id = String(productId);
  const index = favorites.indexOf(id);
  if (index >= 0) {
    favorites.splice(index, 1);
    showToast('Retirado de favoritos');
  } else {
    favorites.push(id);
    showToast('Añadido a favoritos');
  }
  persistLocalState();
  renderFavorites();
  renderCatalog();
  renderFeaturedProducts();
  if (activeProduct && activeProduct.id === id) openProduct(id);
}

function renderProductModal(product) {
  const favorite = favorites.includes(product.id);
  const stockLabel = product.stock <= 3 ? 'Disponibilidad limitada' : 'Stock disponible';
  const whatsappMessage = `Hola, quiero información sobre ${product.name} de SJJOYEROS.`;
  return `
    <div class="product-visual lg:border-r lg:border-white/5"><div class="visual-core shadow-glow" style="background-image:${product.gradient};" data-label="${product.name}"></div></div>
    <div class="space-y-6 p-6 sm:p-8">
      <div class="flex flex-wrap items-center gap-2"><span class="detail-pill">${product.collection}</span><span class="detail-pill">${product.category}</span><span class="detail-pill">${stockLabel}</span></div>
      <div><h4 class="section-title text-4xl text-white">${product.name}</h4><p class="mt-3 text-sm uppercase tracking-[0.22em] text-white/45">${product.material}</p><p class="mt-4 text-sm leading-7 text-white/65">${product.description}</p></div>
      <div class="grid gap-3 sm:grid-cols-2"><div class="rounded-[1.2rem] border border-white/5 bg-black/20 p-4"><p class="text-xs uppercase tracking-[0.2em] text-white/40">Precio</p><p class="mt-2 text-2xl font-bold text-gold">${formatCurrency(product.price)}</p></div><div class="rounded-[1.2rem] border border-white/5 bg-black/20 p-4"><p class="text-xs uppercase tracking-[0.2em] text-white/40">Garantía</p><p class="mt-2 text-2xl font-bold text-white">${product.guarantee}</p></div></div>
      <div class="grid gap-3 sm:grid-cols-3">${product.features.map((feature) => `<span class="detail-pill justify-center">${feature}</span>`).join('')}</div>
      <div class="rounded-[1.4rem] border border-gold/15 bg-gold/8 p-4"><p class="text-sm font-semibold text-white">Por qué destaca</p><p class="mt-2 text-sm leading-7 text-white/65">Pieza curada para reforzar percepción de lujo, generar confianza y convertir con un solo toque en WhatsApp.</p></div>
      <div class="space-y-3"><button class="primary-button w-full justify-center py-3" data-action="add-to-cart" data-product-id="${product.id}">Agregar al carrito</button><a class="secondary-button w-full justify-center py-3" href="${buildWhatsAppUrl(whatsappMessage)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a><button class="secondary-button w-full justify-center py-3" data-action="toggle-favorite" data-product-id="${product.id}">${favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button></div>
    </div>`;
}

function openProduct(productId) {
  const product = findProduct(productId);
  if (!product) return;
  activeProduct = product;
  if (els.productModalBody) els.productModalBody.innerHTML = renderProductModal(product);
  els.productModal?.classList.remove('hidden');
  els.productModal?.classList.add('flex');
  document.body.classList.add('modal-open');
  if (window.lucide) lucide.createIcons();
}

function closeProductModal() {
  els.productModal?.classList.add('hidden');
  els.productModal?.classList.remove('flex');
  document.body.classList.remove('modal-open');
  activeProduct = null;
}

function initSDK() {
  if (!window.elementSdk?.init) return;
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (configUpdate) => {
      config = { ...defaultConfig, ...configUpdate };
      if (els.heroTitle) els.heroTitle.textContent = config.hero_title || defaultConfig.hero_title;
      if (els.heroSubtitle) els.heroSubtitle.textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
      if (els.ctaTitle) els.ctaTitle.textContent = config.cta_title || defaultConfig.cta_title;
      syncWhatsAppLinks();
    },
    mapToCapabilities: () => ({ recolorables: [], borderables: [], fontEditable: undefined, fontSizeable: undefined }),
    mapToEditPanelValues: (configUpdate) => new Map([
      ['hero_title', configUpdate.hero_title || defaultConfig.hero_title],
      ['hero_subtitle', configUpdate.hero_subtitle || defaultConfig.hero_subtitle],
      ['cta_title', configUpdate.cta_title || defaultConfig.cta_title],
      ['whatsapp_number', configUpdate.whatsapp_number || defaultConfig.whatsapp_number]
    ])
  });
}

async function initData() {
  // Intentar primero cargar desde Supabase (si está configurado)
  showLoadingState();
  try {
    const rows = await getProducts();
    if (Array.isArray(rows)) {
      allProducts = rows.map(normalizeProduct).filter(Boolean);
    }
    // Suscribirse a cambios en la tabla para reflejar inserciones/actualizaciones
    try {
      subscribeToProducts(async () => {
        try {
          const fresh = await getProducts();
          allProducts = fresh.map(normalizeProduct).filter(Boolean);
          refreshApp();
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {
      // ignore subscription errors
    }
  } catch (e) {
    // silenciar y continuar con dataSdk o datos locales
    // console.warn('Supabase unavailable', e);
    if (!window.dataSdk?.init) {
      allProducts = [...baseProducts];
      return;
    }

    const handler = {
      onDataChanged(data) {
        if (Array.isArray(data) && data.length) allProducts = data.map(normalizeProduct).filter(Boolean);
        else allProducts = [...baseProducts];
        refreshApp();
      }
    };

    try {
      const result = await window.dataSdk.init(handler);
      if (result?.isOk === false) allProducts = [...baseProducts];
    } catch {
      allProducts = [...baseProducts];
    }
  }
}

function refreshApp() {
  loadLocalState();
  config = { ...defaultConfig, ...config };
  if (els.heroTitle) els.heroTitle.textContent = config.hero_title;
  if (els.heroSubtitle) els.heroSubtitle.textContent = config.hero_subtitle;
  if (els.ctaTitle) els.ctaTitle.textContent = config.cta_title;
  syncWhatsAppLinks();
  renderFeaturedProducts();
  renderCatalogHighlights();
  renderCatalog();
  renderFavorites();
  renderCart();
  updateCounters();
  syncFilterButtons();
  renderSubcategoryNav();
  syncViewButtons();
  if (window.lucide) lucide.createIcons();
}

function showLoadingState() {
  if (!els.shopGrid) return;
  els.shopGrid.className = '';
  els.shopGrid.innerHTML = `<div class="premium-card rounded-[2rem] px-6 py-14 text-center sm:px-10"><p class="text-lg font-semibold text-white">Cargando catálogo…</p><p class="mt-2 text-sm text-white/55">Obteniendo productos desde Supabase.</p></div>`;
}

function bindEvents() {
  document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => showSection(button.dataset.section)));
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => els.mobileMenu?.classList.toggle('hidden'));
  document.getElementById('logo-home')?.addEventListener('click', () => showSection('home'));
  document.getElementById('hero-shop')?.addEventListener('click', () => showSection('shop'));
  document.getElementById('cta-shop')?.addEventListener('click', () => showSection('shop'));
  document.getElementById('shop-start-btn')?.addEventListener('click', () => showSection('shop'));
  document.getElementById('shop-start-btn-mobile')?.addEventListener('click', () => showSection('home'));
  document.getElementById('cart-btn-nav')?.addEventListener('click', () => { document.getElementById('cart-sidebar')?.classList.remove('hidden'); document.getElementById('cart-sidebar')?.classList.add('flex'); });
  document.getElementById('cart-btn-mobile')?.addEventListener('click', () => { document.getElementById('cart-sidebar')?.classList.remove('hidden'); document.getElementById('cart-sidebar')?.classList.add('flex'); });
  document.getElementById('close-cart')?.addEventListener('click', () => { document.getElementById('cart-sidebar')?.classList.add('hidden'); document.getElementById('cart-sidebar')?.classList.remove('flex'); });
  document.getElementById('continue-shopping')?.addEventListener('click', () => { document.getElementById('cart-sidebar')?.classList.add('hidden'); document.getElementById('cart-sidebar')?.classList.remove('flex'); showSection('shop'); });
  document.getElementById('close-product-modal')?.addEventListener('click', closeProductModal);
  document.getElementById('product-modal')?.addEventListener('click', (event) => { if (event.target && event.target.id === 'product-modal') closeProductModal(); });
  document.getElementById('shop-search')?.addEventListener('input', (event) => { state.query = event.target.value; renderCatalog(); });
  document.getElementById('sort-by')?.addEventListener('change', (event) => { state.sort = event.target.value; renderCatalog(); });
  document.getElementById('view-grid')?.addEventListener('click', () => { state.view = 'grid'; renderCatalog(); });
  document.getElementById('view-list')?.addEventListener('click', () => { state.view = 'list'; renderCatalog(); });
  document.querySelectorAll('.faq-toggle').forEach((button) => button.addEventListener('click', () => { const content = button.nextElementSibling; const icon = button.querySelector('[data-lucide]'); content?.classList.toggle('open'); if (icon) icon.style.transform = content?.classList.contains('open') ? 'rotate(180deg)' : ''; }));
  document.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;
    const { action, productId, category, delta, family, subcategory } = actionElement.dataset;
    switch (action) {
      case 'add-to-cart':
        addToCart(productId);
        break;
      case 'remove-cart':
        removeCart(productId);
        break;
      case 'update-qty':
        updateQty(productId, delta);
        break;
      case 'toggle-favorite':
        toggleFavorite(productId);
        break;
      case 'view-product':
        openProduct(productId);
        break;
      case 'filter-family':
        state.family = family || 'all';
        state.subcategory = 'all';
        syncFilterButtons();
        renderSubcategoryNav();
        showSection('shop');
        renderCatalog();
        break;
      case 'subcategory-filter':
        state.subcategory = subcategory || 'all';
        renderSubcategoryNav();
        renderCatalog();
        break;
      default:
        break;
    }
  });
  document.querySelectorAll('.shop-filter').forEach((button) => button.addEventListener('click', () => {
    state.family = button.dataset.filter || 'all';
    state.subcategory = 'all';
    syncFilterButtons();
    renderSubcategoryNav();
    renderCatalog();
  }));
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((button) => button.addEventListener('click', () => showSection(button.dataset.section)));
  document.getElementById('whatsapp-order-btn')?.addEventListener('click', () => {
    if (!cart.length) return;
    const items = cart.map((item) => `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = `Hola, quiero hacer un pedido en SJJOYEROS:\n\n${items}\n\nTotal: ${formatCurrency(total)}`;
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeProductModal();
      document.getElementById('cart-sidebar')?.classList.add('hidden');
      document.getElementById('cart-sidebar')?.classList.remove('flex');
    }
  });
}

loadLocalState();
bindEvents();
initSDK();
initData().then(() => refreshApp());