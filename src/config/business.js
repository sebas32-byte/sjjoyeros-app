function sanitizePhone(value = '') {
  return value.toString().replace(/[^0-9]/g, '');
}

function sanitizeUrl(value = '') {
  return value.toString().trim();
}

export function isConfiguredExternalUrl(value = '') {
  const url = sanitizeUrl(value);
  return /^https?:\/\//i.test(url);
}

export const businessConfig = {
  name: import.meta.env.VITE_BUSINESS_NAME?.trim() || 'SJ Joyeros',
  tagline: import.meta.env.VITE_BUSINESS_TAGLINE?.trim() || 'Pulseras & accesorios',
  whatsappNumber: sanitizePhone(import.meta.env.VITE_WHATSAPP_NUMBER || '573001234567'),
  email: import.meta.env.VITE_BUSINESS_EMAIL?.trim() || 'contacto@sjjoyeros.com',
  instagramUrl: sanitizeUrl(import.meta.env.VITE_INSTAGRAM_URL || ''),
  facebookUrl: sanitizeUrl(import.meta.env.VITE_FACEBOOK_URL || ''),
  tiktokUrl: sanitizeUrl(import.meta.env.VITE_TIKTOK_URL || ''),
  address: import.meta.env.VITE_BUSINESS_ADDRESS?.trim() || '',
  hours: import.meta.env.VITE_BUSINESS_HOURS?.trim() || '',
};

function getBaseOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export function createGeneralWhatsAppUrl() {
  if (!businessConfig.whatsappNumber) return '#';
  const message = `Hola 👋, vi la página web de ${businessConfig.name} y me gustaría recibir información sobre sus joyas.`;
  return `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function createProductWhatsAppUrl(product = {}) {
  if (!businessConfig.whatsappNumber) return '#';
  const productName = product?.name || 'producto';
  const productLink = product?.id ? `${getBaseOrigin()}/product/${product.id}` : '';
  const baseMessage = `Hola 👋, estoy interesado en el producto "${productName}" que vi en la página web de ${businessConfig.name}. ¿Podrían brindarme más información?`;
  const message = productLink ? `${baseMessage} ${productLink}` : baseMessage;
  return `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
