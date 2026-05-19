import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";

// ── helpers ──────────────────────────────────────────────────────────────────

function cmvColor(cmv, theme) {
  if (cmv > 70) return theme.colors.danger;
  if (cmv > 50) return theme.colors.warning;
  return theme.colors.success;
}

function cmvBg(cmv, theme) {
  if (cmv > 70) return theme.colors.dangerLight;
  if (cmv > 50) return theme.colors.warningLight;
  return theme.colors.successLight;
}

const today = new Date();
const todayKey = today.toISOString().slice(0, 10);

function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

function fmtDateFull(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtPct(n) {
  return (n || 0).toFixed(1) + "%";
}

// ── styled components ─────────────────────────────────────────────────────────

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 4px;
  line-height: 1.15;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const PageSub = styled.div`
  font-size: 13.5px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-size: 13px;
  font-weight: 500;
  font-family: ${(p) => p.theme.fonts.sans};
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  background: ${(p) => (p.$accent ? p.theme.colors.primary : p.theme.colors.surface)};
  color: ${(p) => (p.$accent ? "#fff" : p.theme.colors.text)};
  border: 1px solid ${(p) => (p.$accent ? p.theme.colors.primary : p.theme.colors.border)};

  svg { width: 14px; height: 14px; }

  &:hover {
    background: ${(p) =>
      p.$accent ? p.theme.colors.primaryHover : p.theme.colors.surfaceHover};
    border-color: ${(p) =>
      p.$accent ? p.theme.colors.primaryHover : p.theme.colors.borderStrong};
  }
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${(p) => p.theme.colors.dangerLight};
  border: 1px solid ${(p) => p.theme.colors.danger}44;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 14px 18px;
  margin-bottom: 20px;

  svg { width: 18px; height: 18px; color: ${(p) => p.theme.colors.danger}; flex-shrink: 0; }
`;

const AlertText = styled.div`
  flex: 1;
  font-size: 13.5px;
  color: ${(p) => p.theme.colors.text};

  strong { color: ${(p) => p.theme.colors.danger}; }
  span { color: ${(p) => p.theme.colors.textMuted}; }
`;

const AlertBtn = styled.button`
  padding: 6px 12px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.surface};
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  color: ${(p) => p.theme.colors.text};
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; }
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled.div`
  background: ${(p) =>
    p.$prominent
      ? `linear-gradient(135deg, ${p.theme.colors.primaryLight} 0%, ${p.theme.colors.surface} 100%)`
      : p.theme.colors.surface};
  border: 1px solid
    ${(p) =>
      p.$prominent
        ? `${p.theme.colors.primary}44`
        : p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 18px 20px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const KpiLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;

  svg { width: 13px; height: 13px; }
`;

const KpiValue = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) =>
    p.$prominent ? p.theme.colors.primaryHover : p.theme.colors.text};
  line-height: 1;
  margin-bottom: 6px;
`;

const KpiDelta = styled.div`
  font-size: 12px;
  color: ${(p) =>
    p.$kind === "up"
      ? p.theme.colors.success
      : p.$kind === "down"
        ? p.theme.colors.danger
        : p.theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadows.sm};
  overflow: hidden;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const CardTitleWrap = styled.div``;

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const CardSub = styled.div`
  font-size: 11.5px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const CardLinkBtn = styled.button`
  font-size: 12px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${(p) => p.theme.radii.sm};
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; color: ${(p) => p.theme.colors.text}; }
`;

const CardPad = styled.div`
  padding: 14px 18px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 18px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child { border-bottom: none; }
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; }
`;

const ItemName = styled.div`
  font-size: 13.5px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.text};
`;

const ItemSub = styled.div`
  font-size: 11.5px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  background: ${(p) => p.$bg || p.theme.colors.surfaceAlt};
  color: ${(p) => p.$color || p.theme.colors.textMuted};
  border: 1px solid ${(p) => p.$border || p.theme.colors.border};
`;

const MonoVal = styled.div`
  font-family: ${(p) => p.theme.fonts.mono};
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) =>
    p.$accent
      ? p.theme.colors.primaryHover
      : p.$danger
        ? p.theme.colors.danger
        : p.theme.colors.text};
  white-space: nowrap;
`;

const ProgressTrack = styled.div`
  height: 5px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: 99px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 99px;
  background: ${(p) => p.$color || p.theme.colors.primary};
  width: ${(p) => p.$pct || 0}%;
  transition: width 0.3s;
`;

const EventDateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 8px;
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) =>
    p.$upcoming ? p.theme.colors.primaryLight : p.theme.colors.surfaceAlt};
  border: 1px solid
    ${(p) =>
      p.$upcoming ? `${p.theme.colors.primary}33` : p.theme.colors.border};
`;

const EventMonth = styled.div`
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) =>
    p.$upcoming ? p.theme.colors.primaryHover : p.theme.colors.textMuted};
`;

const EventDay = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 22px;
  line-height: 1;
  color: ${(p) =>
    p.$upcoming ? p.theme.colors.primaryHover : p.theme.colors.text};
`;

const EventDow = styled.div`
  font-size: 9.5px;
  color: ${(p) =>
    p.$upcoming ? p.theme.colors.primaryHover : p.theme.colors.textMuted};
  margin-top: 2px;
`;

const EmptyWrap = styled.div`
  padding: 28px;
  text-align: center;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) => p.theme.colors.textMuted};
  padding: 16px 18px 6px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

// ── component ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const [carta, setCarta] = useState([]);
  const [ferias, setFerias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);
    const [
      { data: cartaData },
      { data: feriasData },
      { data: gastosData },
    ] = await Promise.all([
      supabase
        .from("carta")
        .select("*, recetas(costo_por_porcion)")
        .eq("activo", true),
      supabase.from("ferias").select("*").order("fecha", { ascending: false }),
      supabase.from("gastos").select("*").order("fecha", { ascending: false }),
    ]);

    setCarta(cartaData || []);
    setFerias(feriasData || []);
    setGastos(gastosData || []);
    setLoading(false);
  }

  // ── derived data ────────────────────────────────────────────────────────────

  const margenBajos = carta.filter((c) => c.cmv > 70);
  const margenPromedio =
    carta.length > 0
      ? carta.reduce((a, c) => a + (c.ctm ?? 100 - c.cmv), 0) / carta.length
      : 0;

  const upcoming = ferias
    .filter((f) => f.fecha >= todayKey)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const currentMonth = todayKey.slice(0, 7);
  const gastosDelMes = gastos.filter((g) => g.fecha?.startsWith(currentMonth));
  const totalGastosDelMes = gastosDelMes.reduce((a, g) => a + g.monto, 0);

  // gastos por categoría
  const catMap = {};
  gastos.forEach((g) => {
    if (!g.categoria) return;
    catMap[g.categoria] = (catMap[g.categoria] || 0) + g.monto;
  });
  const gastosCat = Object.entries(catMap)
    .map(([cat, total]) => ({ cat, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxCat = Math.max(...gastosCat.map((x) => x.total), 1);

  const gastosRecientes = gastos.slice(0, 5);

  // ── render helpers ──────────────────────────────────────────────────────────

  function renderEventoRow(feria) {
    const dt = new Date(feria.fecha + "T12:00:00");
    const isUpcoming = feria.fecha >= todayKey;
    const mes = dt.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
    const dow = dt.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
    return (
      <Row key={feria.id} style={{ gap: 12, alignItems: "center", padding: "10px 18px" }}>
        <EventDateBlock $upcoming={isUpcoming}>
          <EventMonth $upcoming={isUpcoming}>{mes}</EventMonth>
          <EventDay $upcoming={isUpcoming}>{dt.getDate()}</EventDay>
          <EventDow $upcoming={isUpcoming}>{dow}</EventDow>
        </EventDateBlock>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ItemName style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {feria.nombre}
          </ItemName>
          <ItemSub>
            {feria.tipo === "puesto_ruta" ? "Puesto en ruta" : "Feria"}
            {feria.lugar ? ` · ${feria.lugar}` : ""}
          </ItemSub>
        </div>
      </Row>
    );
  }

  if (loading) {
    return <EmptyWrap>Cargando resumen…</EmptyWrap>;
  }

  const dateLabel = today.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      {/* Header */}
      <PageHeader>
        <div>
          <PageTitle>Hola, Juan 👋</PageTitle>
          <PageSub>Un resumen rápido del negocio — {dateLabel}</PageSub>
        </div>
        <HeaderActions>
          <Btn onClick={() => navigate("/gastos")}>
            <Plus /> Nuevo gasto
          </Btn>
          <Btn $accent onClick={() => navigate("/ferias")}>
            <Calendar /> Nuevo evento
          </Btn>
        </HeaderActions>
      </PageHeader>

      {/* Alerta CMV */}
      {margenBajos.length > 0 && (
        <AlertBanner>
          <AlertTriangle />
          <AlertText>
            <strong>{margenBajos.length} producto{margenBajos.length > 1 ? "s" : ""} con margen crítico (CMV &gt; 70%).</strong>{" "}
            <span>Revisá los precios en la Carta.</span>
          </AlertText>
          <AlertBtn onClick={() => navigate("/carta")}>Ver carta →</AlertBtn>
        </AlertBanner>
      )}

      {/* KPIs */}
      <KpiGrid>
        <KpiCard $prominent>
          <KpiLabel><DollarSign /> Productos en carta</KpiLabel>
          <KpiValue $prominent>{carta.length}</KpiValue>
          {margenBajos.length > 0 ? (
            <KpiDelta $kind="down">{margenBajos.length} con margen bajo</KpiDelta>
          ) : (
            <KpiDelta>todos en orden</KpiDelta>
          )}
        </KpiCard>

        <KpiCard>
          <KpiLabel><TrendingUp /> Margen promedio</KpiLabel>
          <KpiValue>{fmtPct(margenPromedio)}</KpiValue>
          <KpiDelta $kind={margenPromedio > 50 ? "up" : "down"}>
            {margenPromedio > 50 ? "saludable" : "revisar precios"}
          </KpiDelta>
        </KpiCard>

        <KpiCard>
          <KpiLabel><Calendar /> Próximos eventos</KpiLabel>
          <KpiValue>{upcoming.length}</KpiValue>
          <KpiDelta>
            {upcoming[0]
              ? `Próximo: ${fmtDate(upcoming[0].fecha)}`
              : "sin eventos agendados"}
          </KpiDelta>
        </KpiCard>

        <KpiCard>
          <KpiLabel><ShoppingCart /> Gastos del mes</KpiLabel>
          <KpiValue style={{ fontSize: 22 }}>{formatPrecio(totalGastosDelMes)}</KpiValue>
          <KpiDelta>{gastosDelMes.length} registros</KpiDelta>
        </KpiCard>
      </KpiGrid>

      {/* Grid 1: próximos eventos + gastos por categoría */}
      <Grid2>
        <Card>
          <CardHead>
            <CardTitleWrap>
              <CardTitle>Próximos eventos</CardTitle>
              <CardSub>
                {upcoming.length === 0 ? "Nada en la agenda" : `${upcoming.length} confirmados`}
              </CardSub>
            </CardTitleWrap>
            <CardLinkBtn onClick={() => navigate("/ferias")}>Ver todos →</CardLinkBtn>
          </CardHead>
          {upcoming.length === 0 ? (
            <EmptyWrap>
              Sin eventos agendados —{" "}
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  textDecoration: "underline",
                  fontSize: "inherit",
                  padding: 0,
                }}
                onClick={() => navigate("/ferias")}
              >
                agendá uno
              </button>
            </EmptyWrap>
          ) : (
            upcoming.slice(0, 4).map(renderEventoRow)
          )}
        </Card>

        <Card>
          <CardHead>
            <CardTitleWrap>
              <CardTitle>Gastos por categoría</CardTitle>
              <CardSub>{formatPrecio(gastos.reduce((a, g) => a + g.monto, 0))} total</CardSub>
            </CardTitleWrap>
            <CardLinkBtn onClick={() => navigate("/gastos")}>Ver →</CardLinkBtn>
          </CardHead>
          {gastosCat.length === 0 ? (
            <EmptyWrap>Sin gastos registrados</EmptyWrap>
          ) : (
            <CardPad style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gastosCat.map((x) => (
                <div key={x.cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "inherit" }}>{x.cat}</span>
                    <MonoVal style={{ fontSize: 12.5 }}>{formatPrecio(x.total)}</MonoVal>
                  </div>
                  <ProgressTrack>
                    <ProgressFill $pct={(x.total / maxCat) * 100} />
                  </ProgressTrack>
                </div>
              ))}
            </CardPad>
          )}
        </Card>
      </Grid2>

      {/* Grid 2: productos en carta + últimos gastos */}
      <Grid2>
        <Card>
          <CardHead>
            <CardTitleWrap>
              <CardTitle>Productos en carta</CardTitle>
              <CardSub>CMV: rojo &gt; 70%, ámbar 50–70%, verde &lt; 50%</CardSub>
            </CardTitleWrap>
            <CardLinkBtn onClick={() => navigate("/carta")}>Ver carta →</CardLinkBtn>
          </CardHead>
          {carta.length === 0 ? (
            <EmptyWrap>Sin productos en la carta</EmptyWrap>
          ) : (
            carta.slice(0, 6).map((c) => (
              <Row key={c.id} style={{ alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ItemName style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.nombre_comercial}
                  </ItemName>
                  <ItemSub>
                    Costo {formatPrecio(c.recetas?.costo_por_porcion)} · Markup {c.markup}%
                  </ItemSub>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CmvPill cmv={c.cmv} />
                  <MonoVal $accent style={{ minWidth: 80, textAlign: "right" }}>
                    {formatPrecio(c.precio_venta)}
                  </MonoVal>
                </div>
              </Row>
            ))
          )}
        </Card>

        <Card>
          <CardHead>
            <CardTitleWrap>
              <CardTitle>Últimos gastos</CardTitle>
              <CardSub>{gastosRecientes.length} registros recientes</CardSub>
            </CardTitleWrap>
            <CardLinkBtn onClick={() => navigate("/gastos")}>Ver todos →</CardLinkBtn>
          </CardHead>
          {gastosRecientes.length === 0 ? (
            <EmptyWrap>Sin gastos registrados</EmptyWrap>
          ) : (
            gastosRecientes.map((g) => (
              <Row key={g.id} style={{ alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ItemName style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {g.descripcion}
                  </ItemName>
                  <ItemSub>
                    <Pill style={{ marginRight: 6 }}>{g.categoria}</Pill>
                    {fmtDateFull(g.fecha)}
                  </ItemSub>
                </div>
                <MonoVal $danger>
                  −{formatPrecio(g.monto)}
                </MonoVal>
              </Row>
            ))
          )}
        </Card>
      </Grid2>
    </div>
  );
}

function CmvPill({ cmv }) {
  const c = cmv ?? 0;
  let bg, color, border;
  if (c > 70) {
    bg = "#FFEBEE"; color = "#C62828"; border = "#C6282844";
  } else if (c > 50) {
    bg = "#FFF3E0"; color = "#E65100"; border = "#E6510044";
  } else {
    bg = "#EDF7EE"; color = "#2E7D32"; border = "#2E7D3244";
  }
  return (
    <Pill $bg={bg} $color={color} $border={border} style={{ minWidth: 68, justifyContent: "center" }}>
      CMV {fmtPct(c)}
    </Pill>
  );
}

export default Dashboard;
