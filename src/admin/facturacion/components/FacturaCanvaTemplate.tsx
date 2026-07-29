import "../assets/styles/invoice-reference.css";
import React from "react";
import { Factura } from "../types/factura.types";
import { DiamondIcon } from "./common/DiamondIcon";
import { InvoiceContainer } from "./layout/InvoiceContainer";

interface FacturaCanvaTemplateProps {
  factura: Factura;
}

export function FacturaCanvaTemplate({ factura }: FacturaCanvaTemplateProps) {
  const logoSjJoyeros = new URL("../assets/logo-sj-joyeros.svg", import.meta.url).href;
  const firmaEmpresaDetalle = [factura.firmas.firmaEmpresaDetalle, factura.empresa.nit]
    .filter((value) => value.trim().length > 0)
    .join(" ");

  return (
    <InvoiceContainer>
      <header data-template-id="header-section" className="canva-header bg-lux-black px-8 py-8 relative">
        <div className="flex items-center justify-between gap-4">
          <div className="w-[162px]">
            <img src={logoSjJoyeros} alt="SJ Joyeros" className="block h-auto w-full select-none" draggable={false} />
          </div>

          <div className="flex flex-col items-center justify-center">
            <DiamondIcon className="w-10 h-10 text-gold mb-2 self-center" />
            <h2 className="canva-text font-luxury text-gold uppercase leading-none" style={{ fontSize: "35px", fontWeight: 300, letterSpacing: "0.24em" }}>
              {factura.cabecera.tituloDocumento}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 w-full justify-center">
              <div className="w-10 h-[1px]" style={{ background: "rgba(197,160,89,0.4)" }} />
              <p className="canva-text text-white font-mono tracking-wider text-center leading-none" style={{ fontSize: "14px", fontWeight: 500 }}>
                {factura.cabecera.numeroFactura}
              </p>
              <div className="w-10 h-[1px]" style={{ background: "rgba(197,160,89,0.4)" }} />
            </div>
          </div>

          <div className="flex flex-col items-start gap-3.5 text-left border-l pl-6 pr-8 py-1.5" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
            <div className="flex items-center gap-2.5 min-h-[28px]">
              <i data-lucide="calendar" className="w-4 h-4 text-gold self-center" style={{ strokeWidth: "1.2px" }} />
              <div className="flex flex-col justify-center leading-[1.25]">
                <span className="canva-text uppercase tracking-wider leading-none" style={{ fontSize: "8.5px", fontWeight: 500 }}>
                  {factura.cabecera.fechaLabel}
                </span>
                <span className="text-white leading-[1.2]" style={{ fontSize: "11px", fontWeight: 400 }}>
                  {factura.cabecera.fechaValor}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-h-[28px]">
              <i data-lucide="clock" className="w-4 h-4 text-gold self-center" style={{ strokeWidth: "1.2px" }} />
              <div className="flex flex-col justify-center leading-[1.25]">
                <span className="canva-text uppercase tracking-wider leading-none" style={{ fontSize: "8.5px", fontWeight: 500 }}>
                  {factura.cabecera.horaLabel}
                </span>
                <span className="text-white leading-[1.2]" style={{ fontSize: "11px", fontWeight: 400 }}>
                  {factura.cabecera.horaValor}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 min-h-[28px]">
              <i data-lucide="briefcase" className="w-4 h-4 text-gold self-center" style={{ strokeWidth: "1.2px" }} />
              <div className="flex flex-col justify-center leading-[1.25]">
                <span className="canva-text uppercase tracking-wider leading-none" style={{ fontSize: "8.5px", fontWeight: 500 }}>
                  {factura.cabecera.creditoLabel}
                </span>
                <span className="canva-text text-white leading-[1.2]" style={{ fontSize: "11px", fontWeight: 400 }}>
                  {factura.cabecera.creditoValor}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "var(--gold)" }} />
      </header>

      <div className="h-1.5 bg-white" />

      <div className="grid grid-cols-5 gap-0 bg-white">
        <div data-template-id="customer-card" className="canva-card col-span-2 border-b border-r p-5 bg-white" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
          <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
            <i data-lucide="user" className="w-4 h-4 text-gold" style={{ strokeWidth: "1.2px" }} />
            <h3 className="canva-text section-title">{factura.cliente.titulo}</h3>
          </div>
          <div className="space-y-1.5 text-gray-800" style={{ fontSize: "11.2px", lineHeight: 1.58 }}>
            {factura.cliente.campos.map((campo, index) => (
              <div key={`${campo.label}-${index}`} className="pt-0.5">
                <div className="grid grid-cols-[96px_1fr] items-center gap-x-2 min-h-[18px] leading-[1.55]">
                  <span className="font-medium text-gray-500 text-left">{campo.label}</span>
                  <span className="text-gray-900 leading-[1.55] text-left">{campo.value}</span>
                </div>
                <div className="mt-1.5 h-px w-full" style={{ background: "rgba(197,160,89,0.24)" }} />
              </div>
            ))}
          </div>
        </div>

        <div data-template-id="purchase-card" className="canva-card col-span-2 border-b border-r p-5 bg-white" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
          <div className="flex items-center gap-2 border-b pb-2 mb-4" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
            <i data-lucide="shopping-bag" className="w-4 h-4 text-gold" style={{ strokeWidth: "1.2px" }} />
            <h3 className="canva-text section-title">{factura.venta.titulo}</h3>
          </div>
          <div className="space-y-1.5 text-gray-800" style={{ fontSize: "11.2px", lineHeight: 1.58 }}>
            {factura.venta.campos.map((campo, index) => (
              <div key={`${campo.label}-${index}`} className="pt-0.5">
                <div className="grid grid-cols-[132px_1fr] items-center gap-x-2 min-h-[18px] leading-[1.55]">
                  <span className="font-medium text-gray-500 text-left">{campo.label}</span>
                  <span className={`leading-[1.55] text-left ${campo.valueClassName ?? "text-gray-900"}`}>{campo.value}</span>
                </div>
                <div className="mt-1.5 h-px w-full" style={{ background: "rgba(197,160,89,0.24)" }} />
              </div>
            ))}
            <div className="pt-0.5">
              <div className="grid grid-cols-[132px_1fr] items-start gap-x-2 min-h-[18px] leading-[1.58]">
                <span className="font-medium text-gray-500 text-left">{factura.venta.observacionLabel}</span>
                <p className="text-gray-900 italic text-[10.5px] leading-[1.58] text-left">{factura.venta.observacionValor}</p>
              </div>
              <div className="mt-1.5 h-px w-full" style={{ background: "rgba(197,160,89,0.24)" }} />
            </div>
          </div>
        </div>

        <div data-template-id="thankyou-card" className="canva-card col-span-1 border-b bg-lux-black p-5 flex flex-col items-center justify-center text-center" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
          <DiamondIcon className="w-7 h-7 text-gold mb-3 self-center" />
          <h3 className="canva-text font-luxury text-gold italic" style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.05em", lineHeight: 1.4 }}>
            {factura.agradecimiento.titulo}
          </h3>
          <div className="w-8 h-[1px] my-2.5" style={{ background: "rgba(197,160,89,0.3)" }} />
          <p className="canva-text font-light italic" style={{ fontSize: "9.5px", lineHeight: 1.5 }}>
            {factura.agradecimiento.mensaje}
          </p>
        </div>
      </div>

      <section className="border-b bg-white" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: "rgba(197,160,89,0.1)" }}>
          <i data-lucide="gem" className="w-4 h-4 text-gold" style={{ strokeWidth: "1.2px" }} />
          <h3 className="canva-text section-title">{factura.productos.titulo}</h3>
        </div>
        <table className="w-full" style={{ fontSize: "10.5px" }}>
          <thead>
            <tr className="canva-section table-head text-gold uppercase tracking-wider text-[9px] leading-none h-9">
              {factura.productos.columnas.map((columna, index) => (
                <th
                  key={`${columna}-${index}`}
                  className={index === 0 ? "px-0 py-0 text-center font-medium w-8 align-middle whitespace-nowrap" : "px-0 py-0 text-center font-medium align-middle whitespace-nowrap"}
                >
                  <span className="flex h-9 w-full items-center justify-center px-4 leading-none">{columna}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white text-gray-800 divide-y" style={{ ["--tw-divide-opacity" as string]: "1", ["--tw-divide-color" as string]: "rgba(197,160,89,0.1)", lineHeight: 1.45 }}>
            {factura.productos.items.map((item, index) => (
              <tr key={`${item.referencia}-${index}`} className="h-10">
                <td className="px-4 py-2.5 align-middle leading-[1.45] text-center tabular-nums">{item.numero}</td>
                <td className="px-4 py-2.5 align-middle leading-[1.45] font-medium text-gray-900 text-left">{item.producto}</td>
                <td className="px-4 py-2.5 align-middle leading-[1.45] text-center">{item.material}</td>
                <td className="px-4 py-2.5 align-middle leading-[1.45] text-center">{item.referencia}</td>
                <td className="px-4 py-2.5 align-middle leading-[1.45] text-center">{item.cantidad}</td>
                <td className="px-4 py-2.5 align-middle leading-[1.45] text-right tabular-nums">{item.valorUnitario}</td>
                <td className="px-4 py-2.5 align-middle leading-[1.45] text-right font-semibold text-gray-900 tabular-nums">{item.valorTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-3 text-gray-400 italic text-[10.5px] border-t" style={{ borderColor: "rgba(197,160,89,0.1)" }}>
          {factura.productos.notaPie}
        </p>
      </section>

      <div className="grid grid-cols-5 bg-white divide-x border-b" style={{ ["--tw-divide-color" as string]: "rgba(197,160,89,0.2)", borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="col-span-1 flex flex-col items-center justify-center p-5 bg-white">
          <div className="flex w-full flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-10 bg-lux-black rounded-lg flex items-center justify-center" style={{ border: "1px solid rgba(197,160,89,0.4)" }}>
            <i data-lucide="wallet" className="w-5 h-5 text-gold" style={{ strokeWidth: "1.2px" }} />
            </div>
            <p className="text-gray-400 uppercase font-medium tracking-wider text-[7.5px] text-center leading-none">{factura.totales.tipoVentaLabel}</p>
            <div className="canva-tag bg-lux-black text-gold px-3 py-1 rounded uppercase tracking-widest text-[10px] leading-none" style={{ border: "1px solid var(--gold)" }}>{factura.totales.tipoVentaValor}</div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col justify-center p-5 space-y-2 text-gray-700 bg-white" style={{ fontSize: "12px", lineHeight: 1.45 }}>
          <div className="flex justify-between items-center min-h-[20px]"><span className="text-gray-500 uppercase tracking-wider text-[9px] leading-[1.3]">{factura.totales.subtotalLabel}</span><span className="font-medium text-gray-900 leading-[1.45] tabular-nums">{factura.totales.subtotalValor}</span></div>
          <div className="flex justify-between items-center min-h-[20px]"><span className="text-gray-500 uppercase tracking-wider text-[9px] leading-[1.3]">{factura.totales.descuentoLabel}</span><span className="text-gray-900 leading-[1.45] tabular-nums">{factura.totales.descuentoValor}</span></div>
          <div className="flex justify-between items-center min-h-[20px]"><span className="text-gray-500 uppercase tracking-wider text-[9px] leading-[1.3]">{factura.totales.envioLabel}</span><span className="text-gray-900 leading-[1.45] tabular-nums">{factura.totales.envioValor}</span></div>
        </div>

        <div className="canva-card col-span-2 p-5 flex flex-col justify-between bg-white">
          <div className="flex justify-between items-center min-h-[31px] mb-1"><span className="font-bold uppercase tracking-wider text-[11px] text-gray-500 leading-[1.3]">{factura.totales.totalLabel}</span><span className="font-bold text-gold leading-none tabular-nums" style={{ fontSize: "26px" }}>{factura.totales.totalValor}</span></div>
          <div className="flex justify-between items-center min-h-[22px] mb-2" style={{ fontSize: "11.5px" }}><span className="text-gray-500 uppercase tracking-wider text-[9px] leading-[1.3]">{factura.totales.saldoInicialLabel}</span><span className="font-medium text-gray-900 leading-[1.45] tabular-nums">{factura.totales.saldoInicialValor}</span></div>
          <div className="canva-section -mx-5 -mb-5 px-5 py-3 rounded-b flex justify-between items-center border-t" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
            <span className="canva-text text-gold font-bold uppercase tracking-wider" style={{ fontSize: "11.5px" }}>{factura.totales.saldoPendienteLabel}</span>
            <span className="text-gold font-bold tabular-nums" style={{ fontSize: "20px" }}>{factura.totales.saldoPendienteValor}</span>
          </div>
        </div>
      </div>

      <section className="bg-white border-b" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ borderColor: "rgba(197,160,89,0.1)" }}>
          <i data-lucide="calendar" className="w-4 h-4 text-gold" style={{ strokeWidth: "1.2px" }} />
          <h3 className="canva-text section-title">{factura.planPagos.titulo}</h3>
        </div>
        <table className="w-full" style={{ fontSize: "10px" }}>
          <thead>
            <tr className="table-head text-gold uppercase tracking-wider text-[8px] leading-none h-8">
              {factura.planPagos.columnas.map((columna, index) => (
                <th
                  key={`${columna}-${index}`}
                  className="px-0 py-0 text-center font-medium align-middle whitespace-nowrap"
                >
                  <span className="flex h-8 w-full items-center justify-center px-4 leading-none">{columna}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y text-gray-800" style={{ ["--tw-divide-color" as string]: "rgba(197,160,89,0.1)", lineHeight: 1.5 }}>
            {factura.planPagos.items.map((item, index) => {
              const estadoTexto = item.estado.trim().length > 0 ? item.estado : "PENDIENTE";

              return (
              <tr key={`${item.cuota}-${index}`} className="h-9">
                <td className="px-4 py-2 align-middle leading-[1.5] font-medium text-center">{item.cuota}</td>
                <td className="px-4 py-2 align-middle leading-[1.5] text-center">{item.fechaAcordada}</td>
                <td className="px-4 py-2 align-middle leading-[1.5] text-center font-medium text-gray-900 tabular-nums">{item.valor}</td>
                <td className="px-4 py-0 align-middle text-center"><span className={`${item.estadoClase} inline-flex items-center justify-center min-w-[74px] h-[18px] px-2.5 rounded text-[8px] uppercase tracking-wider font-medium leading-none`}>{estadoTexto}</span></td>
                <td className="px-4 py-2 align-middle leading-[1.5] text-center text-gray-400">{item.fechaPago}</td>
                <td className="px-4 py-2 align-middle leading-[1.5] text-center text-gray-400">{item.firmaCliente}</td>
                <td className="px-4 py-2 align-middle leading-[1.5] text-center text-gray-400">{item.firmaSJ}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-5 bg-white divide-x border-b" style={{ ["--tw-divide-color" as string]: "rgba(197,160,89,0.2)", borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="col-span-3 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3"><i data-lucide="clock" className="w-4 h-4 text-gold" style={{ strokeWidth: "1.2px" }} /><h3 className="canva-text section-title">{factura.historial.titulo}</h3></div>
            <table className="w-full" style={{ fontSize: "9.5px" }}>
              <thead>
                <tr className="table-head text-gold uppercase tracking-wider text-[8px] leading-none h-8">
                  {factura.historial.columnas.map((columna, index) => (
                    <th key={`${columna}-${index}`} className="px-0 py-0 text-center font-medium align-middle whitespace-nowrap">
                      <span className="flex h-8 w-full items-center justify-center px-2.5 leading-none">{columna}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white text-gray-800 divide-y" style={{ ["--tw-divide-color" as string]: "rgba(197,160,89,0.1)", lineHeight: 1.5 }}>
                {factura.historial.items.length === 0 ? (
                  <tr>
                    <td colSpan={factura.historial.columnas.length} className="px-2 py-4 text-center align-middle leading-[1.5] text-gray-400 italic">
                      {factura.historial.mensajeVacio}
                    </td>
                  </tr>
                ) : (
                  factura.historial.items.map((item, index) => (
                    <tr key={`${item.fecha}-${index}`} className="h-8">
                      <td className="px-2 py-1.5 align-middle leading-[1.5] text-center">{item.fecha}</td>
                      <td className="px-2 py-1.5 align-middle leading-[1.5] text-center font-medium tabular-nums">{item.valor}</td>
                      <td className="px-2 py-1.5 align-middle leading-[1.5] text-center">{item.metodo}</td>
                      <td className="px-2 py-1.5 align-middle leading-[1.5] text-center">{item.recibidoPor}</td>
                      <td className="px-2 py-1.5 align-middle leading-[1.5] text-center">{item.observacion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3.5"><button className="canva-button px-5 py-2 rounded text-xs uppercase transition tracking-wider items-center justify-center" style={{ fontSize: "9px", lineHeight: 1 }}>{factura.historial.botonRegistrarPago}</button></div>
        </div>

        <div className="canva-card col-span-2 p-5 bg-white flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2"><i data-lucide="shield" className="w-4 h-4 text-gold self-center" style={{ strokeWidth: "1.2px" }} /><h3 className="canva-text section-title leading-none">{factura.garantia.titulo}</h3></div>
          <p className="canva-text text-gray-500 font-light" style={{ fontSize: "9.5px", lineHeight: 1.55 }}>{factura.garantia.texto}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 divide-x bg-white border-b" style={{ ["--tw-divide-color" as string]: "rgba(197,160,89,0.2)", borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="col-span-2 p-5 bg-white flex flex-col justify-start">
          <div className="flex items-center gap-2 mb-3"><i data-lucide="file-text" className="w-4 h-4 text-gold" style={{ strokeWidth: "1.2px" }} /><h3 className="canva-text section-title">{factura.observaciones.titulo}</h3></div>
          <div className="canva-card border rounded p-4 min-h-[86px] flex flex-col justify-center" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
            {factura.observaciones.texto ? (
              <p className="text-gray-700 text-[10px] leading-[1.5] text-left">{factura.observaciones.texto}</p>
            ) : null}
            <div className="border-b border-dashed h-5" style={{ borderColor: "rgba(197,160,89,0.2)" }} />
            <div className="border-b border-dashed h-5" style={{ borderColor: "rgba(197,160,89,0.2)" }} />
            <div className="h-5" />
          </div>
        </div>

        <div className="col-span-3 grid grid-cols-2 divide-x p-5 bg-white" style={{ ["--tw-divide-color" as string]: "rgba(197,160,89,0.1)" }}>
          <div className="px-4 flex flex-col justify-end text-center h-full min-h-[86px]">
            <div className="border-b border-gray-400 w-full mb-2" style={{ borderColor: "rgba(107,114,128,0.8)" }} />
            <p className="canva-text uppercase text-gray-900 tracking-wider leading-[1.2]" style={{ fontSize: "10px" }}>{factura.firmas.firmaClienteLabel}</p>
            <p className="text-gray-400 mt-1 leading-[1.2]" style={{ fontSize: "8.5px" }}>{factura.firmas.firmaClienteDocumento}</p>
          </div>
          <div className="px-4 flex flex-col justify-end text-center h-full min-h-[86px]">
            <div className="border-b border-gray-400 w-full mb-2" style={{ borderColor: "rgba(107,114,128,0.8)" }} />
            <p className="canva-text uppercase text-gray-900 tracking-wider leading-[1.2]" style={{ fontSize: "10px" }}>{factura.firmas.firmaEmpresaLabel}</p>
            <p className="text-gray-400 mt-1 leading-[1.2]" style={{ fontSize: "8.5px" }}>{firmaEmpresaDetalle}</p>
          </div>
        </div>
      </div>

      <footer data-template-id="footer-section" className="canva-footer bg-lux-black px-8 py-5 relative">
        <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-6" style={{ fontSize: "8.5px", lineHeight: 1.2, color: "rgba(255,255,255,0.75)" }}>
          <div className="flex items-center gap-5 min-h-[16px]"><span className="flex items-center gap-1.5 leading-[1.2]"><i data-lucide="at-sign" className="w-3.5 h-3.5 text-gold self-center" style={{ strokeWidth: "1.2px" }} /> {factura.empresa.instagram}</span><span className="flex items-center gap-1.5 leading-[1.2]"><i data-lucide="phone" className="w-3.5 h-3.5 text-gold self-center" style={{ strokeWidth: "1.2px" }} /> {factura.empresa.telefono}</span></div>
          <div className="flex items-center gap-5 min-h-[16px]"><span className="flex items-center gap-1.5 leading-[1.2]"><i data-lucide="map-pin" className="w-3.5 h-3.5 text-gold self-center" style={{ strokeWidth: "1.2px" }} /> {factura.empresa.direccion}</span><span className="flex items-center gap-1.5 leading-[1.2]"><i data-lucide="clock" className="w-3.5 h-3.5 text-gold self-center" style={{ strokeWidth: "1.2px" }} /> {factura.empresa.horario}</span></div>
          <div className="flex items-center gap-2 bg-[#141414] border rounded p-1.5 px-3" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
            <div className="flex flex-col text-[7px] leading-tight text-right text-gold uppercase tracking-wider font-medium"><span>{factura.empresa.qrTitulo}</span><span className="text-white/50">{factura.empresa.qrSubtitulo}</span></div>
            <div className="w-7 h-7 bg-white/10 rounded flex items-center justify-center" style={{ border: "1px solid rgba(197,160,89,0.2)" }}>
              <i data-lucide="qr-code" className="w-5 h-5 text-gold" style={{ strokeWidth: "1.2px" }} />
            </div>
          </div>
        </div>
        <div className="w-full h-[1px] my-3.5" style={{ background: "linear-gradient(to right, transparent, rgba(197,160,89,0.4), transparent)" }} />
        <p className="canva-text font-luxury text-gold text-center uppercase" style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 300 }}>{factura.empresa.footerMarca}</p>
      </footer>

      <div id="payment-modal" className="fixed inset-0 modal-overlay z-50 hidden flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-xl w-full max-w-md p-5 border max-h-[90vh] overflow-y-auto" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="canva-text font-luxury text-gold" style={{ fontSize: "18px", fontWeight: 400, letterSpacing: "0.05em" }}>{factura.credito.modalPago.titulo}</h2>
            <button className="text-white/50 hover:text-white"><i data-lucide="x" className="w-5 h-5" /></button>
          </div>
          <form className="space-y-3">
            <div>
              <label htmlFor="pay-amount" className="canva-text text-gold text-xs uppercase tracking-wider block mb-1">{factura.credito.modalPago.montoLabel}</label>
              <input id="pay-amount" type="number" className="w-full bg-black/50 border rounded px-3 py-2 text-white text-sm" style={{ borderColor: "rgba(197,160,89,0.3)" }} />
            </div>
            <div>
              <label htmlFor="pay-method" className="canva-text text-gold text-xs uppercase tracking-wider block mb-1">{factura.credito.modalPago.metodoLabel}</label>
              <select id="pay-method" className="w-full bg-black/50 border rounded px-3 py-2 text-white text-sm" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
                {factura.credito.modalPago.metodos.map((metodo, index) => (
                  <option key={`${metodo}-${index}`}>{metodo}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pay-date" className="canva-text text-gold text-xs uppercase tracking-wider block mb-1">{factura.credito.modalPago.fechaLabel}</label>
              <input id="pay-date" type="date" className="w-full bg-black/50 border rounded px-3 py-2 text-white text-sm" style={{ borderColor: "rgba(197,160,89,0.3)" }} />
            </div>
            <div>
              <label htmlFor="pay-obs" className="canva-text text-gold text-xs uppercase tracking-wider block mb-1">{factura.credito.modalPago.observacionLabel}</label>
              <textarea id="pay-obs" rows={2} className="w-full bg-black/50 border rounded px-3 py-2 text-white text-sm" style={{ borderColor: "rgba(197,160,89,0.3)" }} />
            </div>
            <div>
              <label className="canva-text text-gold text-xs uppercase tracking-wider block mb-1">{factura.credito.modalPago.firmaLabel}</label>
              <canvas className="signature-canvas w-full h-32 bg-black/30 border rounded cursor-crosshair" style={{ borderColor: "rgba(197,160,89,0.3)" }} />
              <button type="button" className="text-gold text-xs mt-1 underline">{factura.credito.modalPago.limpiarFirmaLabel}</button>
            </div>
            <button type="button" className="canva-button w-full py-2.5 rounded uppercase tracking-wider transition">{factura.credito.modalPago.botonGuardarLabel}</button>
          </form>
        </div>
      </div>
    </InvoiceContainer>
  );
}
