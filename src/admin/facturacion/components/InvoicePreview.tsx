import React from "react";
import { Factura } from "../types/factura.types";
import { FacturaCanvaTemplate } from "./FacturaCanvaTemplate";

interface InvoicePreviewProps {
  factura: Factura;
}

export function InvoicePreview({ factura }: InvoicePreviewProps) {
  return <FacturaCanvaTemplate factura={factura} />;
}
