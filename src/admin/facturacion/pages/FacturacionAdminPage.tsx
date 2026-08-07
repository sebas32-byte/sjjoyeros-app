import React, { useEffect, useRef, useState } from "react";
import { PrintInvoice } from "../components/PrintInvoice";
import { PanelVentaRapida } from "../components/form/PanelVentaRapida";
import { IssuedInvoicesModule } from "../components/issued/IssuedInvoicesModule";
import { facturaInicial } from "../data/factura.initial";
import { generateFacturaPdf } from "../pdf/generateFacturaPdf";
import { readIssuedInvoices, upsertIssuedInvoice, writeIssuedInvoices } from "../services/issuedInvoicesStore";
import { Factura } from "../types/factura.types";

type AdminView = "DRAFT_EDITOR" | "ISSUED_INVOICES";

export default function FacturacionAdminPage() {
  const [factura, setFactura] = useState(facturaInicial);
  const [issuedInvoices, setIssuedInvoices] = useState(() => readIssuedInvoices());
  const [view, setView] = useState<AdminView>("DRAFT_EDITOR");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGuardada, setIsGuardada] = useState(false);
  const [previewFactura, setPreviewFactura] = useState(facturaInicial);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const isMobileBrowser =
    typeof navigator !== "undefined" &&
    (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  const getFacturaFileName = (invoice: Factura) => `${invoice.cabecera.numeroFactura || "factura"}.pdf`;

  const deliverBlobAsDownload = (blob: Blob, fileName: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const isIOS =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.href = blobUrl;
      }
    } else {
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 60000);
  };

  const handleGuardar = () => {
    setIsGuardada(true);
  };

  const generatePdfForFactura = async (invoice: Factura, delivery: "save" | "blob") => {
    if (isGeneratingPdf) {
      return;
    }

    setIsGeneratingPdf(true);
    setPreviewFactura(invoice);
    setIsPrintPreviewOpen(true);

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const rootElement = previewRef.current;
    if (!rootElement) {
      setIsPrintPreviewOpen(false);
      setIsGeneratingPdf(false);
      return;
    }

    const templateElement =
      rootElement.querySelector<HTMLElement>(".invoice-outer-border") ??
      rootElement.querySelector<HTMLElement>(".invoice-page") ??
      rootElement;

    try {
      return await generateFacturaPdf({
        element: templateElement,
        fileName: getFacturaFileName(invoice),
        delivery,
      });
    } finally {
      setIsPrintPreviewOpen(false);
      setIsGeneratingPdf(false);
    }
  };

  const downloadPdfForFactura = async (invoice: Factura) => {
    await generatePdfForFactura(invoice, "save");
  };

  const savePdfForFacturaMobile = async (invoice: Factura) => {
    const result = await generatePdfForFactura(invoice, "blob");
    if (!(result instanceof Blob)) return;
    deliverBlobAsDownload(result, getFacturaFileName(invoice));
  };

  const sharePdfForFacturaMobile = async (invoice: Factura) => {
    const result = await generatePdfForFactura(invoice, "blob");
    if (!(result instanceof Blob)) return;

    const fileName = getFacturaFileName(invoice);
    const file = new File([result], fileName, { type: "application/pdf" });

    if (typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator) {
      try {
        const canShareFiles = navigator.canShare({ files: [file] });
        if (canShareFiles) {
          await navigator.share({
            title: fileName,
            text: "Factura PDF",
            files: [file],
          });
          return;
        }
      } catch {
        // Falls back to download/open when native share is unavailable or canceled.
      }
    }

    deliverBlobAsDownload(result, fileName);
  };

  const handleDownloadPdf = async () => {
    await downloadPdfForFactura(factura);
  };

  const persistIssuedInvoice = (invoice: Factura) => {
    setIssuedInvoices((prev) => {
      const next = upsertIssuedInvoice(invoice, prev);
      writeIssuedInvoices(next);
      return next;
    });
  };

  const handleIssueInvoice = async (issuedFactura: Factura) => {
    persistIssuedInvoice(issuedFactura);
    setView("ISSUED_INVOICES");
    await downloadPdfForFactura(issuedFactura);
  };

  const handleUpdateIssuedInvoice = (recordId: string, nextFactura: Factura) => {
    setIssuedInvoices((prev) => {
      const next = prev.map((record) => (record.id === recordId ? { ...record, updatedAt: new Date().toISOString(), version: record.version + 1, factura: nextFactura } : record));
      writeIssuedInvoices(next);
      return next;
    });

    if (nextFactura.cabecera.numeroFactura === factura.cabecera.numeroFactura) {
      setFactura(nextFactura);
    }
  };

  useEffect(() => {
    const status = factura.lifecycle?.estado;
    if (status === "ISSUED" || status === "ACTIVE_CREDIT" || status === "COMPLETED") {
      persistIssuedInvoice(factura);
    }
  }, [factura]);

  return (
    <main className="min-h-screen bg-[#060606] p-3 md:p-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-[#0a0a0a] p-2">
          <button
            type="button"
            onClick={() => setView("DRAFT_EDITOR")}
            className={`h-11 rounded-xl text-sm font-semibold uppercase tracking-[0.16em] ${view === "DRAFT_EDITOR" ? "bg-[#c5a059] text-black" : "border border-slate-700 bg-[#070707] text-slate-200"}`}
          >
            Nueva Factura
          </button>
          <button
            type="button"
            onClick={() => setView("ISSUED_INVOICES")}
            className={`h-11 rounded-xl text-sm font-semibold uppercase tracking-[0.16em] ${view === "ISSUED_INVOICES" ? "bg-[#c5a059] text-black" : "border border-slate-700 bg-[#070707] text-slate-200"}`}
          >
            Facturas Emitidas
          </button>
        </div>

        {view === "DRAFT_EDITOR" ? (
          <PanelVentaRapida
            factura={factura}
            setFactura={setFactura}
            onGuardar={handleGuardar}
            onDescargarPdf={handleDownloadPdf}
            onGuardarPdfMovil={() => savePdfForFacturaMobile(factura)}
            onCompartirPdfMovil={() => sharePdfForFacturaMobile(factura)}
            isMobilePdfActions={isMobileBrowser}
            onIssueInvoice={handleIssueInvoice}
            isGeneratingPdf={isGeneratingPdf}
            isGuardada={isGuardada}
          />
        ) : (
          <IssuedInvoicesModule
            invoices={issuedInvoices}
            onUpdateInvoice={handleUpdateIssuedInvoice}
            onDownloadPdf={downloadPdfForFactura}
            onSavePdfMobile={savePdfForFacturaMobile}
            onSharePdfMobile={sharePdfForFacturaMobile}
            isMobilePdfActions={isMobileBrowser}
            isGeneratingPdf={isGeneratingPdf}
          />
        )}
      </div>

      {isPrintPreviewOpen ? (
        <div className="print-invoice-host" aria-hidden="true">
          <div ref={previewRef} className="print-invoice-frame">
            <PrintInvoice factura={previewFactura} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
