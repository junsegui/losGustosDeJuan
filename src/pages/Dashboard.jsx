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

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemNombre = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const ItemDetalle = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const ItemValue = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: ${(p) =>
    p.green
      ? p.theme.colors.success
      : p.red
        ? p.theme.colors.danger
        : p.highlight
          ? p.theme.colors.primary
          : p.theme.colors.text};
`;

const Empty = styled.div`
  text-align: center;
  padding: 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13px;
`;

const Alert = styled.div`
  background: ${(p) => p.theme.colors.dangerLight};
  border: 1px solid ${(p) => p.theme.colors.danger}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AlertIcon = styled.div`
  font-size: 20px;
`;

const AlertText = styled.div`
  flex: 1;
  font-size: 14px;
  color: ${(p) => p.theme.colors.danger};
  font-weight: 500;
`;

function Dashboard() {
  const [stats, setStats] = useState({
    insumos: 0,
    subRecetas: 0,
    recetas: 0,
    carta: 0,
    ferias: 0,
    totalGanancias: 0,
    totalGastos: 0,
  });
  const [ferias, setFerias] = useState([]);
  const [carta, setCarta] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);

    const [
      { data: insumosData },
      { data: subRecetasData },
      { data: recetasData },
      { data: cartaData },
      { data: feriasData },
      { data: gastosData },
    ] = await Promise.all([
      supabase.from("insumos").select("id"),
      supabase.from("sub_recetas").select("id"),
      supabase.from("recetas").select("id"),
      supabase
        .from("carta")
        .select("*, recetas(costo_por_porcion)")
        .eq("activo", true),
      supabase
        .from("ferias")
        .select(
          `
        *,
        ventas_feria(*),
        costos_feria(*)
      `,
        )
        .order("fecha", { ascending: false })
        .limit(5),
      supabase
        .from("gastos")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(5),
    ]);

    const totalGanancias = (feriasData || []).reduce((sum, f) => {
      const ingresos = (f.ventas_feria || []).reduce(
        (s, v) => s + v.cantidad * v.precio_venta_real,
        0,
      );
      const costos = (f.costos_feria || []).reduce((s, c) => s + c.monto, 0);
      return sum + (ingresos - costos);
    }, 0);

    const totalGastos = (gastosData || []).reduce((sum, g) => sum + g.monto, 0);

    setStats({
      insumos: insumosData?.length || 0,
      subRecetas: subRecetasData?.length || 0,
      recetas: recetasData?.length || 0,
      carta: cartaData?.length || 0,
      ferias: feriasData?.length || 0,
      totalGanancias,
      totalGastos,
    });

    setFerias(feriasData || []);
    setCarta(cartaData || []);
    setGastos(gastosData || []);
    setLoading(false);
  }

  function calcularGananciaFeria(feria) {
    const ingresos = (feria.ventas_feria || []).reduce(
      (s, v) => s + v.cantidad * v.precio_venta_real,
      0,
    );
    const costos = (feria.costos_feria || []).reduce((s, c) => s + c.monto, 0);
    return ingresos - costos;
  }

  const productosMargenBajo = carta.filter((c) => c.cmv > 70);

  if (loading) return <Empty>Cargando...</Empty>;

  return (
    <div>
      <Title>Bienvenido 👋</Title>
      <Subtitle>Un resumen rápido de tu negocio.</Subtitle>

      {productosMargenBajo.length > 0 && (
        <Alert>
          <AlertIcon>⚠️</AlertIcon>
          <AlertText>
            Tenés {productosMargenBajo.length} producto
            {productosMargenBajo.length > 1 ? "s" : ""} con margen muy bajo (CMV
            &gt; 70%). Revisá los precios en la Carta.
          </AlertText>
        </Alert>
      )}

      <StatGrid>
        <StatCard>
          <StatLabel>Insumos</StatLabel>
          <StatValue>{stats.insumos}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Productos en carta</StatLabel>
          <StatValue>{stats.carta}</StatValue>
        </StatCard>
        <StatCard green>
          <StatLabel>Ganancias ferias</StatLabel>
          <StatValue green>{formatPrecio(stats.totalGanancias)}</StatValue>
        </StatCard>
        <StatCard red>
          <StatLabel>Gastos generales</StatLabel>
          <StatValue red>{formatPrecio(stats.totalGastos)}</StatValue>
        </StatCard>
      </StatGrid>

      <Grid2>
        <Card>
          <CardTitle>🏪 Últimas ferias</CardTitle>
          {ferias.length === 0 && <Empty>No hay ferias registradas</Empty>}
          {ferias.map((f) => {
            const ganancia = calcularGananciaFeria(f);
            return (
              <ItemRow key={f.id}>
                <div>
                  <ItemNombre>{f.nombre}</ItemNombre>
                  <ItemDetalle>
                    {f.fecha}
                    {f.lugar ? ` · ${f.lugar}` : ""}
                  </ItemDetalle>
                </div>
                <ItemValue green={ganancia > 0} red={ganancia < 0}>
                  {formatPrecio(ganancia)}
                </ItemValue>
              </ItemRow>
            );
          })}
        </Card>

        <Card>
          <CardTitle>📋 Productos en carta</CardTitle>
          {carta.length === 0 && <Empty>No hay productos en la carta</Empty>}
          {carta.slice(0, 5).map((c) => (
            <ItemRow key={c.id}>
              <div>
                <ItemNombre>{c.nombre_comercial}</ItemNombre>
                <ItemDetalle>
                  CMV: {c.cmv?.toFixed(1)}% · CTM: {c.ctm?.toFixed(1)}%
                </ItemDetalle>
              </div>
              <ItemValue highlight>{formatPrecio(c.precio_venta)}</ItemValue>
            </ItemRow>
          ))}
        </Card>
      </Grid2>

      <Card>
        <CardTitle>💸 Últimos gastos</CardTitle>
        {gastos.length === 0 && <Empty>No hay gastos registrados</Empty>}
        {gastos.map((g) => (
          <ItemRow key={g.id}>
            <div>
              <ItemNombre>{g.descripcion}</ItemNombre>
              <ItemDetalle>
                {g.categoria} · {g.fecha}
              </ItemDetalle>
            </div>
            <ItemValue red>{formatPrecio(g.monto)}</ItemValue>
          </ItemRow>
        ))}
      </Card>
    </div>
  );
}

export default Dashboard;
