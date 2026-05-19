import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 4px;
`;

const PageSub = styled.p`
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

// ─── Segmented control ────────────────────────────────────────────────────────

const SegControl = styled.div`
  display: flex;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
`;

const SegBtn = styled.button`
  padding: 6px 16px;
  border-radius: 4px;
  border: none;
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => p.$active ? p.theme.colors.surface : "transparent"};
  color: ${(p) => p.$active ? p.theme.colors.text : p.theme.colors.textMuted};
  box-shadow: ${(p) => p.$active ? p.theme.shadows.sm : "none"};
  transition: all 0.15s;

  &:hover { color: ${(p) => p.theme.colors.text}; }
`;

// ─── KPIs ─────────────────────────────────────────────────────────────────────

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const KpiCard = styled.div`
  background: ${(p) => p.$accent
    ? "linear-gradient(135deg, #FDF0E8 0%, #FFF8F4 100%)"
    : p.theme.colors.surface};
  border: 1px solid ${(p) => p.$accent
    ? `${p.theme.colors.primary}33`
    : p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 18px 20px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const KpiLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const KpiValue = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: ${(p) => p.$large ? "32px" : "26px"};
  color: ${(p) =>
    p.$danger ? p.theme.colors.danger :
    p.$accent ? p.theme.colors.primary :
    p.theme.colors.text};
  line-height: 1;
  margin-bottom: 4px;
`;

const KpiSub = styled.div`
  font-size: 12px;
  color: ${(p) => p.$danger ? p.theme.colors.danger : p.theme.colors.textMuted};
  margin-top: 4px;
`;

// ─── Cards ────────────────────────────────────────────────────────────────────

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 20px 24px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const CardTitle = styled.h3`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 18px;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

// ─── Gastos por categoría ──────────────────────────────────────────────────────

const CatRow = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr 80px 46px;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const CatNombre = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.text};
`;

const BarTrack = styled.div`
  height: 6px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: 3px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${(p) => p.theme.colors.danger};
  border-radius: 3px;
  width: ${(p) => p.$pct}%;
  transition: width 0.4s;
`;

const CatMonto = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.danger};
  text-align: right;
`;

const CatPct = styled.span`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-align: right;
`;

// ─── Salud del menú ───────────────────────────────────────────────────────────

const SaludGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
`;

const SaludBucket = styled.div`
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 14px 16px;
  background: ${(p) => p.$bg};
  border: 1px solid ${(p) => p.$color}33;
`;

const SaludLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${(p) => p.$color};
  margin-bottom: 6px;
`;

const SaludCount = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) => p.$color};
  line-height: 1;
`;

const SaludRange = styled.div`
  font-size: 11px;
  color: ${(p) => p.$color}99;
  margin-top: 4px;
`;

// ─── Rankings ─────────────────────────────────────────────────────────────────

const RankRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child { border-bottom: none; }
`;

const RankNum = styled.div`
  width: 22px;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  flex-shrink: 0;
  text-align: center;
`;

const RankName = styled.div`
  flex: 1;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RankValue = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => p.$danger ? p.theme.colors.danger : p.theme.colors.primary};
  flex-shrink: 0;
`;

const RankSub = styled.div`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const CmvChip = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const Empty = styled.div`
  text-align: center;
  padding: 32px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODOS = [
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
  { value: "todo", label: "Todo" },
];

const CATS_GASTOS = ["Insumos","Transporte","Equipamiento","Impuestos","Otro"];

const SALUD = [
  { label: "Excelente", min: 0,  max: 35,  color: "#2E7D32", bg: "#EDF7EE" },
  { label: "Bueno",     min: 35, max: 50,  color: "#1565C0", bg: "#E3F2FD" },
  { label: "Ajustado",  min: 50, max: 70,  color: "#E65100", bg: "#FFF3E0" },
  { label: "Crítico",   min: 70, max: 101, color: "#C62828", bg: "#FFEBEE" },
];

function cmvColors(cmv) {
  if (cmv > 70) return { color: "#C62828", bg: "#FFEBEE" };
  if (cmv > 50) return { color: "#E65100", bg: "#FFF3E0" };
  return { color: "#2E7D32", bg: "#EDF7EE" };
}

function cutoffDate(periodo) {
  if (periodo === "todo") return null;
  const d = new Date();
  d.setDate(d.getDate() - (periodo === "30d" ? 30 : 90));
  return d.toISOString().split("T")[0];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function TooltipGastos({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E0D8CE",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#C62828" }}>−{formatPrecio(payload[0].value)}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Reportes() {
  const [periodo, setPeriodo] = useState("30d");
  const [gastos, setGastos] = useState([]);
  const [carta, setCarta] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [ferias, setFerias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    const [
      { data: gData },
      { data: cData },
      { data: iData },
      { data: fData },
    ] = await Promise.all([
      supabase.from("gastos").select("*").order("fecha"),
      supabase.from("carta").select("*, recetas(costo_por_porcion)").eq("activo", true),
      supabase.from("insumos").select("*"),
      supabase.from("ferias").select("id, tipo"),
    ]);
    if (gData) setGastos(gData);
    if (cData) setCarta(cData);
    if (iData) setInsumos(iData);
    if (fData) setFerias(fData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  const corte = cutoffDate(periodo);
  const gastosFiltrados = gastos.filter((g) => !corte || g.fecha >= corte);
  const totalGastos = gastosFiltrados.reduce((s, g) => s + g.monto, 0);

  // KPIs
  const cmvCriticos = carta.filter((c) => (c.cmv || 0) > 70).length;
  const feriaCount = ferias.filter((f) => f.tipo !== "puesto_ruta").length;
  const puestoCount = ferias.filter((f) => f.tipo === "puesto_ruta").length;

  // Chart
  const gastosPorDia = {};
  gastosFiltrados.forEach((g) => {
    gastosPorDia[g.fecha] = (gastosPorDia[g.fecha] || 0) + g.monto;
  });
  const chartData = Object.entries(gastosPorDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => {
      const [, m, d] = fecha.split("-");
      return { fecha: `${d}/${m}`, total };
    });

  // Gastos por categoría
  const gastosPorCat = CATS_GASTOS
    .map((cat) => {
      const total = gastosFiltrados
        .filter((g) => g.categoria === cat)
        .reduce((s, g) => s + g.monto, 0);
      return { cat, total, pct: totalGastos > 0 ? (total / totalGastos) * 100 : 0 };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Salud del menú
  const saludBuckets = SALUD.map((b) => ({
    ...b,
    count: carta.filter((c) => {
      const cmv = c.cmv || 0;
      return cmv >= b.min && cmv < b.max;
    }).length,
  }));

  // Top 5 insumos más caros
  const topInsumos = [...insumos]
    .filter((i) => i.costo_unitario > 0)
    .sort((a, b) => b.costo_unitario - a.costo_unitario)
    .slice(0, 5);

  // Top 6 carta por CMV más alto
  const topCmv = [...carta]
    .sort((a, b) => (b.cmv || 0) - (a.cmv || 0))
    .slice(0, 6);

  if (loading) {
    return <Empty style={{ padding: 80 }}>Cargando...</Empty>;
  }

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Reportes</PageTitle>
          <PageSub>Costos, salud del menú e indicadores del negocio.</PageSub>
        </div>
        <SegControl>
          {PERIODOS.map((p) => (
            <SegBtn
              key={p.value}
              $active={periodo === p.value}
              onClick={() => setPeriodo(p.value)}
            >
              {p.label}
            </SegBtn>
          ))}
        </SegControl>
      </PageHead>

      {/* KPIs */}
      <KpiGrid>
        <KpiCard $accent>
          <KpiLabel>Gastos totales</KpiLabel>
          <KpiValue $large $danger>{formatPrecio(totalGastos)}</KpiValue>
          <KpiSub>{gastosFiltrados.length} registros</KpiSub>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Productos en carta</KpiLabel>
          <KpiValue>{carta.length}</KpiValue>
          {cmvCriticos > 0 && (
            <KpiSub $danger>{cmvCriticos} con CMV crítico (&gt;70%)</KpiSub>
          )}
          {cmvCriticos === 0 && carta.length > 0 && (
            <KpiSub>Todos con margen saludable</KpiSub>
          )}
        </KpiCard>

        <KpiCard>
          <KpiLabel>Insumos cargados</KpiLabel>
          <KpiValue>{insumos.length}</KpiValue>
          <KpiSub>materia prima registrada</KpiSub>
        </KpiCard>

        <KpiCard>
          <KpiLabel>Eventos agendados</KpiLabel>
          <KpiValue>{ferias.length}</KpiValue>
          <KpiSub>
            {feriaCount} feria{feriaCount !== 1 ? "s" : ""} · {puestoCount} puesto{puestoCount !== 1 ? "s" : ""}
          </KpiSub>
        </KpiCard>
      </KpiGrid>

      {/* Gráfico de gastos */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>Gastos por día</CardTitle>
        {chartData.length === 0 ? (
          <Empty>Sin gastos registrados para este período.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={chartData.length > 20 ? 6 : 14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0D8CE" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fill: "#8C7B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis
                tick={{ fill: "#8C7B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipGastos />} cursor={{ fill: "#F2EDE4" }} />
              <Bar dataKey="total" fill="#C62828" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Gastos por categoría + Salud del menú */}
      <Grid2 style={{ marginBottom: 16 }}>
        <Card>
          <CardTitle>Gastos por categoría</CardTitle>
          {gastosPorCat.length === 0 ? (
            <Empty>Sin gastos en este período.</Empty>
          ) : (
            gastosPorCat.map((c) => (
              <CatRow key={c.cat}>
                <CatNombre>{c.cat}</CatNombre>
                <BarTrack><BarFill $pct={c.pct} /></BarTrack>
                <CatMonto>{formatPrecio(c.total)}</CatMonto>
                <CatPct>{c.pct.toFixed(0)}%</CatPct>
              </CatRow>
            ))
          )}
        </Card>

        <Card>
          <CardTitle>Salud del menú</CardTitle>
          <SaludGrid>
            {saludBuckets.map((b) => (
              <SaludBucket key={b.label} $bg={b.bg} $color={b.color}>
                <SaludLabel $color={b.color}>{b.label}</SaludLabel>
                <SaludCount $color={b.color}>{b.count}</SaludCount>
                <SaludRange $color={b.color}>CMV {b.min}–{b.max === 101 ? "100" : b.max}%</SaludRange>
              </SaludBucket>
            ))}
          </SaludGrid>
        </Card>
      </Grid2>

      {/* Insumos más caros + Carta por margen */}
      <Grid2>
        <Card>
          <CardTitle>Insumos más caros</CardTitle>
          {topInsumos.length === 0 ? (
            <Empty>Sin insumos cargados.</Empty>
          ) : (
            topInsumos.map((ins, i) => (
              <RankRow key={ins.id}>
                <RankNum>{String(i + 1).padStart(2, "0")}</RankNum>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <RankName>{ins.nombre}</RankName>
                  {ins.categoria && <RankSub>{ins.categoria}</RankSub>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <RankValue>{formatPrecio(ins.costo_unitario)}</RankValue>
                  <RankSub>/{ins.unidad_medida}</RankSub>
                </div>
              </RankRow>
            ))
          )}
        </Card>

        <Card>
          <CardTitle>Carta por margen (peor primero)</CardTitle>
          {topCmv.length === 0 ? (
            <Empty>Sin productos en carta.</Empty>
          ) : (
            topCmv.map((c, i) => {
              const cmv = c.cmv || 0;
              const { color, bg } = cmvColors(cmv);
              return (
                <RankRow key={c.id}>
                  <RankNum>{String(i + 1).padStart(2, "0")}</RankNum>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <RankName>{c.nombre_comercial}</RankName>
                    <RankSub>{formatPrecio(c.precio_venta)}</RankSub>
                  </div>
                  <CmvChip $color={color} $bg={bg}>CMV {cmv.toFixed(1)}%</CmvChip>
                </RankRow>
              );
            })
          )}
        </Card>
      </Grid2>
    </div>
  );
}

export default Reportes;
