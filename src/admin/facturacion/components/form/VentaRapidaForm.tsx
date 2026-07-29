import React, { Dispatch, ReactNode, SetStateAction } from "react";
import { Factura, FacturaProducto } from "../../types/factura.types";

interface VentaRapidaFormProps {
  factura: Factura;
  setFactura: Dispatch<SetStateAction<Factura>>;
  onGuardar: () => void;
  onDescargarPdf: () => void;
  isGeneratingPdf: boolean;
  isGuardada: boolean;
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TextInput({ label, value, onChange, placeholder }: InputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.12em] text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-[#c5a059]"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#c5a059]">{title}</h2>
      {children}
    </section>
  );
}

const emptyProduct = (): FacturaProducto => ({
  numero: "",
  imagen: "",
  producto: "",
  material: "",
  referencia: "",
  cantidad: "",
  valorUnitario: "",
  valorTotal: "",
});

export function VentaRapidaForm({
  factura,
  setFactura,
  onGuardar,
  onDescargarPdf,
  isGeneratingPdf,
  isGuardada,
}: VentaRapidaFormProps) {
  const setCliente = (index: number, value: string) => {
    setFactura((prev) => {
      const campos = [...prev.cliente.campos];
      campos[index] = { ...campos[index], value };
      return { ...prev, cliente: { ...prev.cliente, campos } };
    });
  };

  const setProducto = (
    index: number,
    key: keyof Factura["productos"]["items"][number],
    value: string,
  ) => {
    setFactura((prev) => {
      const items = [...prev.productos.items];
      items[index] = { ...items[index], [key]: value };
      items[index].numero = String(index + 1);
      return { ...prev, productos: { ...prev.productos, items } };
    });
  };

  const addProducto = () => {
    setFactura((prev) => ({
      ...prev,
      productos: {
        ...prev.productos,
        items: [...prev.productos.items, { ...emptyProduct(), numero: String(prev.productos.items.length + 1) }],
      },
    }));
  };

  const removeProducto = (index: number) => {
    setFactura((prev) => {
      const items = prev.productos.items.filter((_, itemIndex) => itemIndex !== index);
      const normalized = items.length > 0 ? items.map((item, itemIndex) => ({ ...item, numero: String(itemIndex + 1) })) : [{ ...emptyProduct(), numero: "1" }];
      return { ...prev, productos: { ...prev.productos, items: normalized } };
    });
  };

  const setTotales = (key: keyof Factura["totales"], value: string) => {
    setFactura((prev) => ({ ...prev, totales: { ...prev.totales, [key]: value } }));
  };

  return (
    <div className="space-y-4 pb-6">
      <header className="rounded-2xl border border-slate-800 bg-[#090909] p-5">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Panel de ventas</h1>
        <p className="mt-1 text-sm text-slate-400">Captura rapida de factura sin abrir la plantilla.</p>
      </header>

      <Section title="1. Datos del cliente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput label={factura.cliente.campos[0]?.label || "Nombre"} value={factura.cliente.campos[0]?.value || ""} onChange={(value) => setCliente(0, value)} />
          <TextInput label={factura.cliente.campos[1]?.label || "Cedula"} value={factura.cliente.campos[1]?.value || ""} onChange={(value) => setCliente(1, value)} />
          <TextInput label={factura.cliente.campos[2]?.label || "Telefono"} value={factura.cliente.campos[2]?.value || ""} onChange={(value) => setCliente(2, value)} />
          <TextInput label={factura.cliente.campos[3]?.label || "Direccion"} value={factura.cliente.campos[3]?.value || ""} onChange={(value) => setCliente(3, value)} />
          <div className="md:col-span-2">
            <TextInput label={factura.cliente.campos[4]?.label || "Ciudad"} value={factura.cliente.campos[4]?.value || ""} onChange={(value) => setCliente(4, value)} />
          </div>
        </div>
      </Section>

      <Section title="2. Productos">
        <div className="space-y-3">
          {factura.productos.items.map((producto, index) => (
            <div key={`producto-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-slate-300">Producto #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeProducto(index)}
                  className="h-8 rounded-md border border-slate-600 px-3 text-xs text-slate-300"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextInput label="Producto" value={producto.producto} onChange={(value) => setProducto(index, "producto", value)} />
                <TextInput label="Material" value={producto.material} onChange={(value) => setProducto(index, "material", value)} />
                <TextInput label="Referencia" value={producto.referencia} onChange={(value) => setProducto(index, "referencia", value)} />
                <TextInput label="Cantidad" value={producto.cantidad} onChange={(value) => setProducto(index, "cantidad", value)} />
                <TextInput label="Valor unitario" value={producto.valorUnitario} onChange={(value) => setProducto(index, "valorUnitario", value)} />
                <TextInput label="Valor total" value={producto.valorTotal} onChange={(value) => setProducto(index, "valorTotal", value)} />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addProducto}
          className="w-full h-12 rounded-xl bg-[#c5a059] text-black font-semibold text-sm uppercase tracking-[0.12em]"
        >
          Agregar producto
        </button>
      </Section>

      <Section title="3. Credito">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput label="Fecha" value={factura.cabecera.fechaValor} onChange={(value) => setFactura((prev) => ({ ...prev, cabecera: { ...prev.cabecera, fechaValor: value } }))} />
          <TextInput label="Hora" value={factura.cabecera.horaValor} onChange={(value) => setFactura((prev) => ({ ...prev, cabecera: { ...prev.cabecera, horaValor: value } }))} />
          <TextInput label="Numero factura" value={factura.cabecera.numeroFactura} onChange={(value) => setFactura((prev) => ({ ...prev, cabecera: { ...prev.cabecera, numeroFactura: value } }))} />
          <TextInput label="Fecha vencimiento" value={factura.venta.campos[2]?.value || ""} onChange={(value) => {
            setFactura((prev) => {
              const campos = [...prev.venta.campos];
              campos[2] = { ...campos[2], value };
              return { ...prev, venta: { ...prev.venta, campos } };
            });
          }} />
          <TextInput label="Subtotal" value={factura.totales.subtotalValor} onChange={(value) => setTotales("subtotalValor", value)} />
          <TextInput label="Descuento" value={factura.totales.descuentoValor} onChange={(value) => setTotales("descuentoValor", value)} />
          <TextInput label="Envio" value={factura.totales.envioValor} onChange={(value) => setTotales("envioValor", value)} />
          <TextInput label="Total" value={factura.totales.totalValor} onChange={(value) => setTotales("totalValor", value)} />
          <TextInput label="Saldo inicial" value={factura.totales.saldoInicialValor} onChange={(value) => setTotales("saldoInicialValor", value)} />
          <TextInput label="Saldo pendiente" value={factura.totales.saldoPendienteValor} onChange={(value) => setTotales("saldoPendienteValor", value)} />
        </div>
      </Section>

      <Section title="4. Observaciones">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-300">Observacion de venta</span>
          <textarea
            value={factura.venta.observacionValor}
            onChange={(event) => setFactura((prev) => ({ ...prev, venta: { ...prev.venta, observacionValor: event.target.value } }))}
            rows={4}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#c5a059]"
          />
        </label>
      </Section>

      <Section title="5. Firma del cliente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            label="Nombre firma cliente"
            value={factura.firmas.firmaClienteLabel}
            onChange={(value) => setFactura((prev) => ({ ...prev, firmas: { ...prev.firmas, firmaClienteLabel: value } }))}
          />
          <TextInput
            label="Documento"
            value={factura.firmas.firmaClienteDocumento}
            onChange={(value) => setFactura((prev) => ({ ...prev, firmas: { ...prev.firmas, firmaClienteDocumento: value } }))}
          />
        </div>
      </Section>

      <Section title="6 y 7. Guardar y descargar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onGuardar}
            className="h-12 rounded-xl border border-slate-600 bg-slate-950 text-slate-100 font-semibold uppercase tracking-[0.12em]"
          >
            Guardar factura
          </button>

          <button
            type="button"
            onClick={onDescargarPdf}
            disabled={isGeneratingPdf}
            className="h-12 rounded-xl bg-[#c5a059] text-black font-semibold uppercase tracking-[0.12em] disabled:opacity-60"
          >
            {isGeneratingPdf ? "Generando PDF..." : "Descargar PDF"}
          </button>
        </div>
        {isGuardada && <p className="text-sm text-emerald-400">Factura preparada para exportacion.</p>}
      </Section>
    </div>
  );
}
