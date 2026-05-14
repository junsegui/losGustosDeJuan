// Calcular kg finales después de la merma
export function calcularKgFinales(kgComprados, mermaPorcentaje) {
  return kgComprados * (1 - mermaPorcentaje / 100);
}

// Calcular costo total de una producción
export function calcularCostoTotal(kgComprados, precioKg, costoInsumos) {
  return kgComprados * precioKg + (costoInsumos || 0);
}

// Calcular costo real por kg (después de merma)
export function calcularCostoPorKg(costoTotal, kgFinales) {
  if (!kgFinales || kgFinales === 0) return 0;
  return costoTotal / kgFinales;
}

// Calcular precio sugerido de venta según margen deseado
export function calcularPrecioSugerido(costoPorKg, margenPorcentaje) {
  return costoPorKg / (1 - margenPorcentaje / 100);
}

// Calcular ganancia de una feria
export function calcularResumenFeria(ventas, costosFeria) {
  const ingresos = ventas.reduce(
    (sum, v) => sum + v.cantidad * v.precio_venta_real,
    0,
  );

  const costos = costosFeria.reduce((sum, c) => sum + c.monto, 0);

  const ganancia = ingresos - costos;

  return { ingresos, costos, ganancia };
}

// Formatear números como plata
export function formatPrecio(numero) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(numero || 0);
}
