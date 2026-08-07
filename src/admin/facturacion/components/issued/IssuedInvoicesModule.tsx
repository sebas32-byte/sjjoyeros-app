import React, { ReactNode, useMemo, useRef, useState } from "react";
import { Factura, FacturaEstado, FacturaPlanPagoItem } from "../../types/factura.types";
import { IssuedInvoiceRecord } from "../../services/issuedInvoicesStore";

interface IssuedInvoicesModuleProps {
  invoices: IssuedInvoiceRecord[];
  onUpdateInvoice: (recordId: string, factura: Factura) => void;
  onDownloadPdf: (factura: Factura) => Promise<void> | void;
  onSavePdfMobile?: (factura: Factura) => Promise<void> | void;
  onSharePdfMobile?: (factura: Factura) => Promise<void> | void;
  isMobilePdfActions?: boolean;
  isGeneratingPdf?: boolean;
}

type PaymentMethod = "Cash" | "Bank Transfer" | "Nequi" | "Daviplata" | "Other";

interface PaymentForm {
  method: PaymentMethod;
  transactionReference: string;
  notes: string;
  date: string;
}

function parseMoney(value: string) {
  const parsed = Number(value.replace(/[^0-9-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  const normalized = String(Math.max(0, Math.round(value)));
  const grouped = normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${grouped}`;
}

function formatDateEs(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function statusLabel(estado: FacturaEstado) {
  if (estado === "DRAFT") return "Borrador";
  if (estado === "ISSUED") return "Emitida";
  if (estado === "ACTIVE_CREDIT") return "Crédito activo";
  return "Completada";
}

function statusClass(estado: FacturaEstado) {
  if (estado === "COMPLETED") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (estado === "ACTIVE_CREDIT") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-[#c5a059]/30 bg-[#c5a059]/10 text-[#e3c57f]";
}

function computeRemainingInstallments(planItems: FacturaPlanPagoItem[]) {
  return planItems.filter((item) => item.estado !== "PAGADA").length;
}

function computeNextDueDate(planItems: FacturaPlanPagoItem[]) {
  const pending = planItems.find((item) => item.estado !== "PAGADA");
  return pending?.fechaAcordada || "Sin cuotas pendientes";
}

function getCustomerName(factura: Factura) {
  return factura.cliente.campos[0]?.value || "Cliente sin nombre";
}

function getCustomerDocument(factura: Factura) {
  return factura.cliente.campos[1]?.value || "Sin documento";
}

function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${className}`}>{children}</span>;
}

function SignaturePad({
  title,
  onSave,
  saveLabel,
  clearLabel,
}: {
  title: string;
  onSave: (dataUrl: string) => void;
  saveLabel: string;
  clearLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const ensureContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== Math.max(1, rect.width) * 2 || canvas.height !== Math.max(1, rect.height) * 2) {
      canvas.width = Math.max(1, rect.width) * 2;
      canvas.height = Math.max(1, rect.height) * 2;
    }

    const context = canvas.getContext("2d");
    if (!context) return null;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(2, 2);
    context.strokeStyle = "#c5a059";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    return context;
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const context = ensureContext();
    if (!context) return;
    const point = getPoint(event);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = ensureContext();
    if (!context) return;
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    if (!hasDrawing) setHasDrawing(true);
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
    setHasDrawing(false);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <h4 className="text-[11px] uppercase tracking-[0.16em] text-slate-200">{title}</h4>
        {hasDrawing ? <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Firmada</Badge> : <Badge className="border-slate-700 text-slate-400">Pendiente</Badge>}
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-52 rounded-xl border border-slate-700 bg-black/70 touch-none"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={clearCanvas} className="h-11 rounded-xl border border-slate-700 bg-[#111111] text-sm text-slate-200">
          {clearLabel}
        </button>
        <button type="button" onClick={saveCanvas} className="h-11 rounded-xl bg-[#c5a059] text-sm font-semibold text-black">
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

function recalcAfterPayment(factura: Factura, amountPaid: number, planItemIndex: number, form: PaymentForm, signatures: { customer: boolean; sj: boolean }) {
  const paymentDateLabel = formatDateEs(new Date(`${form.date}T00:00:00`));

  const nextPlanItems = factura.planPagos.items.map((item, index) => {
    if (index !== planItemIndex) return item;
    return {
      ...item,
      estado: "PAGADA",
      estadoClase: "badge-paid",
      fechaPago: paymentDateLabel,
      firmaCliente: signatures.customer ? "✓" : item.firmaCliente,
      firmaSJ: signatures.sj ? "✓" : item.firmaSJ,
    };
  });

  const nextHistory = [
    ...factura.historial.items,
    {
      fecha: paymentDateLabel,
      valor: formatMoney(amountPaid),
      metodo: form.method,
      recibidoPor: factura.empresa.footerMarca || "SJ Joyeros",
      observacion: form.notes || "Sin observaciones",
    },
  ];

  const total = parseMoney(factura.totales.totalValor || factura.totales.subtotalValor);
  const paid = nextHistory.reduce((sum, item) => sum + parseMoney(item.valor), 0);
  const pending = Math.max(0, total - paid);

  const allPaid = nextPlanItems.every((item) => item.estado === "PAGADA") || pending === 0;

  const nextStatus: FacturaEstado = allPaid ? "COMPLETED" : "ACTIVE_CREDIT";

  return {
    ...factura,
    planPagos: {
      ...factura.planPagos,
      items: nextPlanItems,
    },
    historial: {
      ...factura.historial,
      items: nextHistory,
    },
    totales: {
      ...factura.totales,
      saldoPendienteValor: formatMoney(pending),
    },
    lifecycle: {
      ...factura.lifecycle,
      estado: nextStatus,
    },
  };
}

export function IssuedInvoicesModule({
  invoices,
  onUpdateInvoice,
  onDownloadPdf,
  onSavePdfMobile,
  onSharePdfMobile,
  isMobilePdfActions = false,
  isGeneratingPdf = false,
}: IssuedInvoicesModuleProps) {
  const downloadLockRef = useRef(false);
  const [search, setSearch] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ recordId: string; itemIndex: number } | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    method: "Cash",
    transactionReference: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [sjSignatureSaved, setSjSignatureSaved] = useState(false);
  const [customerSignatureSaved, setCustomerSignatureSaved] = useState(false);

  const selectedRecord = invoices.find((record) => record.id === selectedRecordId) ?? null;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return invoices;
    return invoices.filter((record) => {
      const factura = record.factura;
      const fields = [
        factura.cabecera.numeroFactura,
        getCustomerName(factura),
        getCustomerDocument(factura),
        factura.totales.saldoPendienteValor,
      ]
        .join(" ")
        .toLowerCase();
      return fields.includes(term);
    });
  }, [invoices, search]);

  const isElectronic = paymentForm.method !== "Cash";

  const paymentContext = useMemo(() => {
    if (!paymentModal) return null;
    const record = invoices.find((item) => item.id === paymentModal.recordId);
    if (!record) return null;
    const installment = record.factura.planPagos.items[paymentModal.itemIndex];
    if (!installment) return null;
    return { record, installment };
  }, [invoices, paymentModal]);

  const openPaymentModal = (recordId: string, itemIndex: number) => {
    setPaymentModal({ recordId, itemIndex });
    setPaymentForm({
      method: "Cash",
      transactionReference: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setSjSignatureSaved(false);
    setCustomerSignatureSaved(false);
  };

  const closePaymentModal = () => {
    setPaymentModal(null);
  };

  const submitPayment = () => {
    if (!paymentContext || !paymentModal) return;

    const { record, installment } = paymentContext;
    if (installment.estado === "PAGADA") return;

    if (!isElectronic && !customerSignatureSaved) return;
    if (!sjSignatureSaved) return;

    const paymentAmount = parseMoney(installment.valor);
    const nextFactura = recalcAfterPayment(record.factura, paymentAmount, paymentModal.itemIndex, paymentForm, {
      customer: !isElectronic ? customerSignatureSaved : false,
      sj: sjSignatureSaved,
    });

    onUpdateInvoice(record.id, nextFactura);
    closePaymentModal();
  };

  return (
    <div className="space-y-5 pb-6 text-slate-100">
      <section className="rounded-[30px] border border-slate-800 bg-[#050505] p-5 md:p-7 shadow-[0_0_0_1px_rgba(197,160,89,0.06),0_25px_50px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c5a059]">SJ Joyeros</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-white">Facturas Emitidas</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Centro de control de facturas emitidas para seguimiento de crédito y pagos.</p>
          </div>
          <Badge className="border-[#c5a059]/30 bg-[#c5a059]/10 text-[#e3c57f]">{invoices.length} facturas emitidas</Badge>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-800 bg-[#0a0a0a] p-4 md:p-6 space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Buscar factura</span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Número, cliente, documento o saldo"
            className="h-12 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none transition focus:border-[#c5a059]"
          />
        </label>

        <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-[#050505]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-black/50 text-[11px] uppercase tracking-[0.18em] text-[#c5a059]">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Factura N.°</th>
                  <th className="px-4 py-3 whitespace-nowrap">Cliente</th>
                  <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 whitespace-nowrap">Saldo pendiente</th>
                  <th className="px-4 py-3 whitespace-nowrap">Próximo vencimiento</th>
                  <th className="px-4 py-3 whitespace-nowrap">Cuotas restantes</th>
                  <th className="px-4 py-3 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">No hay facturas emitidas que coincidan con la búsqueda.</td>
                  </tr>
                ) : (
                  filtered.map((record) => {
                    const factura = record.factura;
                    const remaining = computeRemainingInstallments(factura.planPagos.items);
                    const nextDue = computeNextDueDate(factura.planPagos.items);

                    return (
                      <tr key={record.id}>
                        <td className="px-4 py-3 font-medium text-white">{factura.cabecera.numeroFactura}</td>
                        <td className="px-4 py-3">
                          <p>{getCustomerName(factura)}</p>
                          <p className="text-xs text-slate-500">{getCustomerDocument(factura)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusClass(factura.lifecycle.estado)}>{statusLabel(factura.lifecycle.estado)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">{factura.totales.saldoPendienteValor}</td>
                        <td className="px-4 py-3">{nextDue}</td>
                        <td className="px-4 py-3">{remaining}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2 md:flex-row">
                            <button type="button" onClick={() => setSelectedRecordId(record.id)} className="h-10 rounded-xl border border-slate-700 px-3 text-[11px] uppercase tracking-[0.14em] text-slate-200">
                              Ver factura
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const firstPendingIndex = factura.planPagos.items.findIndex((item) => item.estado !== "PAGADA");
                                if (firstPendingIndex >= 0) openPaymentModal(record.id, firstPendingIndex);
                              }}
                              disabled={remaining === 0}
                              className="h-10 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 text-[11px] uppercase tracking-[0.14em] text-[#e3c57f] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Registrar pago
                            </button>
                            {isMobilePdfActions ? (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (isGeneratingPdf || downloadLockRef.current) return;
                                    downloadLockRef.current = true;
                                    try {
                                      await onSavePdfMobile?.(factura);
                                    } finally {
                                      downloadLockRef.current = false;
                                    }
                                  }}
                                  disabled={isGeneratingPdf}
                                  className="h-10 rounded-xl bg-[#c5a059] px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isGeneratingPdf ? "Generando..." : "Guardar PDF"}
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (isGeneratingPdf || downloadLockRef.current) return;
                                    downloadLockRef.current = true;
                                    try {
                                      await onSharePdfMobile?.(factura);
                                    } finally {
                                      downloadLockRef.current = false;
                                    }
                                  }}
                                  disabled={isGeneratingPdf}
                                  className="h-10 rounded-xl border border-[#c5a059]/50 bg-transparent px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e3c57f] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isGeneratingPdf ? "Generando..." : "Compartir PDF"}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (isGeneratingPdf || downloadLockRef.current) return;
                                  downloadLockRef.current = true;
                                  try {
                                    await onDownloadPdf(factura);
                                  } finally {
                                    downloadLockRef.current = false;
                                  }
                                }}
                                disabled={isGeneratingPdf}
                                className="h-10 rounded-xl bg-[#c5a059] px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-black disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isGeneratingPdf ? "Generando PDF..." : "Descargar PDF actualizado"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedRecord ? (
        <section className="rounded-[28px] border border-slate-800 bg-[#0a0a0a] p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c5a059]">Ver factura</h2>
              <p className="mt-1 text-sm text-slate-400">Registro de factura en aplicación, solo lectura.</p>
            </div>
            <button type="button" onClick={() => setSelectedRecordId(null)} className="h-10 rounded-xl border border-slate-700 px-4 text-sm text-slate-200">Cerrar</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-[#050505] p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Número de factura</p>
              <p className="mt-1 text-sm text-white">{selectedRecord.factura.cabecera.numeroFactura}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#050505] p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Cliente</p>
              <p className="mt-1 text-sm text-white">{getCustomerName(selectedRecord.factura)}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#050505] p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Estado actual</p>
              <div className="mt-2"><Badge className={statusClass(selectedRecord.factura.lifecycle.estado)}>{statusLabel(selectedRecord.factura.lifecycle.estado)}</Badge></div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-[#050505] p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.16em] text-[#c5a059]">Productos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-2 py-2">Producto</th>
                    <th className="px-2 py-2">Referencia</th>
                    <th className="px-2 py-2">Cantidad</th>
                    <th className="px-2 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedRecord.factura.productos.items.map((item, index) => (
                    <tr key={`${item.numero}-${index}`}>
                      <td className="px-2 py-2">{item.producto}</td>
                      <td className="px-2 py-2">{item.referencia}</td>
                      <td className="px-2 py-2">{item.cantidad}</td>
                      <td className="px-2 py-2 text-right font-medium text-white">{item.valorTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-[#050505] p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.16em] text-[#c5a059]">Cuotas</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-2 py-2">Cuota</th>
                    <th className="px-2 py-2">Fecha acordada</th>
                    <th className="px-2 py-2 text-right">Valor</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">Fecha de pago</th>
                    <th className="px-2 py-2">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedRecord.factura.planPagos.items.map((item, index) => (
                    <tr key={`${item.cuota}-${index}`}>
                      <td className="px-2 py-2">{item.cuota}</td>
                      <td className="px-2 py-2">{item.fechaAcordada}</td>
                      <td className="px-2 py-2 text-right font-medium text-white">{item.valor}</td>
                      <td className="px-2 py-2">{item.estado}</td>
                      <td className="px-2 py-2">{item.fechaPago}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => openPaymentModal(selectedRecord.id, index)}
                          disabled={item.estado === "PAGADA"}
                          className="h-9 rounded-lg border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 text-[10px] uppercase tracking-[0.12em] text-[#e3c57f] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Registrar pago
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800 bg-[#050505] p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.16em] text-[#c5a059]">Historial de pagos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2 text-right">Valor</th>
                    <th className="px-2 py-2">Metodo</th>
                    <th className="px-2 py-2">Recibido por</th>
                    <th className="px-2 py-2">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedRecord.factura.historial.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-slate-500 italic">Aún no hay pagos registrados</td>
                    </tr>
                  ) : (
                    selectedRecord.factura.historial.items.map((item, index) => (
                      <tr key={`${item.fecha}-${index}`}>
                        <td className="px-2 py-2">{item.fecha}</td>
                        <td className="px-2 py-2 text-right font-medium text-white">{item.valor}</td>
                        <td className="px-2 py-2">{item.metodo}</td>
                        <td className="px-2 py-2">{item.recibidoPor}</td>
                        <td className="px-2 py-2">{item.observacion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090909] p-3 text-sm text-slate-300">
              Saldo pendiente: <strong className="text-white">{selectedRecord.factura.totales.saldoPendienteValor}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {paymentContext && paymentModal ? (
        <div className="fixed inset-0 z-50 bg-black/95 p-3 md:p-6 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-slate-800 bg-[#0b0b0b] p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#c5a059]">Registrar pago</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{paymentContext.record.factura.cabecera.numeroFactura} · Cuota {paymentContext.installment.cuota}</h3>
              </div>
              <button type="button" onClick={closePaymentModal} className="h-11 rounded-xl border border-slate-700 px-4 text-sm text-slate-200">
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-[#050505] p-3 text-sm">
                <p className="text-slate-400">Valor</p>
                <p className="mt-1 text-white font-semibold">{paymentContext.installment.valor}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#050505] p-3 text-sm">
                <p className="text-slate-400">Fecha de vencimiento</p>
                <p className="mt-1 text-white">{paymentContext.installment.fechaAcordada}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#050505] p-3 text-sm">
                <p className="text-slate-400">Fecha actual</p>
                <p className="mt-1 text-white">{formatDateEs(new Date())}</p>
              </div>
              <label className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#050505] p-3">
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Fecha</span>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Método de pago</span>
                <select
                  value={paymentForm.method}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, method: event.target.value as PaymentMethod }))}
                  className="h-12 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none"
                >
                  <option value="Cash">Efectivo</option>
                  <option value="Bank Transfer">Transferencia bancaria</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                  <option value="Other">Otro</option>
                </select>
              </label>

              {isElectronic ? (
                <label className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Referencia</span>
                  <input
                    type="text"
                    value={paymentForm.transactionReference}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, transactionReference: event.target.value }))}
                    placeholder="Número de transacción"
                    className="h-11 rounded-xl border border-slate-700 bg-[#070707] px-3 text-sm text-slate-100 outline-none"
                  />
                </label>
              ) : null}

              {isElectronic ? (
                <div className="md:col-span-2 rounded-xl border border-dashed border-slate-700 bg-[#070707] p-3 text-sm text-slate-400">
                  Carga opcional de comprobante (preparado para próxima fase)
                </div>
              ) : null}

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300">Observaciones</span>
                <textarea
                  rows={3}
                  value={paymentForm.notes}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="rounded-xl border border-slate-700 bg-[#070707] px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {!isElectronic ? (
                <SignaturePad
                  title="Firma del cliente"
                  saveLabel="Guardar firma cliente"
                  clearLabel="Limpiar"
                  onSave={(dataUrl) => {
                    if (!dataUrl) return;
                    setCustomerSignatureSaved(true);
                  }}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-[#050505] p-4 text-sm text-slate-400">
                  Pago electrónico seleccionado. La firma del cliente no es obligatoria.
                </div>
              )}

              <SignaturePad
                title="Firma SJ Joyeros"
                saveLabel="Guardar firma SJ"
                clearLabel="Limpiar"
                onSave={(dataUrl) => {
                  if (!dataUrl) return;
                  setSjSignatureSaved(true);
                }}
              />
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-[#050505] p-3 text-sm text-slate-300">
              {!isElectronic ? (
                <p>Requisito para confirmar: firma del cliente y firma de SJ Joyeros.</p>
              ) : (
                <p>Requisito para confirmar: firma de SJ Joyeros y datos de la transacción.</p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={submitPayment}
                disabled={!sjSignatureSaved || (!isElectronic && !customerSignatureSaved)}
                className="h-12 rounded-2xl bg-[#c5a059] text-sm font-semibold uppercase tracking-[0.18em] text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar pago
              </button>
              <button type="button" onClick={closePaymentModal} className="h-12 rounded-2xl border border-slate-700 bg-[#111111] text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
