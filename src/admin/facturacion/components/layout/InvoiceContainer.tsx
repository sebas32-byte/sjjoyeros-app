import React, { ReactNode } from "react";

interface InvoiceContainerProps {
  children: ReactNode;
}

export function InvoiceContainer({ children }: InvoiceContainerProps) {
  return (
    <div className="facturacion-page p-2 md:p-6 flex items-center justify-center">
      <div className="invoice-page invoice-outer-border folded-corner-container shadow-2xl">
        {children}
      </div>
    </div>
  );
}
