// ============================================================
//  Los Gustos de Juan — Seed data matching real Supabase schema
// ============================================================

const fmt = {
  money: (n) => new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n || 0),
  moneyShort: (n) => {
    if (Math.abs(n) >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
    if (Math.abs(n) >= 1_000) return "$" + (n / 1_000).toFixed(1) + "k";
    return "$" + Math.round(n);
  },
  number: (n, d = 0) => Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d }),
  pct: (n) => (n || 0).toFixed(1) + "%",
  date: (d) => {
    const dt = typeof d === "string" ? new Date(d + (d.length === 10 ? "T12:00:00" : "")) : d;
    return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  },
  dateFull: (d) => {
    const dt = typeof d === "string" ? new Date(d + (d.length === 10 ? "T12:00:00" : "")) : d;
    return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  },
};

const uid = () => Math.random().toString(36).slice(2, 10);

// --- INSUMOS (raw materials) ---
const SEED_INSUMOS = [
  { id: "in1", nombre: "Bondiola cruda", categoria: "Carnes", subcategoria: "Cerdo", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 7800, costo_unitario: 7.8, notas: "Frigorífico San Andrés" },
  { id: "in2", nombre: "Pan casero", categoria: "Panificados", subcategoria: "Pan", presentacion: 1, unidad_medida: "un", costo_presentacion: 450, costo_unitario: 450, notas: "Panadería La Esquina" },
  { id: "in3", nombre: "Queso muzzarella", categoria: "Lácteos", subcategoria: "Queso", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 5400, costo_unitario: 5.4, notas: "" },
  { id: "in4", nombre: "Jamón cocido", categoria: "Lácteos", subcategoria: "Fiambre", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 6800, costo_unitario: 6.8, notas: "" },
  { id: "in5", nombre: "Cebolla morada", categoria: "Verduras", subcategoria: "", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 1800, costo_unitario: 1.8, notas: "" },
  { id: "in6", nombre: "Rúcula", categoria: "Verduras", subcategoria: "Hojas", presentacion: 250, unidad_medida: "gr", costo_presentacion: 1100, costo_unitario: 4.4, notas: "" },
  { id: "in7", nombre: "Tomate", categoria: "Verduras", subcategoria: "", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 1200, costo_unitario: 1.2, notas: "" },
  { id: "in8", nombre: "Lechuga", categoria: "Verduras", subcategoria: "Hojas", presentacion: 1, unidad_medida: "un", costo_presentacion: 600, costo_unitario: 600, notas: "" },
  { id: "in9", nombre: "Aceite de oliva", categoria: "Condimentos", subcategoria: "Aceites", presentacion: 1000, unidad_medida: "ml", costo_presentacion: 4800, costo_unitario: 4.8, notas: "" },
  { id: "in10", nombre: "Sal fina", categoria: "Condimentos", subcategoria: "", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 800, costo_unitario: 0.8, notas: "" },
  { id: "in11", nombre: "Azúcar", categoria: "Condimentos", subcategoria: "", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 1500, costo_unitario: 1.5, notas: "" },
  { id: "in12", nombre: "Pollo desmenuzado", categoria: "Carnes", subcategoria: "Ave", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 4800, costo_unitario: 4.8, notas: "" },
  { id: "in13", nombre: "Pan de hamburguesa", categoria: "Panificados", subcategoria: "Pan", presentacion: 1, unidad_medida: "un", costo_presentacion: 650, costo_unitario: 650, notas: "" },
  { id: "in14", nombre: "Carbón", categoria: "Servicios", subcategoria: "", presentacion: 5000, unidad_medida: "gr", costo_presentacion: 3500, costo_unitario: 0.7, notas: "" },
  { id: "in15", nombre: "Servilletas", categoria: "Servicios", subcategoria: "Packaging", presentacion: 100, unidad_medida: "un", costo_presentacion: 800, costo_unitario: 8, notas: "" },
  { id: "in16", nombre: "Mayonesa", categoria: "Condimentos", subcategoria: "Salsas", presentacion: 1000, unidad_medida: "gr", costo_presentacion: 2200, costo_unitario: 2.2, notas: "" },
];

// --- SUB-RECETAS (intermediate prep, e.g. caramelized onions) ---
const SEED_SUB_RECETAS = [
  {
    id: "sr1", nombre: "Cebolla caramelizada", categoria: "Guarniciones",
    rinde: 600, unidad_rinde: "gr", costo_total: 4480, costo_unitario: 7.47,
    ingredientes: [
      { insumo_id: "in5", cantidad: 1000, unidad: "gr" },
      { insumo_id: "in11", cantidad: 80, unidad: "gr" },
      { insumo_id: "in9", cantidad: 50, unidad: "ml" },
    ],
  },
  {
    id: "sr2", nombre: "Bondiola braseada", categoria: "Carnes preparadas",
    rinde: 750, unidad_rinde: "gr", costo_total: 8200, costo_unitario: 10.93,
    ingredientes: [
      { insumo_id: "in1", cantidad: 1000, unidad: "gr" },
      { insumo_id: "in10", cantidad: 25, unidad: "gr" },
      { insumo_id: "in9", cantidad: 80, unidad: "ml" },
    ],
  },
  {
    id: "sr3", nombre: "Chimichurri", categoria: "Salsas",
    rinde: 500, unidad_rinde: "ml", costo_total: 2400, costo_unitario: 4.8,
    ingredientes: [
      { insumo_id: "in9", cantidad: 300, unidad: "ml" },
      { insumo_id: "in10", cantidad: 30, unidad: "gr" },
    ],
  },
];

// --- RECETAS (final products) ---
const SEED_RECETAS = [
  {
    id: "r1", nombre: "Sándwich de bondiola", categoria: "Sandwiches",
    rinde: 1, unidad_rinde: "un", costo_total: 1462, costo_por_porcion: 1462, notas: "Clásico de feria",
    ingredientes: [
      { tipo: "insumo", insumo_id: "in2", cantidad: 1, unidad: "un" },
      { tipo: "sub-receta", sub_receta_id: "sr2", cantidad: 80, unidad: "gr" },
      { tipo: "sub-receta", sub_receta_id: "sr1", cantidad: 30, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in6", cantidad: 15, unidad: "gr" },
    ],
  },
  {
    id: "r2", nombre: "Sándwich de pollo", categoria: "Sandwiches",
    rinde: 1, unidad_rinde: "un", costo_total: 1010, costo_por_porcion: 1010, notas: "",
    ingredientes: [
      { tipo: "insumo", insumo_id: "in2", cantidad: 1, unidad: "un" },
      { tipo: "insumo", insumo_id: "in12", cantidad: 90, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in16", cantidad: 20, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in8", cantidad: 0.1, unidad: "un" },
    ],
  },
  {
    id: "r3", nombre: "Hamburguesa clásica", categoria: "Hamburguesas",
    rinde: 1, unidad_rinde: "un", costo_total: 1840, costo_por_porcion: 1840, notas: "Doble carne",
    ingredientes: [
      { tipo: "insumo", insumo_id: "in13", cantidad: 1, unidad: "un" },
      { tipo: "insumo", insumo_id: "in1", cantidad: 150, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in3", cantidad: 30, unidad: "gr" },
    ],
  },
  {
    id: "r4", nombre: "Sándwich vegetariano", categoria: "Sandwiches",
    rinde: 1, unidad_rinde: "un", costo_total: 880, costo_por_porcion: 880, notas: "",
    ingredientes: [
      { tipo: "insumo", insumo_id: "in2", cantidad: 1, unidad: "un" },
      { tipo: "insumo", insumo_id: "in3", cantidad: 40, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in7", cantidad: 50, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in6", cantidad: 20, unidad: "gr" },
    ],
  },
  {
    id: "r5", nombre: "Sándwich de jamón y queso", categoria: "Sandwiches",
    rinde: 1, unidad_rinde: "un", costo_total: 920, costo_por_porcion: 920, notas: "",
    ingredientes: [
      { tipo: "insumo", insumo_id: "in2", cantidad: 1, unidad: "un" },
      { tipo: "insumo", insumo_id: "in4", cantidad: 40, unidad: "gr" },
      { tipo: "insumo", insumo_id: "in3", cantidad: 30, unidad: "gr" },
    ],
  },
];

// --- CARTA (menu items with pricing) ---
function cmv(costo, precio) { return precio > 0 ? (costo / precio) * 100 : 0; }
const SEED_CARTA = [
  { id: "c1", receta_id: "r1", nombre_comercial: "Bondiola de la casa", precio_venta: 4200, markup: 30, activo: true },
  { id: "c2", receta_id: "r2", nombre_comercial: "Sándwich de pollo", precio_venta: 3500, markup: 30, activo: true },
  { id: "c3", receta_id: "r3", nombre_comercial: "Hamburguesa doble", precio_venta: 4800, markup: 30, activo: true },
  { id: "c4", receta_id: "r4", nombre_comercial: "Veggie", precio_venta: 2800, markup: 30, activo: true },
  { id: "c5", receta_id: "r5", nombre_comercial: "Jamón y queso", precio_venta: 2500, markup: 30, activo: true },
].map((c) => {
  const r = SEED_RECETAS.find((x) => x.id === c.receta_id);
  const cmvVal = cmv(r.costo_por_porcion, c.precio_venta);
  return { ...c, cmv: cmvVal, ctm: 100 - cmvVal };
});

// --- FERIAS (events: feria or puesto_ruta) ---
const FERIA_TIPOS = [
  { value: "feria", label: "Feria", icon: "🏪" },
  { value: "puesto_ruta", label: "Puesto en ruta", icon: "🚗" },
];

const SEED_FERIAS = [
  { id: "f1", nombre: "Feria de Mataderos", tipo: "feria", fecha: "2026-05-23", lugar: "Av. Lisandro de la Torre", notas: "Llevar más bondiola — la última vez se acabó a media tarde" },
  { id: "f2", nombre: "Feria de Palermo Soho", tipo: "feria", fecha: "2026-05-25", lugar: "Plaza Serrano", notas: "Confirmar puesto el lunes con Marta" },
  { id: "f3", nombre: "Puesto Ruta 2 km 50", tipo: "puesto_ruta", fecha: "2026-05-30", lugar: "Ruta 2 km 50", notas: "Finde largo. Salir 6am." },
  { id: "f4", nombre: "Feria de Mataderos", tipo: "feria", fecha: "2026-05-17", lugar: "Av. Lisandro de la Torre", notas: "Día con mucho calor, gran venta de bebidas" },
  { id: "f5", nombre: "Feria de Palermo Soho", tipo: "feria", fecha: "2026-05-11", lugar: "Plaza Serrano", notas: "" },
  { id: "f6", nombre: "Puesto Ruta 2 km 50", tipo: "puesto_ruta", fecha: "2026-05-10", lugar: "Ruta 2 km 50", notas: "Cliente preguntó por reserva grande para evento" },
  { id: "f7", nombre: "Feria de San Telmo", tipo: "feria", fecha: "2026-05-04", lugar: "Plaza Dorrego", notas: "" },
  { id: "f8", nombre: "Puesto Ruta 8", tipo: "puesto_ruta", fecha: "2026-04-27", lugar: "Ruta 8 km 35", notas: "" },
];

// --- GASTOS (general expenses) ---
const SEED_GASTOS = [
  { id: "g1", descripcion: "Carnicería San Andrés", categoria: "Insumos", monto: 78000, fecha: "2026-05-17" },
  { id: "g2", descripcion: "Patente camioneta", categoria: "Vehículo", monto: 42000, fecha: "2026-05-15" },
  { id: "g3", descripcion: "Panadería semana", categoria: "Insumos", monto: 24500, fecha: "2026-05-14" },
  { id: "g4", descripcion: "Verdulería", categoria: "Insumos", monto: 18200, fecha: "2026-05-13" },
  { id: "g5", descripcion: "Lácteos del Valle", categoria: "Insumos", monto: 32400, fecha: "2026-05-12" },
  { id: "g6", descripcion: "Service heladera", categoria: "Mantenimiento", monto: 28000, fecha: "2026-05-10" },
  { id: "g7", descripcion: "Combustible camioneta", categoria: "Vehículo", monto: 18500, fecha: "2026-05-08" },
  { id: "g8", descripcion: "Carbón y leña", categoria: "Insumos", monto: 14000, fecha: "2026-05-06" },
  { id: "g9", descripcion: "Servilletas y packaging", categoria: "Packaging", monto: 8500, fecha: "2026-05-05" },
];

const CATEGORIAS_INSUMOS = ["Carnes", "Verduras", "Panificados", "Lácteos", "Condimentos", "Servicios", "Otros"];
const CATEGORIAS_GASTOS = ["Insumos", "Vehículo", "Mantenimiento", "Packaging", "Servicios", "Impuestos", "Otros"];
const UNIDADES = ["gr", "kg", "ml", "l", "un"];

Object.assign(window, {
  fmt, uid, cmv,
  SEED_INSUMOS, SEED_SUB_RECETAS, SEED_RECETAS, SEED_CARTA,
  SEED_FERIAS, SEED_GASTOS,
  FERIA_TIPOS, CATEGORIAS_INSUMOS, CATEGORIAS_GASTOS, UNIDADES,
});
