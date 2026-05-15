import styled from "styled-components";
import * as XLSX from "xlsx";
import { formatPrecio } from "../lib/calculos";

const Button = styled.button`
  padding: 10px 20px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  background: ${(p) => p.theme.colors.success};
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${(p) => p.theme.colors.success};
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;

function ExportarExcel({ datos, nombreArchivo, tipo }) {
  function exportar() {
    let datosExcel = [];

    if (tipo === "carta") {
      datosExcel = datos.map((item) => ({
        Producto: item.nombre_comercial,
        Costo: item.recetas?.costo_por_porcion || 0,
        "Precio Venta": item.precio_venta,
        Ganancia: item.precio_venta - (item.recetas?.costo_por_porcion || 0),
        "CMV %": item.cmv?.toFixed(2),
        "CTM %": item.ctm?.toFixed(2),
        "Markup %": item.markup,
        Notas: item.notas || "",
      }));
    } else if (tipo === "ferias") {
      datosExcel = datos.map((feria) => {
        const ingresos = (feria.ventas_feria || []).reduce(
          (s, v) => s + v.cantidad * v.precio_venta_real,
          0,
        );
        const costos = (feria.costos_feria || []).reduce(
          (s, c) => s + c.monto,
          0,
        );
        const ganancia = ingresos - costos;

        return {
          Feria: feria.nombre,
          Fecha: feria.fecha,
          Lugar: feria.lugar || "",
          Ingresos: ingresos,
          Costos: costos,
          Ganancia: ganancia,
          Notas: feria.notas || "",
        };
      });
    } else if (tipo === "insumos") {
      datosExcel = datos.map((item) => ({
        Insumo: item.nombre,
        Categoría: item.categoria || "",
        Subcategoría: item.subcategoria || "",
        Presentación: item.presentacion,
        Unidad: item.unidad_medida,
        "Costo Presentación": item.costo_presentacion,
        "Costo Unitario": item.costo_unitario,
        Notas: item.notas || "",
      }));
    } else if (tipo === "sub-recetas") {
      datosExcel = datos.map((item) => ({
        "Sub-receta": item.nombre,
        Categoría: item.categoria || "",
        Rinde: item.rinde,
        Unidad: item.unidad_rinde,
        "Costo Total": item.costo_total,
        "Costo Unitario": item.costo_unitario,
        Notas: item.notas || "",
      }));
    } else if (tipo === "recetas") {
      datosExcel = datos.map((item) => ({
        Receta: item.nombre,
        Categoría: item.categoria || "",
        Rinde: item.rinde,
        Unidad: item.unidad_rinde,
        "Costo Total": item.costo_total,
        "Costo por Porción": item.costo_por_porcion,
        Notas: item.notas || "",
      }));
    }

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");

    // Ajustar ancho de columnas
    const maxWidth = datosExcel.reduce((w, r) => {
      return Object.keys(r).map((k) => ({
        wch: Math.max(w[k]?.wch || 10, String(r[k]).length + 2),
      }));
    }, {});

    ws["!cols"] = Object.keys(datosExcel[0] || {}).map((k, i) => ({
      wch: Math.max(k.length + 2, 15),
    }));

    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
  }

  if (!datos || datos.length === 0) return null;

  return <Button onClick={exportar}>📊 Exportar a Excel</Button>;
}

export default ExportarExcel;
