import React from "react";
import { FacturaCanvaTemplate } from "../components/FacturaCanvaTemplate";
import { facturaInicial } from "../data/factura.initial";
import { Factura } from "../types/factura.types";

interface InvoicePreviewPageProps {
  factura?: Factura | null;
}

export default function InvoicePreviewPage({ factura }: InvoicePreviewPageProps) {
  return <FacturaCanvaTemplate factura={factura ?? facturaInicial} />;
}
