import React from "react";
import { FacturaCanvaTemplate } from "../components/FacturaCanvaTemplate";
import { Factura } from "../types/factura.types";

interface InvoicePreviewPageProps {
  factura: Factura;
}

export default function InvoicePreviewPage({ factura }: InvoicePreviewPageProps) {
  return <FacturaCanvaTemplate factura={factura} />;
}
