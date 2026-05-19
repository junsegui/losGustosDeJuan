import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { MapPin, Calendar } from "lucide-react";

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 4px;
`;

const PageSub = styled.p`
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
  margin-bottom: 28px;
`;

const ListWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// ─── Card ─────────────────────────────────────────────────────────────────────

const LugarCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 18px 20px;
  box-shadow: ${(p) => p.theme.shadows.sm};
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.15s;

  &:hover { box-shadow: ${(p) => p.theme.shadows.md}; }

  @media (max-width: 600px) {
    grid-template-columns: 40px 1fr auto;
    gap: 12px;
  }
`;

const PosBlock = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${(p) => p.theme.radii.sm};
  background: ${(p) => p.$first ? p.theme.colors.primary : p.theme.colors.surfaceAlt};
  color: ${(p) => p.$first ? "white" : p.theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 18px;
  flex-shrink: 0;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const LugarNombre = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 18px;
  color: ${(p) => p.theme.colors.text};
  line-height: 1.2;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const VisitaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 2px;
`;

const VisitaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: ${(p) => p.$accent ? p.theme.colors.primary : p.theme.colors.textMuted};
  font-weight: ${(p) => p.$accent ? "600" : "400"};
`;

const BarWrap = styled.div`
  margin-top: 8px;
`;

const BarTrack = styled.div`
  height: 4px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: 2px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${(p) => p.theme.colors.primary};
  border-radius: 2px;
  width: ${(p) => p.$pct}%;
  opacity: 0.6;
  transition: width 0.4s;
`;

const CountBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
`;

const CountNum = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 36px;
  color: ${(p) => p.theme.colors.primary};
  line-height: 1;
`;

const CountLabel = styled.div`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-align: right;
`;

const Empty = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

function formatFecha(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AnalisisPorLugar() {
  const [ferias, setFerias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ferias")
      .select("id, nombre, tipo, fecha, lugar")
      .order("fecha", { ascending: true });
    if (data) setFerias(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDatos(); }, [fetchDatos]);

  const hoy = new Date().toISOString().split("T")[0];

  // Group by lugar, skip events with no lugar
  const lugarMap = {};
  ferias.forEach((f) => {
    const lugar = f.lugar?.trim();
    if (!lugar) return;

    if (!lugarMap[lugar]) {
      lugarMap[lugar] = { nombre: lugar, total: 0, ferias: 0, puestos: 0, fechas: [] };
    }
    lugarMap[lugar].total++;
    if (f.tipo === "puesto_ruta") lugarMap[lugar].puestos++;
    else lugarMap[lugar].ferias++;
    lugarMap[lugar].fechas.push(f.fecha);
  });

  const lugares = Object.values(lugarMap)
    .sort((a, b) => b.total - a.total)
    .map((l, i) => {
      const pasadas = [...l.fechas].filter((f) => f < hoy).sort().reverse();
      const futuras = [...l.fechas].filter((f) => f >= hoy).sort();
      return {
        ...l,
        posicion: i + 1,
        ultimaVisita: pasadas[0] || null,
        proximaVisita: futuras[0] || null,
      };
    });

  const maxTotal = Math.max(...lugares.map((l) => l.total), 1);
  const sinLugar = ferias.filter((f) => !f.lugar?.trim()).length;

  if (loading) {
    return <Empty>Cargando...</Empty>;
  }

  if (lugares.length === 0) {
    return (
      <div>
        <PageTitle>Análisis por lugar</PageTitle>
        <PageSub>Frecuencia de visitas y agenda por ubicación.</PageSub>
        <Empty>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📍</div>
          <p>No hay eventos con lugar especificado todavía.</p>
          <p style={{ marginTop: 6, fontSize: 13 }}>
            Agregá el campo "Lugar" en tus eventos para ver este análisis.
          </p>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Análisis por lugar</PageTitle>
      <PageSub>
        Frecuencia de visitas por ubicación.
        {sinLugar > 0 && ` · ${sinLugar} evento${sinLugar !== 1 ? "s" : ""} sin lugar asignado.`}
      </PageSub>

      <ListWrap>
        {lugares.map((l) => (
          <LugarCard key={l.nombre}>
            <PosBlock $first={l.posicion === 1}>
              {String(l.posicion).padStart(2, "0")}
            </PosBlock>

            <CardBody>
              <LugarNombre>{l.nombre}</LugarNombre>

              <MetaRow>
                <MetaPill>
                  <MapPin size={11} />
                  {l.ferias > 0 && `${l.ferias} feria${l.ferias !== 1 ? "s" : ""}`}
                  {l.ferias > 0 && l.puestos > 0 && " · "}
                  {l.puestos > 0 && `${l.puestos} puesto${l.puestos !== 1 ? "s" : ""}`}
                </MetaPill>
              </MetaRow>

              <VisitaRow>
                {l.proximaVisita && (
                  <VisitaItem $accent>
                    <Calendar size={11} />
                    Próxima: {formatFecha(l.proximaVisita)}
                  </VisitaItem>
                )}
                {l.ultimaVisita && (
                  <VisitaItem>
                    <Calendar size={11} />
                    Última: {formatFecha(l.ultimaVisita)}
                  </VisitaItem>
                )}
                {!l.proximaVisita && !l.ultimaVisita && (
                  <VisitaItem>Sin fechas registradas</VisitaItem>
                )}
              </VisitaRow>

              <BarWrap>
                <BarTrack>
                  <BarFill $pct={(l.total / maxTotal) * 100} />
                </BarTrack>
              </BarWrap>
            </CardBody>

            <CountBlock>
              <CountNum>{l.total}</CountNum>
              <CountLabel>visita{l.total !== 1 ? "s" : ""}</CountLabel>
            </CountBlock>
          </LugarCard>
        ))}
      </ListWrap>
    </div>
  );
}

export default AnalisisPorLugar;
