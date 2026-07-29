export interface LabelValue {
  label: string;
  value: string;
  valueClassName?: string;
}

export interface FacturaEmpresa {
  marcaNombre: string;
  marcaSubtitulo: string;
  marcaSlogan: string;
  instagram: string;
  telefono: string;
  direccion: string;
  horario: string;
  qrTitulo: string;
  qrSubtitulo: string;
  footerMarca: string;
  nit: string;
}

export interface FacturaCabecera {
  tituloDocumento: string;
  numeroFactura: string;
  fechaLabel: string;
  fechaValor: string;
  horaLabel: string;
  horaValor: string;
  creditoLabel: string;
  creditoValor: string;
}

export interface FacturaCliente {
  titulo: string;
  campos: LabelValue[];
}

export interface FacturaVenta {
  titulo: string;
  campos: LabelValue[];
  observacionLabel: string;
  observacionValor: string;
}

export interface FacturaAgradecimiento {
  titulo: string;
  mensaje: string;
}

export interface FacturaProducto {
  numero: string;
  imagen: string;
  producto: string;
  material: string;
  referencia: string;
  cantidad: string;
  valorUnitario: string;
  valorTotal: string;
}

export interface FacturaProductos {
  titulo: string;
  columnas: string[];
  items: FacturaProducto[];
  notaPie: string;
}

export interface FacturaTotales {
  tipoVentaLabel: string;
  tipoVentaValor: string;
  subtotalLabel: string;
  subtotalValor: string;
  descuentoLabel: string;
  descuentoValor: string;
  envioLabel: string;
  envioValor: string;
  totalLabel: string;
  totalValor: string;
  saldoInicialLabel: string;
  saldoInicialValor: string;
  saldoPendienteLabel: string;
  saldoPendienteValor: string;
}

export interface FacturaPlanPagoItem {
  cuota: string;
  fechaAcordada: string;
  valor: string;
  estado: string;
  estadoClase: string;
  fechaPago: string;
  firmaCliente: string;
  firmaSJ: string;
}

export interface FacturaPlanPagos {
  titulo: string;
  columnas: string[];
  items: FacturaPlanPagoItem[];
}

export interface FacturaHistorialItem {
  fecha: string;
  valor: string;
  metodo: string;
  recibidoPor: string;
  observacion: string;
}

export interface FacturaHistorial {
  titulo: string;
  columnas: string[];
  items: FacturaHistorialItem[];
  mensajeVacio: string;
  botonRegistrarPago: string;
}

export interface FacturaGarantia {
  titulo: string;
  texto: string;
}

export interface FacturaObservaciones {
  titulo: string;
  texto: string;
}

export interface FacturaFirmas {
  firmaClienteLabel: string;
  firmaClienteDocumento: string;
  firmaEmpresaLabel: string;
  firmaEmpresaDetalle: string;
  firmaVendedorLabel: string;
  firmaVendedorDetalle: string;
}

export interface FacturaModalPago {
  titulo: string;
  montoLabel: string;
  metodoLabel: string;
  fechaLabel: string;
  observacionLabel: string;
  firmaLabel: string;
  limpiarFirmaLabel: string;
  botonGuardarLabel: string;
  metodos: string[];
}

export interface FacturaCredito {
  modalPago: FacturaModalPago;
  frecuencia: "Mensual" | "Quincenal" | "Semanal" | "Personalizado" | "";
  numeroCuotas: string;
  fechaInicio: string;
  diaPago: string;
  observacionCredito: string;
}

export type FacturaEstado = "DRAFT" | "ISSUED" | "ACTIVE_CREDIT" | "COMPLETED";

export interface FacturaLifecycle {
  estado: FacturaEstado;
  emitidaEn: string;
  firmasIniciales: {
    cliente: boolean;
    sj: boolean;
  };
}

export interface Factura {
  empresa: FacturaEmpresa;
  cabecera: FacturaCabecera;
  cliente: FacturaCliente;
  venta: FacturaVenta;
  agradecimiento: FacturaAgradecimiento;
  productos: FacturaProductos;
  totales: FacturaTotales;
  credito: FacturaCredito;
  planPagos: FacturaPlanPagos;
  historial: FacturaHistorial;
  observaciones: FacturaObservaciones;
  garantia: FacturaGarantia;
  firmas: FacturaFirmas;
  lifecycle: FacturaLifecycle;
}
