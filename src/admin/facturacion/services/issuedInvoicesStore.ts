import { Factura } from "../types/factura.types";

const STORAGE_ISSUED_INVOICES_KEY = "facturacion.issuedInvoices.v1";

export interface IssuedInvoiceRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  factura: Factura;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readIssuedInvoices(): IssuedInvoiceRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_ISSUED_INVOICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IssuedInvoiceRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeIssuedInvoices(records: IssuedInvoiceRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_ISSUED_INVOICES_KEY, JSON.stringify(records));
}

export function upsertIssuedInvoice(factura: Factura, records: IssuedInvoiceRecord[]): IssuedInvoiceRecord[] {
  const now = new Date().toISOString();
  const numeroFactura = factura.cabecera.numeroFactura;
  const existingIndex = records.findIndex((record) => record.factura.cabecera.numeroFactura === numeroFactura);

  if (existingIndex === -1) {
    return [
      {
        id: createId("issued"),
        createdAt: now,
        updatedAt: now,
        version: 1,
        factura,
      },
      ...records,
    ];
  }

  const existing = records[existingIndex];
  const next = [...records];
  next[existingIndex] = {
    ...existing,
    updatedAt: now,
    version: existing.version + 1,
    factura,
  };
  return next;
}
