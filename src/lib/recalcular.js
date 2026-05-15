import { supabase } from "./supabase";

export async function recalcularTodo() {
  // 1. Recalcular todas las sub-recetas
  const { data: subRecetas } = await supabase.from("sub_recetas").select(`
      id,
      rinde,
      ingredientes_sub_receta(
        cantidad,
        unidad,
        insumo_id,
        insumos(costo_unitario)
      )
    `);

  for (const sr of subRecetas || []) {
    const costoTotal = (sr.ingredientes_sub_receta || []).reduce((sum, ing) => {
      const costoUnitario = ing.insumos?.costo_unitario || 0;
      return sum + costoUnitario * ing.cantidad;
    }, 0);

    const costoUnitario = sr.rinde > 0 ? costoTotal / sr.rinde : 0;

    await supabase
      .from("sub_recetas")
      .update({
        costo_total: costoTotal,
        costo_unitario: costoUnitario,
      })
      .eq("id", sr.id);
  }

  // 2. Recalcular todas las recetas
  const { data: recetas } = await supabase.from("recetas").select(`
      id,
      rinde,
      ingredientes_receta(
        cantidad,
        unidad,
        insumo_id,
        sub_receta_id,
        insumos(costo_unitario),
        sub_recetas(costo_unitario)
      )
    `);

  for (const r of recetas || []) {
    const costoTotal = (r.ingredientes_receta || []).reduce((sum, ing) => {
      if (ing.insumo_id) {
        return sum + (ing.insumos?.costo_unitario || 0) * ing.cantidad;
      } else if (ing.sub_receta_id) {
        return sum + (ing.sub_recetas?.costo_unitario || 0) * ing.cantidad;
      }
      return sum;
    }, 0);

    const costoPorPorcion = r.rinde > 0 ? costoTotal / r.rinde : 0;

    await supabase
      .from("recetas")
      .update({
        costo_total: costoTotal,
        costo_por_porcion: costoPorPorcion,
      })
      .eq("id", r.id);
  }

  // 3. Recalcular CMV y CTM en la carta
  const { data: carta } = await supabase
    .from("carta")
    .select("id, precio_venta, receta_id, recetas(costo_por_porcion)");

  for (const c of carta || []) {
    const costo = c.recetas?.costo_por_porcion || 0;
    const cmv = c.precio_venta > 0 ? (costo / c.precio_venta) * 100 : 0;
    const ctm = 100 - cmv;

    await supabase
      .from("carta")
      .update({
        cmv: cmv,
        ctm: ctm,
      })
      .eq("id", c.id);
  }

  return true;
}
