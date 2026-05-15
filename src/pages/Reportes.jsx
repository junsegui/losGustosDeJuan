import { useState, useEffect } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Title = styled.h1`
  font-family: "DM Serif Display", serif;
  font-size: 28px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
  margin-bottom: 28px;
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

const COLORS = [
  "#E8721C",
  "#27ae60",
  "#3498db",
  "#9b59b6",
  "#e74c3c",
  "#f39c12",
  "#1abc9c",
  "#34495e",
];

function Reportes() {
  const [ferias, setFerias] = useState([]);
  const [carta, setCarta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatos();
  }, []);

  async function fetchDatos() {
    setLoading(true);
    const [{ data: feriasData }, { data: cartaData }] = await Promise.all([
      supabase
        .from("ferias")
        .select(
          `
        *,
        ventas_feria(*, carta(nombre_comercial, recetas(costo_por_porcion))),
        costos_feria(*)
      `,
        )
        .order("fecha", { ascending: true }),
      supabase
        .from("carta")
        .select("*, recetas(costo_por_porcion)")
        .eq("activo", true),
    ]);

    if (feriasData) setFerias(feriasData);
    if (cartaData) setCarta(cartaData);
    setLoading(false);
  }

  // Datos para gráfico de evolución de ganancias
  const datosGanancias = ferias.map((f) => {
    const ingresos = (f.ventas_feria || []).reduce(
      (s, v) => s + v.cantidad * v.precio_venta_real,
      0,
    );
    const costos = (f.costos_feria || []).reduce((s, c) => s + c.monto, 0);
    const ganancia = ingresos - costos;

    return {
      nombre:
        f.nombre.length > 15 ? f.nombre.substring(0, 15) + "..." : f.nombre,
      fecha: f.fecha,
      ingresos,
      costos,
      ganancia,
    };
  });

  // Datos para gráfico de productos más vendidos
  const ventasPorProducto = {};
  ferias.forEach((f) => {
    (f.ventas_feria || []).forEach((v) => {
      const nombre = v.carta?.nombre_comercial || "Sin nombre";
      if (!ventasPorProducto[nombre]) {
        ventasPorProducto[nombre] = { nombre, cantidad: 0, ingresos: 0 };
      }
      ventasPorProducto[nombre].cantidad += v.cantidad;
      ventasPorProducto[nombre].ingresos += v.cantidad * v.precio_venta_real;
    });
  });

  const topProductos = Object.values(ventasPorProducto)
    .sort((a, b) => b.ingresos - a.ingresos)
    .slice(0, 5);

  // Datos para gráfico de márgenes
  const datosMargen = carta
    .map((c) => ({
      nombre:
        c.nombre_comercial.length > 20
          ? c.nombre_comercial.substring(0, 20) + "..."
          : c.nombre_comercial,
      cmv: c.cmv || 0,
      ctm: c.ctm || 0,
    }))
    .slice(0, 8);

  if (loading) return <Empty>Cargando...</Empty>;

  return (
    <div>
      <Title>Reportes</Title>
      <Subtitle>Visualizá el rendimiento de tu negocio con gráficos.</Subtitle>

      <Card>
        <CardTitle>📈 Evolución de ganancias por feria</CardTitle>
        {datosGanancias.length === 0 ? (
          <Empty>No hay ferias registradas para mostrar</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosGanancias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D8CE" />
              <XAxis
                dataKey="nombre"
                tick={{ fill: "#8C7B6B", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#8C7B6B", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#FFFFFF",
                  border: "1px solid #E0D8CE",
                  borderRadius: "8px",
                }}
                formatter={(value) => formatPrecio(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#27ae60"
                strokeWidth={2}
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="costos"
                stroke="#e74c3c"
                strokeWidth={2}
                name="Costos"
              />
              <Line
                type="monotone"
                dataKey="ganancia"
                stroke="#E8721C"
                strokeWidth={3}
                name="Ganancia"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Grid2>
        <Card>
          <CardTitle>🏆 Top 5 productos más vendidos</CardTitle>
          {topProductos.length === 0 ? (
            <Empty>No hay ventas registradas</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D8CE" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: "#8C7B6B", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#8C7B6B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0D8CE",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => {
                    if (name === "ingresos") return formatPrecio(value);
                    return value;
                  }}
                />
                <Legend />
                <Bar
                  dataKey="cantidad"
                  fill="#3498db"
                  name="Unidades vendidas"
                />
                <Bar dataKey="ingresos" fill="#E8721C" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardTitle>💰 Análisis de márgenes (CMV vs CTM)</CardTitle>
          {datosMargen.length === 0 ? (
            <Empty>No hay productos en la carta</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosMargen}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0D8CE" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: "#8C7B6B", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#8C7B6B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0D8CE",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="cmv" fill="#e74c3c" name="CMV %" />
                <Bar dataKey="ctm" fill="#27ae60" name="CTM %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </Grid2>

      <Card>
        <CardTitle>🎯 Distribución de ventas por producto</CardTitle>
        {topProductos.length === 0 ? (
          <Empty>No hay ventas registradas</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProductos}
                dataKey="ingresos"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ nombre, percent }) =>
                  `${nombre}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {topProductos.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatPrecio(value)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

export default Reportes;
