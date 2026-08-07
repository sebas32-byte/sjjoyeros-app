import React from "react";
import { facturaInicial } from "../data/factura.initial";
import { Factura } from "../types/factura.types";
import { FacturaCanvaTemplate } from "./FacturaCanvaTemplate";

interface InvoicePreviewProps {
  factura?: Factura | null;
}

export function InvoicePreview({ factura }: InvoicePreviewProps) {
  return <FacturaCanvaTemplate factura={factura ?? facturaInicial} />;
}
