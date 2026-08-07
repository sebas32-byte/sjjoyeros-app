import React, { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { Factura, FacturaProducto } from "../../types/factura.types";

interface PanelVentaRapidaProps {
  factura: Factura;
  setFactura: Dispatch<SetStateAction<Factura>>;
  onGuardar: () => void;
  onDescargarPdf: () => void;
  onGuardarPdfMovil?: () => void;
  onCompartirPdfMovil?: () => void;
  isMobilePdfActions?: boolean;
  onIssueInvoice?: (issuedFactura: Factura) => Promise<void> | void;
  isGeneratingPdf: boolean;
  isGuardada: boolean;
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

interface CompanySettings {
  marcaNombre: string;
  marcaSubtitulo: string;
  marcaSlogan: string;
  instagram: string;
  telefono: string;
  direccion: string;
  horario: string;
  qrTitulo: string;
  qrSubtitulo: string;
  footerMarca: string;
  nit: string;
  warrantyText: string;
  sellerSignatureLabel: string;
  sellerSignatureDetail: string;
}

interface ClientRecord {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  ciudad: string;
}

interface ProductRecord {
  id: string;
  nombre: string;
  material: string;
  referencia: string;
  precioUnitario: number;
  imagen: string;
}

interface ClientDraft {
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  ciudad: string;
}

interface ProductDraft {
  nombre: string;
  material: string;
  referencia: string;
  precioUnitario: string;
  imagen: string;
}

const STORAGE_COMPANY_KEY = "facturacion.companySettings.v1";
const STORAGE_CLIENTS_KEY = "facturacion.clients.v1";
const STORAGE_PRODUCTS_KEY = "facturacion.products.v1";
const STORAGE_NEXT_INVOICE_KEY = "facturacion.nextInvoiceNumber.v1";

function parseMoney(value: string) {
  const parsed = Number(value.replace(/[^0-9-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  const normalized = String(Math.max(0, Math.round(value)));
  const grouped = normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${grouped}`;
}

function normalizePositiveInt(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "1";
  const parsed = Math.max(1, Number(digits));
  return String(parsed);
}

function formatDateEs(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime12(date: Date) {
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hours12 = ((hours24 + 11) % 12) + 1;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  return `${hours12}:${minutes} ${suffix}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractInvoiceSequence(invoiceNumber: string) {
  const digits = invoiceNumber.replace(/[^0-9]/g, "");
  if (!digits) return 1;
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatInvoiceNumber(sequence: number) {
  return `N° ${String(sequence).padStart(6, "0")}`;
}

function normalizeSaleType(value: string) {
  return value.toUpperCase().includes("CONT") ? "CONTADO" : "CREDITO";
}

function toTitleCaseSaleType(value: "CONTADO" | "CREDITO") {
  return value === "CONTADO" ? "Contado" : "Crédito";
}

function emptyProduct(): FacturaProducto {
  return {
    numero: "1",
    imagen: "",
    producto: "",
    material: "",
    referencia: "",
    cantidad: "1",
    valorUnitario: "$0",
    valorTotal: "$0",
  };
}

function seedCompanySettings(factura: Factura): CompanySettings {
  return {
    marcaNombre: factura.empresa.marcaNombre,
    marcaSubtitulo: factura.empresa.marcaSubtitulo,
    marcaSlogan: factura.empresa.marcaSlogan,
    instagram: factura.empresa.instagram,
    telefono: factura.empresa.telefono,
    direccion: factura.empresa.direccion,
    horario: factura.empresa.horario,
    qrTitulo: factura.empresa.qrTitulo,
    qrSubtitulo: factura.empresa.qrSubtitulo,
    footerMarca: factura.empresa.footerMarca,
    nit: factura.empresa.nit,
    warrantyText: factura.garantia.texto,
    sellerSignatureLabel: factura.firmas.firmaEmpresaLabel,
    sellerSignatureDetail: factura.firmas.firmaEmpresaDetalle,
  };
}

function seedClients(factura: Factura): ClientRecord[] {
  return [
    {
      id: createId("client"),
      nombre: factura.cliente.campos[0]?.value ?? "",
      cedula: factura.cliente.campos[1]?.value ?? "",
      telefono: factura.cliente.campos[2]?.value ?? "",
      direccion: factura.cliente.campos[3]?.value ?? "",
      ciudad: factura.cliente.campos[4]?.value ?? "",
    },
  ].filter((client) => client.nombre.trim().length > 0);
}

function seedProducts(factura: Factura): ProductRecord[] {
  return factura.productos.items
    .map((item) => ({
      id: createId("product"),
      nombre: item.producto,
      material: item.material,
      referencia: item.referencia,
      precioUnitario: parseMoney(item.valorUnitario),
      imagen: item.imagen,
    }))
    .filter((product) => product.nombre.trim().length > 0);
}

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function TextField({ label, value, onChange, placeholder, type = "text", readOnly = false, disabled = false }: InputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none transition focus:border-[#c5a059] read-only:cursor-default read-only:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, readOnly = false, disabled = false }: InputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        rows={4}
        className="rounded-xl border border-slate-700 bg-[#070707] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-[#c5a059] read-only:cursor-default read-only:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-500"
      />
    </label>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-800 bg-[#0a0a0a] p-4 md:p-6 shadow-[0_0_0_1px_rgba(197,160,89,0.08),0_20px_40px_rgba(0,0,0,0.35)] space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-[13px] md:text-sm font-semibold uppercase tracking-[0.18em] text-[#c5a059]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center justify-center rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#e3c57f] leading-none">{children}</span>;
}

function SignaturePad({
  title,
  onSave,
  saveLabel = "Guardar firma",
  clearLabel = "Limpiar firma",
  heightClass = "h-56",
}: {
  title: string;
  onSave?: (dataUrl: string) => void;
  saveLabel?: string;
  clearLabel?: string;
  heightClass?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawingRef = useRef(false);
  const [, setVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, rect.width);
      const nextHeight = Math.max(1, rect.height);
      canvas.width = nextWidth * 2;
      canvas.height = nextHeight * 2;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(2, 2);
      context.strokeStyle = "#c5a059";
      context.lineWidth = 2;
      context.lineJoin = "round";
      context.lineCap = "round";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    drawingRef.current = true;
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    if (!hasDrawingRef.current) {
      hasDrawingRef.current = true;
      setVersion((prev) => prev + 1);
    }
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawingRef.current = false;
    setVersion((prev) => prev + 1);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">{title}</h3>
        {hasDrawingRef.current ? <Badge>Firmada</Badge> : <Badge>En blanco</Badge>}
      </div>
      <canvas
        ref={canvasRef}
        className={`signature-canvas w-full ${heightClass} rounded-2xl border border-slate-700 bg-black/70 touch-none`}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <div className="flex flex-col gap-2 md:flex-row">
        <button type="button" onClick={clearCanvas} className="h-11 flex-1 rounded-xl border border-slate-700 bg-[#0a0a0a] text-sm font-medium text-slate-200">
          {clearLabel}
        </button>
        <button type="button" onClick={saveCanvas} className="h-11 flex-1 rounded-xl bg-[#c5a059] text-sm font-semibold text-black">
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

function buildPlanItems(factura: Factura, saleType: "CONTADO" | "CREDITO") {
  const total = parseMoney(factura.totales.totalValor || factura.totales.subtotalValor);

  if (saleType === "CONTADO") {
    return [
      {
        cuota: "1",
        fechaAcordada: factura.cabecera.fechaValor,
        valor: formatMoney(total),
        estado: "PAGADA",
        estadoClase: "badge-paid",
        fechaPago: factura.cabecera.fechaValor,
        firmaCliente: "✓",
        firmaSJ: "✓",
      },
    ];
  }

  const cuotas = Math.max(1, Number(factura.credito.numeroCuotas || "1") || 1);
  const base = Math.floor(total / cuotas);
  const remainder = total - base * cuotas;
  const startDate = factura.credito.fechaInicio ? new Date(`${factura.credito.fechaInicio}T00:00:00`) : new Date();
  const safeDate = Number.isNaN(startDate.getTime()) ? new Date() : startDate;

  return Array.from({ length: cuotas }, (_, index) => {
    const dueDate =
      factura.credito.frecuencia === "Quincenal"
        ? addDays(safeDate, index * 15)
        : factura.credito.frecuencia === "Semanal"
          ? addDays(safeDate, index * 7)
          : addMonths(safeDate, index);

    const amount = index === cuotas - 1 ? base + remainder : base;
    return {
      cuota: String(index + 1),
      fechaAcordada: formatDateEs(dueDate),
      valor: formatMoney(amount),
      estado: "PENDIENTE",
      estadoClase: "badge-pending",
      fechaPago: "-",
      firmaCliente: "-",
      firmaSJ: "-",
    };
  });
}

function recalcFinancial(prev: Factura) {
  const subtotal = prev.productos.items.reduce((sum, item) => sum + parseMoney(item.valorTotal), 0);
  const descuento = parseMoney(prev.totales.descuentoValor);
  const envio = parseMoney(prev.totales.envioValor);
  const total = Math.max(0, subtotal - descuento + envio);
  const paid = prev.historial.items.reduce((sum, item) => sum + parseMoney(item.valor), 0);

  return {
    ...prev,
    totales: {
      ...prev.totales,
      subtotalValor: formatMoney(subtotal),
      totalValor: formatMoney(total),
      saldoInicialValor: formatMoney(total),
      saldoPendienteValor: formatMoney(Math.max(0, total - paid)),
    },
  };
}

function getDefaultLifecycle() {
  return {
    estado: "DRAFT" as const,
    emitidaEn: "",
    firmasIniciales: {
      cliente: false,
      sj: false,
    },
  };
}

function lifecycleLabel(estado: Factura["lifecycle"]["estado"]) {
  if (estado === "ISSUED") return "Emitida";
  if (estado === "ACTIVE_CREDIT") return "Crédito activo";
  if (estado === "COMPLETED") return "Completada";
  return "Borrador";
}

export function PanelVentaRapida({
  factura,
  setFactura,
  onGuardar,
  onDescargarPdf,
  onGuardarPdfMovil,
  onCompartirPdfMovil,
  isMobilePdfActions = false,
  onIssueInvoice,
  isGeneratingPdf,
  isGuardada,
}: PanelVentaRapidaProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentValue, setPaymentValue] = useState("");
  const [paymentObservation, setPaymentObservation] = useState("");
  const [firmaGuardada, setFirmaGuardada] = useState(false);

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => seedCompanySettings(factura));
  const [clients, setClients] = useState<ClientRecord[]>(() => seedClients(factura));
  const [products, setProducts] = useState<ProductRecord[]>(() => seedProducts(factura));
  const [clientSearch, setClientSearch] = useState("");
  const [newClient, setNewClient] = useState<ClientDraft>({ nombre: "", cedula: "", telefono: "", direccion: "", ciudad: "" });
  const [newProduct, setNewProduct] = useState<ProductDraft>({ nombre: "", material: "", referencia: "", precioUnitario: "", imagen: "" });
  const [saleType, setSaleType] = useState<"CONTADO" | "CREDITO">(normalizeSaleType(factura.cabecera.creditoValor));
  const [settingsOpen, setSettingsOpen] = useState(false);

  const initializedRef = useRef(false);

  const updateFactura = (updater: (draft: Factura) => Factura) => {
    setFactura((prev) => updater(prev));
  };

  const lifecycle = factura.lifecycle ?? getDefaultLifecycle();
  const isIssued = lifecycle.estado === "ISSUED";
  const canEditCommercial = !isIssued;
  const canIssue = lifecycle.firmasIniciales.cliente && lifecycle.firmasIniciales.sj;

  const markInitialSignature = (actor: "cliente" | "sj") => {
    updateFactura((prev) => ({
      ...prev,
      lifecycle: {
        ...(prev.lifecycle ?? getDefaultLifecycle()),
        firmasIniciales: {
          ...(prev.lifecycle?.firmasIniciales ?? getDefaultLifecycle().firmasIniciales),
          [actor]: true,
        },
      },
    }));
  };

  const applyIssueLifecycle = (base: Factura): Factura => {
    const currentLifecycle = base.lifecycle ?? getDefaultLifecycle();
    if (currentLifecycle.estado === "ISSUED" || currentLifecycle.estado === "ACTIVE_CREDIT" || currentLifecycle.estado === "COMPLETED") {
      return base;
    }
    return {
      ...base,
      lifecycle: {
        ...currentLifecycle,
        estado: "ISSUED" as const,
        emitidaEn: new Date().toISOString(),
      },
    };
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const storedCompany = readStorage<CompanySettings>(STORAGE_COMPANY_KEY);
    const storedClients = readStorage<ClientRecord[]>(STORAGE_CLIENTS_KEY);
    const storedProducts = readStorage<ProductRecord[]>(STORAGE_PRODUCTS_KEY);
    const storedNextSequence = readStorage<number>(STORAGE_NEXT_INVOICE_KEY);

    const resolvedCompany = storedCompany ?? seedCompanySettings(factura);
    const resolvedClients = storedClients && storedClients.length > 0 ? storedClients : seedClients(factura);
    const resolvedProducts = storedProducts && storedProducts.length > 0 ? storedProducts : seedProducts(factura);

    const now = new Date();
    const currentSequence = storedNextSequence ?? extractInvoiceSequence(factura.cabecera.numeroFactura);
    const nextSequence = currentSequence + 1;

    setCompanySettings(resolvedCompany);
    setClients(resolvedClients);
    setProducts(resolvedProducts);
    writeStorage(STORAGE_COMPANY_KEY, resolvedCompany);
    writeStorage(STORAGE_CLIENTS_KEY, resolvedClients);
    writeStorage(STORAGE_PRODUCTS_KEY, resolvedProducts);
    writeStorage(STORAGE_NEXT_INVOICE_KEY, nextSequence);

    const selectedSaleType = normalizeSaleType(factura.cabecera.creditoValor);
    setSaleType(selectedSaleType);

    const todayDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    updateFactura((prev) => {
      const next = {
        ...prev,
        lifecycle: prev.lifecycle ?? getDefaultLifecycle(),
        empresa: {
          ...prev.empresa,
          marcaNombre: resolvedCompany.marcaNombre,
          marcaSubtitulo: resolvedCompany.marcaSubtitulo,
          marcaSlogan: resolvedCompany.marcaSlogan,
          instagram: resolvedCompany.instagram,
          telefono: resolvedCompany.telefono,
          direccion: resolvedCompany.direccion,
          horario: resolvedCompany.horario,
          qrTitulo: resolvedCompany.qrTitulo,
          qrSubtitulo: resolvedCompany.qrSubtitulo,
          footerMarca: resolvedCompany.footerMarca,
          nit: resolvedCompany.nit,
        },
        cabecera: {
          ...prev.cabecera,
          tituloDocumento: "FACTURA",
          numeroFactura: formatInvoiceNumber(currentSequence),
          fechaLabel: "FECHA:",
          fechaValor: formatDateEs(now),
          horaLabel: "HORA:",
          horaValor: formatTime12(now),
          creditoLabel: "TIPO DE VENTA:",
          creditoValor: selectedSaleType,
        },
        venta: {
          ...prev.venta,
          campos: prev.venta.campos.map((campo, index) => {
            if (index === 0) {
              return { ...campo, value: resolvedCompany.footerMarca || prev.empresa.footerMarca };
            }
            if (index === 1) {
              return { ...campo, value: toTitleCaseSaleType(selectedSaleType) };
            }
            return campo;
          }),
          observacionValor: prev.credito.observacionCredito,
        },
        totales: {
          ...prev.totales,
          tipoVentaLabel: "TIPO DE VENTA",
          tipoVentaValor: selectedSaleType,
        },
        credito: {
          ...prev.credito,
          fechaInicio: todayDate,
        },
        garantia: {
          ...prev.garantia,
          texto: resolvedCompany.warrantyText,
        },
        firmas: {
          ...prev.firmas,
          firmaEmpresaLabel: resolvedCompany.sellerSignatureLabel,
          firmaEmpresaDetalle: resolvedCompany.sellerSignatureDetail || resolvedCompany.footerMarca,
        },
      };

      const withTotals = recalcFinancial(next);
      return {
        ...withTotals,
        planPagos: {
          ...withTotals.planPagos,
          items: buildPlanItems(withTotals, selectedSaleType),
        },
      };
    });
  }, [factura, setFactura]);

  useEffect(() => {
    if (isIssued) return;
    writeStorage(STORAGE_COMPANY_KEY, companySettings);
    updateFactura((prev) => ({
      ...prev,
      empresa: {
        ...prev.empresa,
        marcaNombre: companySettings.marcaNombre,
        marcaSubtitulo: companySettings.marcaSubtitulo,
        marcaSlogan: companySettings.marcaSlogan,
        instagram: companySettings.instagram,
        telefono: companySettings.telefono,
        direccion: companySettings.direccion,
        horario: companySettings.horario,
        qrTitulo: companySettings.qrTitulo,
        qrSubtitulo: companySettings.qrSubtitulo,
        footerMarca: companySettings.footerMarca,
        nit: companySettings.nit,
      },
      garantia: {
        ...prev.garantia,
        texto: companySettings.warrantyText,
      },
      firmas: {
        ...prev.firmas,
        firmaEmpresaLabel: companySettings.sellerSignatureLabel,
        firmaEmpresaDetalle: companySettings.sellerSignatureDetail || companySettings.footerMarca,
      },
      venta: {
        ...prev.venta,
        campos: prev.venta.campos.map((campo, index) => (index === 0 ? { ...campo, value: companySettings.footerMarca } : campo)),
      },
    }));
  }, [companySettings, isIssued]);

  useEffect(() => {
    writeStorage(STORAGE_CLIENTS_KEY, clients);
  }, [clients]);

  useEffect(() => {
    writeStorage(STORAGE_PRODUCTS_KEY, products);
  }, [products]);

  useEffect(() => {
    if (!canEditCommercial) return;
    updateFactura((prev) => {
      const withFinancials = recalcFinancial(prev);
      const planItems = buildPlanItems(withFinancials, saleType);
      const serializedCurrent = JSON.stringify(withFinancials.planPagos.items);
      const serializedNext = JSON.stringify(planItems);

      const nextVenta = {
        ...withFinancials.venta,
        campos: withFinancials.venta.campos.map((campo, index) => {
          if (index === 1) {
            return { ...campo, value: toTitleCaseSaleType(saleType) };
          }
          if (index === 2 && saleType === "CREDITO") {
            const dueDate = planItems[planItems.length - 1]?.fechaAcordada || campo.value;
            return { ...campo, value: dueDate, valueClassName: "text-gold font-medium" };
          }
          return campo;
        }),
        observacionValor: withFinancials.credito.observacionCredito,
      };

      const next = {
        ...withFinancials,
        cabecera: {
          ...withFinancials.cabecera,
          tituloDocumento: "FACTURA",
          creditoValor: saleType,
        },
        venta: nextVenta,
        totales: {
          ...withFinancials.totales,
          tipoVentaValor: saleType,
        },
      };

      if (serializedCurrent === serializedNext) {
        return next;
      }

      return {
        ...next,
        planPagos: {
          ...next.planPagos,
          items: planItems,
        },
      };
    });
  }, [
    factura.credito.frecuencia,
    factura.credito.numeroCuotas,
    factura.credito.observacionCredito,
    factura.credito.fechaInicio,
    factura.productos.items,
    factura.totales.descuentoValor,
    factura.totales.envioValor,
    factura.historial.items,
    saleType,
    setFactura,
    canEditCommercial,
  ]);

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      [client.nombre, client.cedula, client.telefono, client.ciudad].join(" ").toLowerCase().includes(term),
    );
  }, [clients, clientSearch]);

  const updateClientDraft = (key: keyof ClientDraft, value: string) => {
    setNewClient((prev) => ({ ...prev, [key]: value }));
  };

  const updateProductDraft = (key: keyof ProductDraft, value: string) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const applyClientToFactura = (client: ClientRecord) => {
    if (!canEditCommercial) return;
    updateFactura((prev) => {
      const campos = [...prev.cliente.campos];
      campos[0] = { ...campos[0], value: client.nombre };
      campos[1] = { ...campos[1], value: client.cedula };
      campos[2] = { ...campos[2], value: client.telefono };
      campos[3] = { ...campos[3], value: client.direccion };
      campos[4] = { ...campos[4], value: client.ciudad };
      return {
        ...prev,
        cliente: {
          ...prev.cliente,
          campos,
        },
      };
    });
  };

  const saveNewClient = () => {
    if (!canEditCommercial) return;
    if (newClient.nombre.trim().length === 0 || newClient.cedula.trim().length === 0) return;
    const created: ClientRecord = {
      id: createId("client"),
      nombre: newClient.nombre.trim(),
      cedula: newClient.cedula.trim(),
      telefono: newClient.telefono.trim(),
      direccion: newClient.direccion.trim(),
      ciudad: newClient.ciudad.trim(),
    };
    setClients((prev) => [created, ...prev]);
    setClientSearch(created.nombre);
    applyClientToFactura(created);
    setNewClient({ nombre: "", cedula: "", telefono: "", direccion: "", ciudad: "" });
  };

  const getProductIdForItem = (item: FacturaProducto) => {
    const found = products.find((product) => product.referencia === item.referencia && product.nombre === item.producto);
    return found?.id ?? "";
  };

  const applyProductToItem = (index: number, productId: string) => {
    if (!canEditCommercial) return;
    const product = products.find((candidate) => candidate.id === productId);
    if (!product) return;

    updateFactura((prev) => {
      const items = [...prev.productos.items];
      const current = items[index];
      const quantity = Math.max(1, Number(current.cantidad || "1") || 1);
      const nextItem: FacturaProducto = {
        ...current,
        numero: String(index + 1),
        imagen: product.imagen,
        producto: product.nombre,
        material: product.material,
        referencia: product.referencia,
        cantidad: String(quantity),
        valorUnitario: formatMoney(product.precioUnitario),
        valorTotal: formatMoney(product.precioUnitario * quantity),
      };
      items[index] = nextItem;
      const next = {
        ...prev,
        productos: {
          ...prev.productos,
          items,
        },
      };
      return recalcFinancial(next);
    });
  };

  const updateQuantity = (index: number, quantityValue: string) => {
    if (!canEditCommercial) return;
    updateFactura((prev) => {
      const items = [...prev.productos.items];
      const item = { ...items[index] };
      const quantity = Math.max(1, Number(quantityValue.replace(/[^0-9]/g, "") || "1"));
      const unitPrice = parseMoney(item.valorUnitario);
      item.numero = String(index + 1);
      item.cantidad = String(quantity);
      item.valorTotal = formatMoney(unitPrice * quantity);
      items[index] = item;
      const next = {
        ...prev,
        productos: {
          ...prev.productos,
          items,
        },
      };
      return recalcFinancial(next);
    });
  };

  const addInvoiceProduct = () => {
    if (!canEditCommercial) return;
    updateFactura((prev) => {
      const nextItems = [...prev.productos.items, { ...emptyProduct(), numero: String(prev.productos.items.length + 1) }];
      return {
        ...prev,
        productos: {
          ...prev.productos,
          items: nextItems,
        },
      };
    });
  };

  const removeInvoiceProduct = (index: number) => {
    if (!canEditCommercial) return;
    updateFactura((prev) => {
      const remaining = prev.productos.items.filter((_, itemIndex) => itemIndex !== index);
      const normalized = (remaining.length > 0 ? remaining : [emptyProduct()]).map((item, itemIndex) => ({
        ...item,
        numero: String(itemIndex + 1),
      }));
      return recalcFinancial({
        ...prev,
        productos: {
          ...prev.productos,
          items: normalized,
        },
      });
    });
  };

  const saveNewProduct = () => {
    if (!canEditCommercial) return;
    if (newProduct.nombre.trim().length === 0 || newProduct.referencia.trim().length === 0) return;
    const created: ProductRecord = {
      id: createId("product"),
      nombre: newProduct.nombre.trim(),
      material: newProduct.material.trim(),
      referencia: newProduct.referencia.trim(),
      precioUnitario: parseMoney(newProduct.precioUnitario),
      imagen: newProduct.imagen.trim(),
    };
    setProducts((prev) => [created, ...prev]);
    setNewProduct({ nombre: "", material: "", referencia: "", precioUnitario: "", imagen: "" });
  };

  const setTotalesAdjustField = (key: "descuentoValor" | "envioValor", value: string) => {
    if (!canEditCommercial) return;
    updateFactura((prev) => {
      const next = {
        ...prev,
        totales: {
          ...prev.totales,
          [key]: value,
        },
      };
      return recalcFinancial(next);
    });
  };

  const setCreditoField = <K extends keyof Factura["credito"]>(key: K, value: Factura["credito"][K]) => {
    if (!canEditCommercial) return;
    updateFactura((prev) => ({
      ...prev,
      credito: {
        ...prev.credito,
        [key]: value,
      },
    }));
  };

  const setSaleTypeValue = (value: "CONTADO" | "CREDITO") => {
    if (!canEditCommercial) return;
    setSaleType(value);
    updateFactura((prev) => ({
      ...prev,
      cabecera: {
        ...prev.cabecera,
        creditoValor: value,
      },
      totales: {
        ...prev.totales,
        tipoVentaValor: value,
      },
      venta: {
        ...prev.venta,
        campos: prev.venta.campos.map((campo, index) => (index === 1 ? { ...campo, value: toTitleCaseSaleType(value) } : campo)),
      },
    }));
  };

  const updateObservaciones = (value: string) => {
    if (!canEditCommercial) return;
    updateFactura((prev) => ({
      ...prev,
      observaciones: {
        ...prev.observaciones,
        texto: value,
      },
    }));
  };

  const openPaymentModal = (index: number) => {
    const target = factura.planPagos.items[index];
    setSelectedCuota(index);
    setPaymentValue(target?.valor || "");
    setPaymentMethod("Efectivo");
    setPaymentDate("");
    setPaymentObservation("");
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedCuota(null);
  };

  const savePayment = () => {
    if (selectedCuota === null) return;

    updateFactura((prev) => {
      const historyItem = {
        fecha: paymentDate || formatDateEs(new Date()),
        valor: paymentValue || prev.planPagos.items[selectedCuota]?.valor || "",
        metodo: paymentMethod,
        recibidoPor: prev.empresa.footerMarca || "SJ Joyeros",
        observacion: paymentObservation,
      };
      const history = [...prev.historial.items, historyItem];
      const planPagos = prev.planPagos.items.map((item, index) =>
        index === selectedCuota
          ? {
              ...item,
              estado: "PAGADA",
              estadoClase: "badge-paid",
              fechaPago: paymentDate || formatDateEs(new Date()),
              firmaCliente: item.firmaCliente === "-" ? "✓" : item.firmaCliente,
              firmaSJ: item.firmaSJ === "-" ? "✓" : item.firmaSJ,
            }
          : item,
      );

      const withUpdates = {
        ...prev,
        historial: {
          ...prev.historial,
          items: history,
        },
        planPagos: {
          ...prev.planPagos,
          items: planPagos,
        },
      };

      const withRecalc = recalcFinancial(withUpdates);
      const pendingBalance = parseMoney(withRecalc.totales.saldoPendienteValor);
      const allPaid = withRecalc.planPagos.items.every((item) => item.estado === "PAGADA") || pendingBalance === 0;
      const nextLifecycleState = allPaid ? "COMPLETED" : "ACTIVE_CREDIT";

      return {
        ...withRecalc,
        lifecycle: {
          ...(withRecalc.lifecycle ?? getDefaultLifecycle()),
          estado: nextLifecycleState,
        },
      };
    });

    closePaymentModal();
  };

  const sellerSignatureHandler = (dataUrl: string) => {
    if (isIssued) return;
    if (!dataUrl) return;
    setFirmaGuardada(true);
    markInitialSignature("sj");
    updateFactura((prev) => ({
      ...prev,
      firmas: {
        ...prev.firmas,
        firmaEmpresaLabel: companySettings.sellerSignatureLabel,
        firmaEmpresaDetalle: companySettings.sellerSignatureDetail || companySettings.footerMarca,
      },
    }));
  };

  const customerInitialSignatureHandler = (dataUrl: string) => {
    if (isIssued) return;
    if (!dataUrl) return;
    markInitialSignature("cliente");
  };

  const handleGenerateInvoice = async () => {
    onGuardar();
    if (!isIssued && canIssue) {
      const issuedFactura = applyIssueLifecycle(factura);
      updateFactura(() => issuedFactura);
      await onIssueInvoice?.(issuedFactura);
    }
  };

  const planHeaders = factura.planPagos.columnas;
  const historyHeaders = factura.historial.columnas;

  return (
    <div className="space-y-5 pb-6 text-slate-100">
      <header className="rounded-[30px] border border-slate-800 bg-[#050505] p-5 md:p-7 shadow-[0_0_0_1px_rgba(197,160,89,0.06),0_25px_50px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c5a059]">SJ Joyeros</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-white">Panel administrativo de facturación</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Flujo optimizado para generar facturas en menos de un minuto.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Cliente reutilizable</Badge>
            <Badge>Catálogo automático</Badge>
            <Badge>Cálculo automático</Badge>
            <Badge>{`Estado: ${lifecycleLabel(lifecycle.estado)}`}</Badge>
          </div>
        </div>
      </header>

      <Section title="Configuración permanente" subtitle="Estos datos se guardan una sola vez y se reutilizan en todas las facturas.">
        <button type="button" disabled={!canEditCommercial} onClick={() => setSettingsOpen((prev) => !prev)} className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-4 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
          {settingsOpen ? "Ocultar configuración" : "Mostrar configuración"}
        </button>
        {settingsOpen ? (
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#050505] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="Marca nombre" value={companySettings.marcaNombre} onChange={(value) => setCompanySettings((prev) => ({ ...prev, marcaNombre: value }))} disabled={!canEditCommercial} />
              <TextField label="Marca subtitulo" value={companySettings.marcaSubtitulo} onChange={(value) => setCompanySettings((prev) => ({ ...prev, marcaSubtitulo: value }))} disabled={!canEditCommercial} />
              <TextField label="Marca slogan" value={companySettings.marcaSlogan} onChange={(value) => setCompanySettings((prev) => ({ ...prev, marcaSlogan: value }))} disabled={!canEditCommercial} />
              <TextField label="Instagram" value={companySettings.instagram} onChange={(value) => setCompanySettings((prev) => ({ ...prev, instagram: value }))} disabled={!canEditCommercial} />
              <TextField label="Telefono" value={companySettings.telefono} onChange={(value) => setCompanySettings((prev) => ({ ...prev, telefono: value }))} disabled={!canEditCommercial} />
              <TextField label="Direccion" value={companySettings.direccion} onChange={(value) => setCompanySettings((prev) => ({ ...prev, direccion: value }))} disabled={!canEditCommercial} />
              <TextField label="Horario" value={companySettings.horario} onChange={(value) => setCompanySettings((prev) => ({ ...prev, horario: value }))} disabled={!canEditCommercial} />
              <TextField label="QR titulo" value={companySettings.qrTitulo} onChange={(value) => setCompanySettings((prev) => ({ ...prev, qrTitulo: value }))} disabled={!canEditCommercial} />
              <TextField label="QR subtitulo" value={companySettings.qrSubtitulo} onChange={(value) => setCompanySettings((prev) => ({ ...prev, qrSubtitulo: value }))} disabled={!canEditCommercial} />
              <TextField label="Footer marca" value={companySettings.footerMarca} onChange={(value) => setCompanySettings((prev) => ({ ...prev, footerMarca: value }))} disabled={!canEditCommercial} />
              <TextField label="NIT" value={companySettings.nit} onChange={(value) => setCompanySettings((prev) => ({ ...prev, nit: value }))} disabled={!canEditCommercial} />
              <TextField label="Firma vendedor" value={companySettings.sellerSignatureLabel} onChange={(value) => setCompanySettings((prev) => ({ ...prev, sellerSignatureLabel: value }))} disabled={!canEditCommercial} />
              <TextField label="Detalle firma" value={companySettings.sellerSignatureDetail} onChange={(value) => setCompanySettings((prev) => ({ ...prev, sellerSignatureDetail: value }))} disabled={!canEditCommercial} />
            </div>
            <TextAreaField label="Texto de garantía (fijo)" value={companySettings.warrantyText} onChange={(value) => setCompanySettings((prev) => ({ ...prev, warrantyText: value }))} disabled={!canEditCommercial} />
          </div>
        ) : null}
      </Section>

      <Section title="1. Información de la factura" subtitle="Título, número, fecha y hora se generan automáticamente.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField label="Titulo" value={factura.cabecera.tituloDocumento} onChange={() => {}} readOnly />
          <TextField label="Numero factura" value={factura.cabecera.numeroFactura} onChange={() => {}} readOnly />
          <TextField label="Fecha" value={factura.cabecera.fechaValor} onChange={() => {}} readOnly />
          <TextField label="Hora" value={factura.cabecera.horaValor} onChange={() => {}} readOnly />
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Tipo de venta</span>
            <select
              value={saleType}
              onChange={(event) => setSaleTypeValue(event.target.value as "CONTADO" | "CREDITO")}
              disabled={!canEditCommercial}
              className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none transition focus:border-[#c5a059]"
            >
              <option value="CONTADO">CONTADO</option>
              <option value="CREDITO">CREDITO</option>
            </select>
          </label>
        </div>
      </Section>

      <Section title="2. Cliente" subtitle="Busca un cliente existente o crea uno nuevo si no está en la base.">
        <div className="space-y-4">
          <TextField label="Buscar cliente" value={clientSearch} onChange={setClientSearch} placeholder="Nombre, cédula, teléfono o ciudad" disabled={!canEditCommercial} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClients.slice(0, 6).map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => applyClientToFactura(client)}
                disabled={!canEditCommercial}
                className="rounded-xl border border-slate-700 bg-[#060606] p-3 text-left transition hover:border-[#c5a059] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <p className="text-sm font-medium text-white">{client.nombre}</p>
                <p className="text-xs text-slate-400">{client.cedula} · {client.telefono || "Sin teléfono"}</p>
                <p className="text-xs text-slate-500">{client.ciudad || "Sin ciudad"}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.16em] text-[#c5a059]">Crear cliente nuevo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="Nombre" value={newClient.nombre} onChange={(value) => updateClientDraft("nombre", value)} disabled={!canEditCommercial} />
              <TextField label="Cédula" value={newClient.cedula} onChange={(value) => updateClientDraft("cedula", value)} disabled={!canEditCommercial} />
              <TextField label="Telefono" value={newClient.telefono} onChange={(value) => updateClientDraft("telefono", value)} disabled={!canEditCommercial} />
              <TextField label="Direccion" value={newClient.direccion} onChange={(value) => updateClientDraft("direccion", value)} disabled={!canEditCommercial} />
              <div className="md:col-span-2">
                <TextField label="Ciudad" value={newClient.ciudad} onChange={(value) => updateClientDraft("ciudad", value)} disabled={!canEditCommercial} />
              </div>
            </div>
            <button type="button" onClick={saveNewClient} disabled={!canEditCommercial} className="h-11 rounded-xl bg-[#c5a059] px-4 text-sm font-semibold uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-50">
              Guardar cliente
            </button>
          </div>
        </div>
      </Section>

      <Section title="3. Productos" subtitle="Selecciona productos del catálogo. Solo ingresas cantidad por línea.">
        <div className="space-y-4">
          {factura.productos.items.map((item, index) => {
            const selectedProductId = getProductIdForItem(item);
            return (
              <div key={`${item.numero}-${index}`} className="rounded-[24px] border border-slate-800 bg-[#050505] p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <p className="text-sm text-slate-300">Producto #{index + 1}</p>
                  <button type="button" onClick={() => removeInvoiceProduct(index)} disabled={!canEditCommercial} className="h-10 rounded-xl border border-slate-700 px-4 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50">
                    Eliminar
                  </button>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Seleccionar producto</span>
                  <select
                    value={selectedProductId}
                    onChange={(event) => applyProductToItem(index, event.target.value)}
                    disabled={!canEditCommercial}
                    className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none transition focus:border-[#c5a059]"
                  >
                    <option value="">Seleccionar</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.nombre} · {product.referencia}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField label="Material" value={item.material} onChange={() => {}} readOnly />
                  <TextField label="Referencia" value={item.referencia} onChange={() => {}} readOnly />
                  <TextField label="Precio unitario" value={item.valorUnitario} onChange={() => {}} readOnly />
                  <TextField label="Subtotal" value={item.valorTotal} onChange={() => {}} readOnly />
                  <TextField label="Cantidad" value={item.cantidad} onChange={(value) => updateQuantity(index, value)} type="number" disabled={!canEditCommercial} />
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={addInvoiceProduct} disabled={!canEditCommercial} className="mt-1 flex h-14 w-full items-center justify-center rounded-2xl bg-[#c5a059] text-sm font-semibold uppercase tracking-[0.18em] text-black disabled:cursor-not-allowed disabled:opacity-50">
          Agregar producto
        </button>

        <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 space-y-3">
          <h3 className="text-xs uppercase tracking-[0.16em] text-[#c5a059]">Crear producto en catálogo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField label="Nombre" value={newProduct.nombre} onChange={(value) => updateProductDraft("nombre", value)} disabled={!canEditCommercial} />
            <TextField label="Material" value={newProduct.material} onChange={(value) => updateProductDraft("material", value)} disabled={!canEditCommercial} />
            <TextField label="Referencia" value={newProduct.referencia} onChange={(value) => updateProductDraft("referencia", value)} disabled={!canEditCommercial} />
            <TextField label="Precio unitario" value={newProduct.precioUnitario} onChange={(value) => updateProductDraft("precioUnitario", value)} disabled={!canEditCommercial} />
            <div className="md:col-span-2">
              <TextField label="Imagen (opcional)" value={newProduct.imagen} onChange={(value) => updateProductDraft("imagen", value)} disabled={!canEditCommercial} />
            </div>
          </div>
          <button type="button" onClick={saveNewProduct} disabled={!canEditCommercial} className="h-11 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 px-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#e3c57f] disabled:cursor-not-allowed disabled:opacity-50">
            Guardar producto
          </button>
        </div>
      </Section>

      <Section title="4. Resumen financiero" subtitle="Subtotal, total y saldos se calculan automáticamente.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-slate-800 bg-[#050505] p-4 space-y-3">
            <TextField label="Subtotal" value={factura.totales.subtotalValor} onChange={() => {}} readOnly />
            <TextField label="Descuento" value={factura.totales.descuentoValor} onChange={(value) => setTotalesAdjustField("descuentoValor", value)} disabled={!canEditCommercial} />
            <TextField label="Envio" value={factura.totales.envioValor} onChange={(value) => setTotalesAdjustField("envioValor", value)} disabled={!canEditCommercial} />
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-[#050505] p-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-[#c5a059]/25 bg-[#111111] px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total</span>
              <strong className="text-2xl text-[#c5a059]">{factura.totales.totalValor}</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="Saldo inicial" value={factura.totales.saldoInicialValor} onChange={() => {}} readOnly />
              <TextField label="Saldo pendiente" value={factura.totales.saldoPendienteValor} onChange={() => {}} readOnly />
            </div>
          </div>
        </div>
      </Section>

      {saleType === "CREDITO" ? (
        <Section title="5. Configuración del crédito" subtitle="Solo se solicita frecuencia, número de cuotas y nota opcional.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Frecuencia</span>
              <select
                value={factura.credito.frecuencia}
                onChange={(event) => setCreditoField("frecuencia", event.target.value as Factura["credito"]["frecuencia"])}
                  disabled={!canEditCommercial}
                className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none transition focus:border-[#c5a059]"
              >
                <option value="Mensual">Mensual</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Semanal">Semanal</option>
              </select>
            </label>
            <TextField label="Numero de cuotas" value={factura.credito.numeroCuotas} onChange={(value) => setCreditoField("numeroCuotas", normalizePositiveInt(value))} type="number" disabled={!canEditCommercial} />
            <div className="md:col-span-2">
              <TextAreaField label="Observacion del crédito (opcional)" value={factura.credito.observacionCredito} onChange={(value) => setCreditoField("observacionCredito", value)} disabled={!canEditCommercial} />
            </div>
          </div>
        </Section>
      ) : null}

      <Section title="6. Plan de pagos" subtitle="Se genera automáticamente según la configuración seleccionada.">
        <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-[#050505]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-black/50 text-[11px] uppercase tracking-[0.18em] text-[#c5a059]">
                <tr>
                  {planHeaders.map((header) => (
                    <th key={header} className="px-4 py-3 whitespace-nowrap">{header}</th>
                  ))}
                  <th className="px-4 py-3 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {factura.planPagos.items.map((item, index) => (
                  <tr key={`${item.cuota}-${index}`} className="align-top">
                    <td className="px-4 py-4 font-medium">{item.cuota}</td>
                    <td className="px-4 py-4">{item.fechaAcordada}</td>
                    <td className="px-4 py-4 text-right font-medium text-white">{item.valor}</td>
                    <td className="px-4 py-4">
                      <span className={`${item.estadoClase} inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em] leading-none`}>{item.estado}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{item.fechaPago}</td>
                    <td className="px-4 py-4 text-slate-400">{item.firmaCliente}</td>
                    <td className="px-4 py-4 text-slate-400">{item.firmaSJ}</td>
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => openPaymentModal(index)} disabled={item.estado === "PAGADA"} className="inline-flex h-10 items-center justify-center rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 px-4 text-[11px] uppercase tracking-[0.16em] text-[#e3c57f] transition hover:bg-[#c5a059]/20 leading-none disabled:cursor-not-allowed disabled:opacity-40">
                        Registrar pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="7. Historial de pagos" subtitle="Sin cambios en funcionamiento.">
        <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-[#050505]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-black/50 text-[11px] uppercase tracking-[0.18em] text-[#c5a059]">
                <tr>
                  {historyHeaders.map((header) => (
                    <th key={header} className="px-4 py-3 whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {factura.historial.items.length === 0 ? (
                  <tr>
                    <td colSpan={historyHeaders.length} className="px-4 py-8 text-center text-slate-500 italic">
                      {factura.historial.mensajeVacio}
                    </td>
                  </tr>
                ) : (
                  factura.historial.items.map((item, index) => (
                    <tr key={`${item.fecha}-${index}`}>
                      <td className="px-4 py-3">{item.fecha}</td>
                      <td className="px-4 py-3 text-right font-medium text-white">{item.valor}</td>
                      <td className="px-4 py-3">{item.metodo}</td>
                      <td className="px-4 py-3">{item.recibidoPor}</td>
                      <td className="px-4 py-3">{item.observacion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="8. Observaciones" subtitle="Campo manual para notas adicionales de cada venta.">
        <TextAreaField label="Observaciones" value={factura.observaciones.texto} onChange={updateObservaciones} disabled={!canEditCommercial} />
      </Section>

      <Section title="9. Firmas iniciales" subtitle="Ambas firmas son obligatorias para emitir y bloquear la factura.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            {!isIssued ? <SignaturePad title="Firma inicial del cliente" onSave={customerInitialSignatureHandler} saveLabel="Guardar firma cliente" clearLabel="Limpiar firma" heightClass="h-64" /> : <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 text-sm text-slate-300">Firma inicial del cliente registrada.</div>}
            <p className="mt-2 text-xs text-slate-400">Estado: {lifecycle.firmasIniciales.cliente ? "✓ Capturada" : "Pendiente"}</p>
          </div>
          <div>
            {!isIssued ? <SignaturePad title="Firma inicial SJ Joyeros" onSave={sellerSignatureHandler} saveLabel="Guardar firma SJ" clearLabel="Limpiar firma" heightClass="h-64" /> : <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 text-sm text-slate-300">Firma inicial SJ Joyeros registrada.</div>}
            <p className="mt-2 text-xs text-slate-400">Estado: {lifecycle.firmasIniciales.sj ? "✓ Capturada" : "Pendiente"}</p>
          </div>
        </div>
        {firmaGuardada ? <p className="text-sm text-emerald-400">Firma de SJ guardada en el panel.</p> : null}
      </Section>

      <Section title="10. Acciones" subtitle="Mantiene generación y descarga del PDF oficial.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button type="button" onClick={handleGenerateInvoice} disabled={isIssued} className="h-14 rounded-2xl border border-slate-700 bg-[#111111] text-sm font-semibold uppercase tracking-[0.18em] text-slate-100 transition hover:border-[#c5a059] disabled:cursor-not-allowed disabled:opacity-50">
            {isIssued ? "Factura emitida" : "Emitir factura"}
          </button>
          {isMobilePdfActions ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onGuardarPdfMovil}
                disabled={isGeneratingPdf}
                className="h-14 rounded-2xl bg-[#c5a059] text-sm font-semibold uppercase tracking-[0.16em] text-black transition disabled:opacity-60"
              >
                {isGeneratingPdf ? "Generando..." : "Guardar PDF"}
              </button>
              <button
                type="button"
                onClick={onCompartirPdfMovil}
                disabled={isGeneratingPdf}
                className="h-14 rounded-2xl border border-[#c5a059] bg-transparent text-sm font-semibold uppercase tracking-[0.16em] text-[#e3c57f] transition disabled:opacity-60"
              >
                {isGeneratingPdf ? "Generando..." : "Compartir PDF"}
              </button>
            </div>
          ) : (
            <button type="button" onClick={onDescargarPdf} disabled={isGeneratingPdf} className="h-14 rounded-2xl bg-[#c5a059] text-sm font-semibold uppercase tracking-[0.18em] text-black transition disabled:opacity-60">
              {isGeneratingPdf ? "Generando PDF..." : "Descargar PDF"}
            </button>
          )}
        </div>
        {!isIssued && !canIssue ? <p className="text-sm text-amber-300">Para emitir y bloquear la factura debes capturar firma inicial de cliente y SJ Joyeros.</p> : null}
        {isIssued ? <p className="text-sm text-emerald-400">Factura bloqueada en estado ISSUED. Solo se permiten pagos y exportación.</p> : null}
        {isGuardada ? <p className="text-sm text-emerald-400">Factura preparada para exportacion.</p> : null}
      </Section>

      {paymentModalOpen && selectedCuota !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-800 bg-[#0b0b0b] p-4 md:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#c5a059]">Registrar pago</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Cuota {factura.planPagos.items[selectedCuota]?.cuota}</h3>
              </div>
              <button type="button" onClick={closePaymentModal} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-700 px-4 text-sm text-slate-200 leading-none">Cancelar</button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField label="Valor recibido" value={paymentValue} onChange={setPaymentValue} />
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Metodo de pago</span>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none transition focus:border-[#c5a059]">
                  {factura.credito.modalPago.metodos.map((metodo) => (
                    <option key={metodo} value={metodo}>{metodo}</option>
                  ))}
                </select>
              </label>
              <TextField label="Fecha" value={paymentDate} onChange={setPaymentDate} type="date" />
              <div className="md:col-span-2">
                <TextAreaField label="Observaciones" value={paymentObservation} onChange={setPaymentObservation} />
              </div>
            </div>

            <div className="mt-4">
              <SignaturePad title="Firma del cliente" saveLabel="Guardar" clearLabel="Cancelar firma" heightClass="h-64" />
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <button type="button" onClick={savePayment} className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#c5a059] text-sm font-semibold uppercase tracking-[0.18em] text-black leading-none">
                Guardar
              </button>
              <button type="button" onClick={closePaymentModal} className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-700 bg-[#111111] text-sm font-semibold uppercase tracking-[0.18em] text-slate-100 leading-none">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
