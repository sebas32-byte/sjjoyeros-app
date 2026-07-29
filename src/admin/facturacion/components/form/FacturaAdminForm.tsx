import React, { Dispatch, ReactNode, SetStateAction } from "react";
import { Factura } from "../../types/factura.types";

interface FacturaAdminFormProps {
  factura: Factura;
  setFactura: Dispatch<SetStateAction<Factura>>;
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function FieldInput({ label, value, onChange }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700">{title}</h3>
      {children}
    </section>
  );
}

export function FacturaAdminForm({ factura, setFactura }: FacturaAdminFormProps) {
  const updateEmpresa = (key: keyof Factura["empresa"], value: string) => {
    setFactura((prev) => ({
      ...prev,
      empresa: {
        ...prev.empresa,
        [key]: value,
      },
    }));
  };

  const updateCabecera = (key: keyof Factura["cabecera"], value: string) => {
    setFactura((prev) => ({
      ...prev,
      cabecera: {
        ...prev.cabecera,
        [key]: value,
      },
    }));
  };

  const updateClienteCampo = (index: number, key: "label" | "value", value: string) => {
    setFactura((prev) => {
      const campos = [...prev.cliente.campos];
      campos[index] = { ...campos[index], [key]: value };
      return {
        ...prev,
        cliente: {
          ...prev.cliente,
          campos,
        },
      };
    });
  };

  const updateVentaCampo = (index: number, key: "label" | "value", value: string) => {
    setFactura((prev) => {
      const campos = [...prev.venta.campos];
      campos[index] = { ...campos[index], [key]: value };
      return {
        ...prev,
        venta: {
          ...prev.venta,
          campos,
        },
      };
    });
  };

  const updateProductosColumna = (index: number, value: string) => {
    setFactura((prev) => {
      const columnas = [...prev.productos.columnas];
      columnas[index] = value;
      return {
        ...prev,
        productos: {
          ...prev.productos,
          columnas,
        },
      };
    });
  };

  const updateProductoItem = (
    index: number,
    key: keyof Factura["productos"]["items"][number],
    value: string,
  ) => {
    setFactura((prev) => {
      const items = [...prev.productos.items];
      items[index] = { ...items[index], [key]: value };
      return {
        ...prev,
        productos: {
          ...prev.productos,
          items,
        },
      };
    });
  };

  const updateTotales = (key: keyof Factura["totales"], value: string) => {
    setFactura((prev) => ({
      ...prev,
      totales: {
        ...prev.totales,
        [key]: value,
      },
    }));
  };

  const updatePlanPagoColumna = (index: number, value: string) => {
    setFactura((prev) => {
      const columnas = [...prev.planPagos.columnas];
      columnas[index] = value;
      return {
        ...prev,
        planPagos: {
          ...prev.planPagos,
          columnas,
        },
      };
    });
  };

  const updatePlanPagoItem = (
    index: number,
    key: keyof Factura["planPagos"]["items"][number],
    value: string,
  ) => {
    setFactura((prev) => {
      const items = [...prev.planPagos.items];
      items[index] = { ...items[index], [key]: value };
      return {
        ...prev,
        planPagos: {
          ...prev.planPagos,
          items,
        },
      };
    });
  };

  const updateHistorialColumna = (index: number, value: string) => {
    setFactura((prev) => {
      const columnas = [...prev.historial.columnas];
      columnas[index] = value;
      return {
        ...prev,
        historial: {
          ...prev.historial,
          columnas,
        },
      };
    });
  };

  const updateHistorialItem = (
    index: number,
    key: keyof Factura["historial"]["items"][number],
    value: string,
  ) => {
    setFactura((prev) => {
      const items = [...prev.historial.items];
      items[index] = { ...items[index], [key]: value };
      return {
        ...prev,
        historial: {
          ...prev.historial,
          items,
        },
      };
    });
  };

  const updateModal = (key: keyof Factura["credito"]["modalPago"], value: string) => {
    setFactura((prev) => ({
      ...prev,
      credito: {
        ...prev.credito,
        modalPago: {
          ...prev.credito.modalPago,
          [key]: value,
        },
      },
    }));
  };

  const updateMetodoPago = (index: number, value: string) => {
    setFactura((prev) => {
      const metodos = [...prev.credito.modalPago.metodos];
      metodos[index] = value;
      return {
        ...prev,
        credito: {
          ...prev.credito,
          modalPago: {
            ...prev.credito.modalPago,
            metodos,
          },
        },
      };
    });
  };

  return (
    <div className="space-y-4">
      <Section title="Empresa">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="Marca nombre" value={factura.empresa.marcaNombre} onChange={(value) => updateEmpresa("marcaNombre", value)} />
          <FieldInput label="Marca subtitulo" value={factura.empresa.marcaSubtitulo} onChange={(value) => updateEmpresa("marcaSubtitulo", value)} />
          <FieldInput label="Marca slogan" value={factura.empresa.marcaSlogan} onChange={(value) => updateEmpresa("marcaSlogan", value)} />
          <FieldInput label="Instagram" value={factura.empresa.instagram} onChange={(value) => updateEmpresa("instagram", value)} />
          <FieldInput label="Telefono" value={factura.empresa.telefono} onChange={(value) => updateEmpresa("telefono", value)} />
          <FieldInput label="Direccion" value={factura.empresa.direccion} onChange={(value) => updateEmpresa("direccion", value)} />
          <FieldInput label="Horario" value={factura.empresa.horario} onChange={(value) => updateEmpresa("horario", value)} />
          <FieldInput label="QR titulo" value={factura.empresa.qrTitulo} onChange={(value) => updateEmpresa("qrTitulo", value)} />
          <FieldInput label="QR subtitulo" value={factura.empresa.qrSubtitulo} onChange={(value) => updateEmpresa("qrSubtitulo", value)} />
          <FieldInput label="Footer marca" value={factura.empresa.footerMarca} onChange={(value) => updateEmpresa("footerMarca", value)} />
          <FieldInput label="NIT" value={factura.empresa.nit} onChange={(value) => updateEmpresa("nit", value)} />
        </div>
      </Section>

      <Section title="Cabecera">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="Titulo documento" value={factura.cabecera.tituloDocumento} onChange={(value) => updateCabecera("tituloDocumento", value)} />
          <FieldInput label="Numero factura" value={factura.cabecera.numeroFactura} onChange={(value) => updateCabecera("numeroFactura", value)} />
          <FieldInput label="Fecha label" value={factura.cabecera.fechaLabel} onChange={(value) => updateCabecera("fechaLabel", value)} />
          <FieldInput label="Fecha valor" value={factura.cabecera.fechaValor} onChange={(value) => updateCabecera("fechaValor", value)} />
          <FieldInput label="Hora label" value={factura.cabecera.horaLabel} onChange={(value) => updateCabecera("horaLabel", value)} />
          <FieldInput label="Hora valor" value={factura.cabecera.horaValor} onChange={(value) => updateCabecera("horaValor", value)} />
          <FieldInput label="Credito label" value={factura.cabecera.creditoLabel} onChange={(value) => updateCabecera("creditoLabel", value)} />
          <FieldInput label="Credito valor" value={factura.cabecera.creditoValor} onChange={(value) => updateCabecera("creditoValor", value)} />
        </div>
      </Section>

      <Section title="Cliente">
        <FieldInput
          label="Titulo cliente"
          value={factura.cliente.titulo}
          onChange={(value) => setFactura((prev) => ({ ...prev, cliente: { ...prev.cliente, titulo: value } }))}
        />
        {factura.cliente.campos.map((campo, index) => (
          <div key={`cliente-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FieldInput label={`Campo ${index + 1} label`} value={campo.label} onChange={(value) => updateClienteCampo(index, "label", value)} />
            <FieldInput label={`Campo ${index + 1} valor`} value={campo.value} onChange={(value) => updateClienteCampo(index, "value", value)} />
          </div>
        ))}
      </Section>

      <Section title="Venta y agradecimiento">
        <FieldInput
          label="Titulo venta"
          value={factura.venta.titulo}
          onChange={(value) => setFactura((prev) => ({ ...prev, venta: { ...prev.venta, titulo: value } }))}
        />
        {factura.venta.campos.map((campo, index) => (
          <div key={`venta-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FieldInput label={`Campo ${index + 1} label`} value={campo.label} onChange={(value) => updateVentaCampo(index, "label", value)} />
            <FieldInput label={`Campo ${index + 1} valor`} value={campo.value} onChange={(value) => updateVentaCampo(index, "value", value)} />
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput
            label="Observacion label"
            value={factura.venta.observacionLabel}
            onChange={(value) => setFactura((prev) => ({ ...prev, venta: { ...prev.venta, observacionLabel: value } }))}
          />
          <FieldInput
            label="Observacion valor"
            value={factura.venta.observacionValor}
            onChange={(value) => setFactura((prev) => ({ ...prev, venta: { ...prev.venta, observacionValor: value } }))}
          />
          <FieldInput
            label="Agradecimiento titulo"
            value={factura.agradecimiento.titulo}
            onChange={(value) => setFactura((prev) => ({ ...prev, agradecimiento: { ...prev.agradecimiento, titulo: value } }))}
          />
          <FieldInput
            label="Agradecimiento mensaje"
            value={factura.agradecimiento.mensaje}
            onChange={(value) => setFactura((prev) => ({ ...prev, agradecimiento: { ...prev.agradecimiento, mensaje: value } }))}
          />
        </div>
      </Section>

      <Section title="Productos">
        <FieldInput
          label="Titulo productos"
          value={factura.productos.titulo}
          onChange={(value) => setFactura((prev) => ({ ...prev, productos: { ...prev.productos, titulo: value } }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {factura.productos.columnas.map((columna, index) => (
            <FieldInput key={`col-producto-${index}`} label={`Columna ${index + 1}`} value={columna} onChange={(value) => updateProductosColumna(index, value)} />
          ))}
        </div>
        {factura.productos.items.map((item, index) => (
          <div key={`item-producto-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
            <FieldInput label="Numero" value={item.numero} onChange={(value) => updateProductoItem(index, "numero", value)} />
            <FieldInput label="Producto" value={item.producto} onChange={(value) => updateProductoItem(index, "producto", value)} />
            <FieldInput label="Material" value={item.material} onChange={(value) => updateProductoItem(index, "material", value)} />
            <FieldInput label="Referencia" value={item.referencia} onChange={(value) => updateProductoItem(index, "referencia", value)} />
            <FieldInput label="Cantidad" value={item.cantidad} onChange={(value) => updateProductoItem(index, "cantidad", value)} />
            <FieldInput label="Valor unitario" value={item.valorUnitario} onChange={(value) => updateProductoItem(index, "valorUnitario", value)} />
            <FieldInput label="Valor total" value={item.valorTotal} onChange={(value) => updateProductoItem(index, "valorTotal", value)} />
          </div>
        ))}
        <FieldInput
          label="Nota pie"
          value={factura.productos.notaPie}
          onChange={(value) => setFactura((prev) => ({ ...prev, productos: { ...prev.productos, notaPie: value } }))}
        />
      </Section>

      <Section title="Totales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="Tipo venta label" value={factura.totales.tipoVentaLabel} onChange={(value) => updateTotales("tipoVentaLabel", value)} />
          <FieldInput label="Tipo venta valor" value={factura.totales.tipoVentaValor} onChange={(value) => updateTotales("tipoVentaValor", value)} />
          <FieldInput label="Subtotal label" value={factura.totales.subtotalLabel} onChange={(value) => updateTotales("subtotalLabel", value)} />
          <FieldInput label="Subtotal valor" value={factura.totales.subtotalValor} onChange={(value) => updateTotales("subtotalValor", value)} />
          <FieldInput label="Descuento label" value={factura.totales.descuentoLabel} onChange={(value) => updateTotales("descuentoLabel", value)} />
          <FieldInput label="Descuento valor" value={factura.totales.descuentoValor} onChange={(value) => updateTotales("descuentoValor", value)} />
          <FieldInput label="Envio label" value={factura.totales.envioLabel} onChange={(value) => updateTotales("envioLabel", value)} />
          <FieldInput label="Envio valor" value={factura.totales.envioValor} onChange={(value) => updateTotales("envioValor", value)} />
          <FieldInput label="Total label" value={factura.totales.totalLabel} onChange={(value) => updateTotales("totalLabel", value)} />
          <FieldInput label="Total valor" value={factura.totales.totalValor} onChange={(value) => updateTotales("totalValor", value)} />
          <FieldInput label="Saldo inicial label" value={factura.totales.saldoInicialLabel} onChange={(value) => updateTotales("saldoInicialLabel", value)} />
          <FieldInput label="Saldo inicial valor" value={factura.totales.saldoInicialValor} onChange={(value) => updateTotales("saldoInicialValor", value)} />
          <FieldInput label="Saldo pendiente label" value={factura.totales.saldoPendienteLabel} onChange={(value) => updateTotales("saldoPendienteLabel", value)} />
          <FieldInput label="Saldo pendiente valor" value={factura.totales.saldoPendienteValor} onChange={(value) => updateTotales("saldoPendienteValor", value)} />
        </div>
      </Section>

      <Section title="Plan de pagos">
        <FieldInput
          label="Titulo plan pagos"
          value={factura.planPagos.titulo}
          onChange={(value) => setFactura((prev) => ({ ...prev, planPagos: { ...prev.planPagos, titulo: value } }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {factura.planPagos.columnas.map((columna, index) => (
            <FieldInput key={`col-plan-${index}`} label={`Columna ${index + 1}`} value={columna} onChange={(value) => updatePlanPagoColumna(index, value)} />
          ))}
        </div>
        {factura.planPagos.items.map((item, index) => (
          <div key={`item-plan-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
            <FieldInput label="Cuota" value={item.cuota} onChange={(value) => updatePlanPagoItem(index, "cuota", value)} />
            <FieldInput label="Fecha acordada" value={item.fechaAcordada} onChange={(value) => updatePlanPagoItem(index, "fechaAcordada", value)} />
            <FieldInput label="Valor" value={item.valor} onChange={(value) => updatePlanPagoItem(index, "valor", value)} />
            <FieldInput label="Estado" value={item.estado} onChange={(value) => updatePlanPagoItem(index, "estado", value)} />
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Clase estado</span>
              <select
                value={item.estadoClase}
                onChange={(event) => updatePlanPagoItem(index, "estadoClase", event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="badge-pending">badge-pending</option>
                <option value="badge-paid">badge-paid</option>
              </select>
            </label>
            <FieldInput label="Fecha pago" value={item.fechaPago} onChange={(value) => updatePlanPagoItem(index, "fechaPago", value)} />
            <FieldInput label="Firma cliente" value={item.firmaCliente} onChange={(value) => updatePlanPagoItem(index, "firmaCliente", value)} />
            <FieldInput label="Firma SJ" value={item.firmaSJ} onChange={(value) => updatePlanPagoItem(index, "firmaSJ", value)} />
          </div>
        ))}
      </Section>

      <Section title="Historial">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {factura.historial.columnas.map((columna, index) => (
            <FieldInput key={`col-hist-${index}`} label={`Columna ${index + 1}`} value={columna} onChange={(value) => updateHistorialColumna(index, value)} />
          ))}
        </div>
        {factura.historial.items.map((item, index) => (
          <div key={`item-hist-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
            <FieldInput label="Fecha" value={item.fecha} onChange={(value) => updateHistorialItem(index, "fecha", value)} />
            <FieldInput label="Valor" value={item.valor} onChange={(value) => updateHistorialItem(index, "valor", value)} />
            <FieldInput label="Metodo" value={item.metodo} onChange={(value) => updateHistorialItem(index, "metodo", value)} />
            <FieldInput label="Recibido por" value={item.recibidoPor} onChange={(value) => updateHistorialItem(index, "recibidoPor", value)} />
            <FieldInput label="Observacion" value={item.observacion} onChange={(value) => updateHistorialItem(index, "observacion", value)} />
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput
            label="Mensaje vacio"
            value={factura.historial.mensajeVacio}
            onChange={(value) => setFactura((prev) => ({ ...prev, historial: { ...prev.historial, mensajeVacio: value } }))}
          />
          <FieldInput
            label="Boton registrar"
            value={factura.historial.botonRegistrarPago}
            onChange={(value) => setFactura((prev) => ({ ...prev, historial: { ...prev.historial, botonRegistrarPago: value } }))}
          />
        </div>
      </Section>

      <Section title="Modal de pago y textos finales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="Modal titulo" value={factura.credito.modalPago.titulo} onChange={(value) => updateModal("titulo", value)} />
          <FieldInput label="Monto label" value={factura.credito.modalPago.montoLabel} onChange={(value) => updateModal("montoLabel", value)} />
          <FieldInput label="Metodo label" value={factura.credito.modalPago.metodoLabel} onChange={(value) => updateModal("metodoLabel", value)} />
          <FieldInput label="Fecha label" value={factura.credito.modalPago.fechaLabel} onChange={(value) => updateModal("fechaLabel", value)} />
          <FieldInput label="Observacion label" value={factura.credito.modalPago.observacionLabel} onChange={(value) => updateModal("observacionLabel", value)} />
          <FieldInput label="Firma label" value={factura.credito.modalPago.firmaLabel} onChange={(value) => updateModal("firmaLabel", value)} />
          <FieldInput label="Limpiar firma" value={factura.credito.modalPago.limpiarFirmaLabel} onChange={(value) => updateModal("limpiarFirmaLabel", value)} />
          <FieldInput label="Boton guardar" value={factura.credito.modalPago.botonGuardarLabel} onChange={(value) => updateModal("botonGuardarLabel", value)} />
        </div>
        {factura.credito.modalPago.metodos.map((metodo, index) => (
          <FieldInput key={`metodo-${index}`} label={`Metodo ${index + 1}`} value={metodo} onChange={(value) => updateMetodoPago(index, value)} />
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput
            label="Observaciones titulo"
            value={factura.observaciones.titulo}
            onChange={(value) => setFactura((prev) => ({ ...prev, observaciones: { ...prev.observaciones, titulo: value } }))}
          />
          <FieldInput
            label="Garantia titulo"
            value={factura.garantia.titulo}
            onChange={(value) => setFactura((prev) => ({ ...prev, garantia: { ...prev.garantia, titulo: value } }))}
          />
          <FieldInput
            label="Garantia texto"
            value={factura.garantia.texto}
            onChange={(value) => setFactura((prev) => ({ ...prev, garantia: { ...prev.garantia, texto: value } }))}
          />
          <FieldInput
            label="Firma cliente label"
            value={factura.firmas.firmaClienteLabel}
            onChange={(value) => setFactura((prev) => ({ ...prev, firmas: { ...prev.firmas, firmaClienteLabel: value } }))}
          />
          <FieldInput
            label="Firma cliente documento"
            value={factura.firmas.firmaClienteDocumento}
            onChange={(value) => setFactura((prev) => ({ ...prev, firmas: { ...prev.firmas, firmaClienteDocumento: value } }))}
          />
          <FieldInput
            label="Firma empresa label"
            value={factura.firmas.firmaEmpresaLabel}
            onChange={(value) => setFactura((prev) => ({ ...prev, firmas: { ...prev.firmas, firmaEmpresaLabel: value } }))}
          />
          <FieldInput
            label="Firma empresa detalle"
            value={factura.firmas.firmaEmpresaDetalle}
            onChange={(value) => setFactura((prev) => ({ ...prev, firmas: { ...prev.firmas, firmaEmpresaDetalle: value } }))}
          />
        </div>
      </Section>
    </div>
  );
}
