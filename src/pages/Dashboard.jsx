import { useState, useEffect } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";

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

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
`;

const StatCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 20px 24px;
  box-shadow: ${(p) => p.theme.shadows.sm};
  border-top: 3px solid
    ${(p) =>
      p.green
        ? p.theme.colors.success
        : p.red
          ? p.theme.colors.danger
          : p.theme.colors.primary};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-family: "DM Serif Display", serif;
  font-size: 24px;
  color: ${(p) =>
    p.green
      ? p.theme.colors.success
      : p.red
        ? p.theme.colors.danger
        : p.theme.colors.text};
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 24px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const FeriaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const FeriaNombre = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const FeriaFecha = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const FeriaGanancia = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: ${(p) => (p.green ? p.theme.colors.success : p.theme.colors.danger)};
`;

const ProductoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ProductoNombre = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const ProductoTipo = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const ProductoPrecio = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: ${(p) => p.theme.colors.primary};
`;

const Empty = styled.div`
  text-align: center;
  padding: 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13px;
`;

const GastoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const GastoDesc = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const GastoMonto = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: ${(p) => p.theme.colors.danger};
`;

function Dashboard() {
  const [ferias, setFerias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);
    const [
      { data: feriasData },
      { data: productosData },
      { data: gastosData },
    ] = await Promise.all([
      supabase
        .from("ferias")
        .select(
          `
        *,
        ventas(*),
        costos_feria(*)
      `,
        )
        .order("fecha", { ascending: false })
        .limit(5),
      supabase
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("gastos")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(5),
    ]);

    if (feriasData) setFerias(feriasData);
    if (productosData) setProductos(productosData);
    if (gastosData) setGastos(gastosData);
    setLoading(false);
  }

  function calcularGananciaFeria(feria) {
    const ingresos = (feria.ventas || []).reduce(
      (s, v) => s + v.cantidad * v.precio_venta_real,
      0,
    );
    const costos = (feria.costos_feria || []).reduce((s, c) => s + c.monto, 0);
    return ingresos - costos;
  }

  const totalGanancias = ferias.reduce(
    (s, f) => s + calcularGananciaFeria(f),
    0,
  );
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const totalFerias = ferias.length;
  const totalProductos = productos.length;

  if (loading) return <Empty>Cargando...</Empty>;

  return (
    <div>
      <Title>Bienvenido 👋</Title>
      <Subtitle>Un resumen rápido de tu negocio.</Subtitle>

      <StatGrid>
        <StatCard>
          <StatLabel>Productos</StatLabel>
          <StatValue>{totalProductos}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Ferias</StatLabel>
          <StatValue>{totalFerias}</StatValue>
        </StatCard>
        <StatCard green>
          <StatLabel>Ganancias ferias</StatLabel>
          <StatValue green>{formatPrecio(totalGanancias)}</StatValue>
        </StatCard>
        <StatCard red>
          <StatLabel>Gastos generales</StatLabel>
          <StatValue red>{formatPrecio(totalGastos)}</StatValue>
        </StatCard>
      </StatGrid>

      <Grid2>
        <Card>
          <CardTitle>🏪 Últimas ferias</CardTitle>
          {ferias.length === 0 && <Empty>No hay ferias registradas</Empty>}
          {ferias.map((f) => {
            const ganancia = calcularGananciaFeria(f);
            return (
              <FeriaRow key={f.id}>
                <div>
                  <FeriaNombre>{f.nombre}</FeriaNombre>
                  <FeriaFecha>
                    {f.fecha}
                    {f.lugar ? ` · ${f.lugar}` : ""}
                  </FeriaFecha>
                </div>
                <FeriaGanancia green={ganancia > 0}>
                  {formatPrecio(ganancia)}
                </FeriaGanancia>
              </FeriaRow>
            );
          })}
        </Card>

        <Card>
          <CardTitle>📦 Mis productos</CardTitle>
          {productos.length === 0 && <Empty>No hay productos cargados</Empty>}
          {productos.slice(0, 5).map((p) => (
            <ProductoRow key={p.id}>
              <div>
                <ProductoNombre>{p.nombre}</ProductoNombre>
                <ProductoTipo>
                  {p.tipo === "pieza" ? "🍖 Pieza" : "🥖 Sanguche"}
                </ProductoTipo>
              </div>
              <ProductoPrecio>
                {p.precio_venta
                  ? `${formatPrecio(p.precio_venta)}${p.tipo === "pieza" ? "/kg" : " c/u"}`
                  : "—"}
              </ProductoPrecio>
            </ProductoRow>
          ))}
        </Card>
      </Grid2>

      <Card>
        <CardTitle>💸 Últimos gastos</CardTitle>
        {gastos.length === 0 && <Empty>No hay gastos registrados</Empty>}
        {gastos.map((g) => (
          <GastoRow key={g.id}>
            <GastoDesc>
              {g.descripcion} ·{" "}
              <span style={{ color: "#B5A899", fontSize: 12 }}>
                {g.categoria}
              </span>
            </GastoDesc>
            <GastoMonto>{formatPrecio(g.monto)}</GastoMonto>
          </GastoRow>
        ))}
      </Card>
    </div>
  );
}

export default Dashboard;
