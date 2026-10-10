/* Empresa demo: Quillay Suministros Industriales SpA (ficticia). UNA sola fuente de datos de ejemplo.
   Las cifras se derivan unas de otras: los totales salen de las cotizaciones, no se escriben a mano. */

export const EMPRESA = { nombre: "Quillay Suministros Industriales", corto: "Quillay", rut: "76.354.771-K", ciudad: "Rancagua", personas: 38, rubro: "Distribución industrial B2B" };

export const PERSONAS = [
  { id: "jm", nombre: "Jorge Molina", cargo: "Jefe comercial" },
  { id: "cr", nombre: "Camila Rojas", cargo: "Gerenta general" },
  { id: "pa", nombre: "Pedro Araya", cargo: "Jefe de bodega" },
  { id: "vs", nombre: "Valentina Soto", cargo: "Administración y finanzas" },
  { id: "dm", nombre: "Diego Muñoz", cargo: "Vendedor en terreno" },
];

export const PROCESOS = [
  { id: "cotizaciones", nombre: "Cotizaciones", area: "Ventas", horas: 12, estado: "trabado", responsable: "jm", sistemas: ["Excel", "WhatsApp", "Correo"] },
  { id: "seguimiento", nombre: "Seguimiento comercial", area: "Ventas", horas: 7, estado: "trabado", responsable: "dm", sistemas: ["WhatsApp"] },
  { id: "inventario", nombre: "Conteo de inventario", area: "Operaciones", horas: 6, estado: "revision", responsable: "pa", sistemas: ["Excel", "Bsale"] },
  { id: "despachos", nombre: "Despachos", area: "Operaciones", horas: 3, estado: "documentado", responsable: "pa", sistemas: ["Bsale"] },
  { id: "cobranza", nombre: "Cobranza", area: "Finanzas", horas: 2, estado: "sin-responsable", responsable: null, sistemas: ["Excel", "Correo"] },
  { id: "reportes", nombre: "Reporte mensual", area: "Gerencia", horas: 1, estado: "documentado", responsable: "vs", sistemas: ["Excel"] },
];
export const HORAS_PERDIDAS = PROCESOS.reduce((s, p) => s + p.horas, 0); // 31 h/semana

export const ESTADOS = {
  trabado: ["Trabado", "alerta"], revision: ["En revisión", "info"], documentado: ["Documentado", "exito"], "sin-responsable": ["Sin responsable", "error"],
};

const CLIENTES = ["Minera Los Bronces Sur", "Agrícola Cachapoal", "Frutícola El Olivar", "Constructora Rapel", "Packing San Vicente", "Viña Doñihue", "Áridos Codegua", "Transportes Machalí", "Agroindustrial Requínoa", "Forestal Las Cabras"];
const ESTADOS_COT = ["Enviada", "Ganada", "En negociación", "Perdida", "Ganada", "Enviada", "Ganada", "En negociación", "Ganada", "Borrador"];

// Cotizaciones de ejemplo (determinísticas)
export const COTIZACIONES = Array.from({ length: 24 }, (_, i) => {
  const monto = Math.round(((i * 7919) % 41 + 6) * 312_450 / 1000) * 1000;
  const dia = 1 + ((i * 5) % 28);
  return {
    folio: `COT-${2310 + i}`, cliente: CLIENTES[i % CLIENTES.length], monto,
    fecha: new Date(2026, 8 + Math.floor(i / 12), dia), estado: ESTADOS_COT[i % ESTADOS_COT.length],
    vendedor: PERSONAS[i % 2 === 0 ? 0 : 4].nombre, dias: 1 + ((i * 3) % 6),
  };
});

// Ventas mensuales 2026 (millones de pesos) y el mismo periodo 2025
const BASE = [62, 58, 71, 69, 74, 66, 72, 79, 83, 88];
export const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct"];
export const VENTAS = BASE.map((v, i) => ({ mes: MESES_CORTOS[i], actual: v * 1_000_000, anterior: Math.round(v * (0.86 + (i % 3) * 0.03)) * 1_000_000 }));

// Origen de los pedidos (para la dona)
export const CANALES = [["WhatsApp", 46], ["Correo", 27], ["Vendedor en terreno", 19], ["Teléfono", 8]];

// Indicadores derivados
const ganadas = COTIZACIONES.filter((c) => c.estado === "Ganada");
export const KPIS = {
  ventasMes: VENTAS.at(-1).actual,
  variacionMes: (VENTAS.at(-1).actual - VENTAS.at(-2).actual) / VENTAS.at(-2).actual,
  tasaCierre: ganadas.length / COTIZACIONES.filter((c) => c.estado !== "Borrador").length,
  diasCotizar: COTIZACIONES.reduce((s, c) => s + c.dias, 0) / COTIZACIONES.length,
  horasPerdidas: HORAS_PERDIDAS,
};

// Memoria de la empresa (búsqueda)
export const NOTAS = [
  { titulo: "Acuerdo de precios con Minera Los Bronces Sur", fuente: "Correo", fecha: "12 sep 2026", texto: "Se mantiene el descuento de 8 % en rodamientos si el pedido supera los $ 4.000.000. Renovar en marzo." },
  { titulo: "Cómo cotizar repuestos importados", fuente: "Nota de Jorge", fecha: "3 ago 2026", texto: "Sumar flete y aduana (18 % aprox.) antes del margen. El plazo de entrega se confirma con bodega antes de enviar." },
  { titulo: "Reclamo de Agrícola Cachapoal por despacho atrasado", fuente: "WhatsApp", fecha: "28 sep 2026", texto: "El despacho salió 3 días tarde por falta de stock en bodega 2. Se compensó con flete gratis en el siguiente pedido." },
  { titulo: "Lista de precios octubre", fuente: "Planilla", fecha: "1 oct 2026", texto: "Alza de 4 % en mangueras hidráulicas y EPP. Sin cambios en rodamientos ni correas." },
  { titulo: "Reunión con Frutícola El Olivar", fuente: "Reunión", fecha: "6 oct 2026", texto: "Quieren contrato anual de suministros para la temporada. Piden cotización con despacho semanal a Requínoa." },
];

export const clp = (n) => "$ " + Math.round(n).toLocaleString("es-CL");
export const clpCorto = (n) => (n >= 1e9 ? "$ " + (n / 1e9).toLocaleString("es-CL", { maximumFractionDigits: 1 }) + " mil MM" : n >= 1e6 ? "$ " + (n / 1e6).toLocaleString("es-CL", { maximumFractionDigits: 1 }) + " MM" : clp(n));
export const pct = (x, d = 1) => (x * 100).toLocaleString("es-CL", { maximumFractionDigits: d, minimumFractionDigits: d }) + " %";
export const fechaCorta = (f) => f.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
