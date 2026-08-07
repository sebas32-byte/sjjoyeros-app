import React from "react";
import { Factura } from "../types/factura.types";
import { FacturaCanvaTemplate } from "./FacturaCanvaTemplate";

interface PrintInvoiceProps {
  factura: Factura;
}

export function PrintInvoice({ factura }: PrintInvoiceProps) {
  return (
    <section className="print-invoice-content" aria-label="Factura para impresión">
      <FacturaCanvaTemplate factura={factura} />
    </section>
  );
}
