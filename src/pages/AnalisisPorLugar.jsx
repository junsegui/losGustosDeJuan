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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LugarCard = styled(Card)`
  border-left: 4px solid ${(p) => p.theme.colors.primary};
`;

const LugarNombre = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 16px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StatItem = styled.div`
  background: ${(p) => p.theme.colors.background};
  padding: 12px;
  border-radius: ${(p) => p.theme.radii.sm};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.green ? p.theme.colors.success : p.theme.colors.text)};
`;

const ProductoDestacado = styled.div`
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductoNombre = styled.div`
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const ProductoCantidad = styled.div`
  font-size: 14px;
  color: ${(p) => p.theme.colors.primary};
  font-weight: 600;
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

function AnalisisPorLugar() {
  const [ferias, setFerias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatos();
  }, []);

  async function fetchDatos() {
    setLoading(true);
    const { data: feriasData } = await supabase
      .from("ferias")
      .select(
        `
        *,
        ventas_feria(*, carta(nombre_comercial)),
        costos_feria(*)
      `,
      )
      .order("fecha", { ascending: true });

    if (feriasData) setFerias(feriasData);
    setLoading(false);
  }

  // Agrupar por lugar
  const porLugar = {};
  ferias.forEach((f) => {
    const lugar = f.lugar || "Sin lugar especificado";
    if (!porLugar[lugar]) {
      porLugar[lugar] = {
        ferias: [],
        totalGanancia: 0,
        totalIngresos: 0,
        totalCostos: 0,
        productos: {},
      };
    }

    const ingresos = (f.ventas_feria || []).reduce(
      (s, v) => s + v.cantidad * v.precio_venta_real,
      0,
    );
    const costos = (f.costos_feria || []).reduce((s, c) => s + c.monto, 0);
    const ganancia = ingresos - costos;

    porLugar[lugar].ferias.push(f);
    porLugar[lugar].totalGanancia += ganancia;
    porLugar[lugar].totalIngresos += ingresos;
    porLugar[lugar].totalCostos += costos;

    // Contar productos vendidos
    f.ventas_feria?.forEach((v) => {
      const nombre = v.carta?.nombre_comercial || "Sin nombre";
      if (!porLugar[lugar].productos[nombre]) {
        porLugar[lugar].productos[nombre] = 0;
      }
      porLugar[lugar].productos[nombre] += v.cantidad;
    });
  });

  // Datos para el gráfico
  const datosGrafico = Object.entries(porLugar)
    .map(([lugar, data]) => ({
      lugar: lugar.length > 15 ? lugar.substring(0, 15) + "..." : lugar,
      ganancia: data.totalGanancia,
      eventos: data.ferias.length,
    }))
    .sort((a, b) => b.ganancia - a.ganancia);

  if (loading) return <Empty>Cargando...</Empty>;

  if (Object.keys(porLugar).length === 0) {
    return (
      <div>
        <Title>Análisis por Lugar</Title>
        <Subtitle>Comparación de rendimiento en cada feria.</Subtitle>
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
          <p>No hay ferias con lugares especificados todavía.</p>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <Title>Análisis por Lugar</Title>
      <Subtitle>Comparación de rendimiento en cada feria.</Subtitle>

      <Card>
        <CardTitle>📊 Ganancia total por lugar</CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0D8CE" />
            <XAxis dataKey="lugar" tick={{ fill: "#8C7B6B", fontSize: 12 }} />
            <YAxis tick={{ fill: "#8C7B6B", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E0D8CE",
                borderRadius: "8px",
              }}
              formatter={(value, name) => {
                if (name === "ganancia") return formatPrecio(value);
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="ganancia" fill="#E8721C" name="Ganancia total" />
            <Bar dataKey="eventos" fill="#3498db" name="Cantidad de eventos" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Grid2>
        {Object.entries(porLugar)
          .sort((a, b) => b[1].totalGanancia - a[1].totalGanancia)
          .map(([lugar, data]) => {
            const promedioGanancia = data.totalGanancia / data.ferias.length;
            const productoTop = Object.entries(data.productos).sort(
              (a, b) => b[1] - a[1],
            )[0];

            return (
              <LugarCard key={lugar}>
                <LugarNombre>📍 {lugar}</LugarNombre>

                <StatGrid>
                  <StatItem>
                    <StatLabel>Total ganado</StatLabel>
                    <StatValue green>
                      {formatPrecio(data.totalGanancia)}
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Eventos</StatLabel>
                    <StatValue>{data.ferias.length}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Promedio/evento</StatLabel>
                    <StatValue>{formatPrecio(promedioGanancia)}</StatValue>
                  </StatItem>
                </StatGrid>

                {productoTop && (
                  <div>
                    <StatLabel style={{ marginBottom: 8 }}>
                      ⭐ Producto más vendido
                    </StatLabel>
                    <ProductoDestacado>
                      <ProductoNombre>{productoTop[0]}</ProductoNombre>
                      <ProductoCantidad>
                        {productoTop[1]} unidades
                      </ProductoCantidad>
                    </ProductoDestacado>
                  </div>
                )}
              </LugarCard>
            );
          })}
      </Grid2>
    </div>
  );
}

export default AnalisisPorLugar;
