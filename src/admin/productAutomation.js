const CATEGORY_PREFIX_MAP = {
  pulseras: 'PUL',
  cadenas: 'CAD',
  anillos: 'ANI',
  dijes: 'DIJ',
  sets: 'SET',
  set: 'SET',
  relojes: 'REL',
};

export const PRODUCT_STATUS_OPTIONS = ['Disponible', 'Agotado', 'Próximamente'];

export const BALIN_OPTIONS = ['#3', '#4', '#5', '#6', '#8'];

export const COLLECTION_OPTIONS = ['ORO', 'ORO LAMINADO', 'RELOJERÍA'];

export const DEFAULT_PRODUCT_TYPES = ['Pulseras', 'Cadenas', 'Anillos', 'Dijes', 'Sets', 'Relojes'];

export const DESCRIPTION_TEMPLATES = {
  pulsera_tejida: {
    label: 'Pulsera tejida',
    variants: [
      '{name} elaborada artesanalmente con acabado premium y diseño tejido de alta presencia, ideal para uso diario.',
      'Diseño tejido con materiales resistentes y terminación elegante. {name} combina estilo, comodidad y durabilidad.',
      '{name} con estructura tejida y estética refinada, pensada para elevar cualquier look con un toque distintivo.',
    ],
  },
  pulsera_san_benito: {
    label: 'Pulsera San Benito',
    variants: [
      'Pulsera tejida con diseño San Benito elaborada con materiales de alta calidad, ideal para quienes buscan elegancia y significado.',
      'Diseñada cuidadosamente para brindar estilo y comodidad, esta pulsera San Benito combina acabados premium con un diseño artesanal.',
      'Pulsera artesanal con San Benito elaborada con materiales resistentes y un acabado elegante para el uso diario.',
    ],
  },
  pulsera_proteccion: {
    label: 'Pulsera Protección',
    variants: [
      '{name} destaca por su diseño simbólico y elegante, creada para acompañarte con estilo en cualquier ocasión.',
      'Pulsera de protección con terminaciones finas y presencia moderna, ideal para quienes valoran piezas con intención.',
      'Diseño de protección con estética premium y materiales confiables, pensado para uso diario con gran comodidad.',
    ],
  },
  pulsera_minimalista: {
    label: 'Pulsera Minimalista',
    variants: [
      '{name} presenta una línea limpia y sofisticada, perfecta para quienes prefieren una elegancia sutil.',
      'Diseño minimalista con acabado premium que aporta equilibrio visual y versatilidad en todo momento.',
      'Pulsera de estética depurada y moderna, elaborada para ofrecer presencia discreta y gran estilo.',
    ],
  },
  cadena: {
    label: 'Cadena',
    variants: [
      '{name} combina estructura sólida, brillo elegante y acabados de alta calidad para una presencia impecable.',
      'Cadena diseñada con proporciones equilibradas y acabado premium, ideal para destacar con sobriedad y estilo.',
      'Pieza versátil y sofisticada, fabricada con materiales resistentes para acompañar looks diarios o especiales.',
    ],
  },
  dije: {
    label: 'Dije',
    variants: [
      '{name} ofrece un diseño cuidadosamente detallado con un acabado elegante que realza cualquier combinación.',
      'Dije con estética refinada y presencia sutil, ideal para aportar carácter y distinción al conjunto.',
      'Pieza de diseño premium con excelente terminación, pensada para complementar cadenas con estilo atemporal.',
    ],
  },
  anillo: {
    label: 'Anillo',
    variants: [
      '{name} destaca por su silueta sofisticada y acabado premium, perfecto para ocasiones especiales o uso diario.',
      'Anillo de diseño elegante y presencia equilibrada, elaborado para quienes buscan distinción en cada detalle.',
      'Pieza refinada con terminaciones de alta calidad que combina estilo moderno con carácter atemporal.',
    ],
  },
  set: {
    label: 'Set',
    variants: [
      '{name} integra piezas complementarias con una estética coherente y acabados premium para una presentación completa.',
      'Set cuidadosamente compuesto para lograr armonía visual, comodidad y una presencia elegante en cualquier ocasión.',
      'Combinación de piezas con diseño sofisticado y excelente terminación, ideal para un look completo y distinguido.',
    ],
  },
  reloj: {
    label: 'Reloj',
    variants: [
      '{name} combina precisión, diseño elegante y acabados premium para un estilo impecable en cada momento.',
      'Reloj con estética moderna y presencia sofisticada, creado para quienes valoran funcionalidad y distinción.',
      'Diseñado para destacar con sobriedad, este reloj ofrece comodidad, resistencia y una imagen de alto nivel.',
    ],
  },
};

function normalizeText(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function toSlug(value = '') {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getCategoryPrefix(category = '') {
  const normalized = normalizeText(category);
  return CATEGORY_PREFIX_MAP[normalized] || normalized.slice(0, 3).toUpperCase() || 'GEN';
}

function nextSequenceFromPattern(items = [], extractor, pattern) {
  const sequences = items
    .map(extractor)
    .filter(Boolean)
    .map((value) => {
      const match = value.match(pattern);
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  const max = sequences.length ? Math.max(...sequences) : 0;
  return max + 1;
}

export function generateReference(products = [], category = '', currentReference = '') {
  if (currentReference) return currentReference;
  const prefix = getCategoryPrefix(category);
  const sequence = nextSequenceFromPattern(
    products,
    (product) => product?.reference,
    new RegExp(`^${prefix}-(\\d{3})$`, 'i'),
  );
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

export function generateSku(products = [], category = '', currentSku = '') {
  if (currentSku) return currentSku;
  const prefix = getCategoryPrefix(category);
  const sequence = nextSequenceFromPattern(
    products,
    (product) => product?.sku,
    new RegExp(`^SJ-${prefix}-(\\d{4})$`, 'i'),
  );
  return `SJ-${prefix}-${String(sequence).padStart(4, '0')}`;
}

export function inferStatus(product = {}) {
  if (product.inventory_status && PRODUCT_STATUS_OPTIONS.includes(product.inventory_status)) {
    return product.inventory_status;
  }
  return product.available !== false ? 'Disponible' : 'Agotado';
}

export function toAvailability(status = 'Disponible') {
  return status === 'Disponible';
}

export function getDescriptionTemplateOptions() {
  return Object.entries(DESCRIPTION_TEMPLATES).map(([value, item]) => ({ value, label: item.label }));
}

export function generateDescriptionFromTemplate(templateKey = '', productName = '') {
  const template = DESCRIPTION_TEMPLATES[templateKey];
  if (!template || !Array.isArray(template.variants) || template.variants.length === 0) return '';

  const seed = Math.floor(Math.random() * template.variants.length);
  const selected = template.variants[seed] || template.variants[0];

  return selected.replace(/\{name\}/g, productName || 'Esta pieza');
}
