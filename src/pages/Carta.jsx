import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { formatPrecio } from "../lib/calculos";
import ExportarExcel from "../components/ExportarExcel";

// ── helpers ──────────────────────────────────────────────────────────────────

function cmvKind(cmv) {
  if (cmv > 70) return "danger";
  if (cmv > 50) return "warn";
  return "good";
}

function cmvColors(cmv) {
  if (cmv > 70) return { border: "#C62828", bg: "#FFEBEE", text: "#C62828" };
  if (cmv > 50) return { border: "#E65100", bg: "#FFF3E0", text: "#E65100" };
  return { border: "#2E7D32", bg: "#EDF7EE", text: "#2E7D32" };
}

// ── shared primitives ─────────────────────────────────────────────────────────

const FieldLabel = styled.label`
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 13.5px;
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const SelectEl = styled.select`
  width: 100%;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 13.5px;
  padding: 9px 12px;
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

const FieldHint = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 4px;
`;

const LinkBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${(p) => p.theme.colors.primaryHover};
  font-weight: 600;
  font-size: inherit;
  text-decoration: underline;
  &:hover { opacity: 0.8; }
`;

const BtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: none;
  background: ${(p) => p.theme.colors.primary};
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: ${(p) => p.theme.fonts.sans};
  cursor: pointer;
  transition: background 0.12s;
  svg { width: 14px; height: 14px; }
  &:hover { background: ${(p) => p.theme.colors.primaryHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BtnGhost = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  font-size: 13px;
  font-weight: 500;
  font-family: ${(p) => p.theme.fonts.sans};
  cursor: pointer;
  transition: background 0.12s;
  svg { width: 14px; height: 14px; }
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; }
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => (p.$danger ? p.theme.colors.danger : p.theme.colors.textMuted)};
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  svg { width: 14px; height: 14px; }
  &:hover {
    background: ${(p) => (p.$danger ? p.theme.colors.dangerLight : p.theme.colors.surfaceHover)};
    color: ${(p) => (p.$danger ? p.theme.colors.danger : p.theme.colors.text)};
  }
`;

// ── layout ────────────────────────────────────────────────────────────────────

const PageHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  @media (max-width: 640px) { flex-direction: column; }
`;

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 4px;
`;

const PageSub = styled.div`
  font-size: 13.5px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 300px;
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    color: ${(p) => p.theme.colors.textMuted};
    pointer-events: none;
  }
`;

const SearchInput = styled(Input)`
  padding-left: 32px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const LegendDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  margin-right: 4px;
`;

const CartaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CartaCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-left: 4px solid ${(p) => p.$borderColor || p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadows.sm};
  overflow: hidden;
`;

const CartaCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 18px 12px;
`;

const CartaNombre = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 18px;
  color: ${(p) => p.theme.colors.text};
  line-height: 1.2;
`;

const CartaSub = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 3px;
`;

const CartaStats = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-top: 1px solid ${(p) => p.theme.colors.border};

  @media (max-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatCell = styled.div`
  padding: 10px 14px;
  border-right: 1px solid ${(p) => p.theme.colors.border};
  &:last-child { border-right: none; }
`;

const StatLbl = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textMuted};
  margin-bottom: 3px;
`;

const StatVal = styled.div`
  font-family: ${(p) => p.theme.fonts.mono};
  font-variant-numeric: tabular-nums;
  font-size: 13.5px;
  font-weight: 600;
  color: ${(p) => p.$color || p.theme.colors.text};
`;

const CmvPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  border: 1px solid ${(p) => p.$color}44;
`;

const EmptyWrap = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13.5px;
`;

// ── modal ─────────────────────────────────────────────────────────────────────

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadein 0.15s;
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
`;

const ModalBox = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  box-shadow: ${(p) => p.theme.shadows.lg};
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideup 0.15s;
  @keyframes slideup { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }
`;

const ModalHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const ModalTitle = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 20px;
  color: ${(p) => p.theme.colors.text};
`;

const ModalSub = styled.div`
  font-size: 12.5px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const ModalBody = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalFoot = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 24px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid ${(p) => p.$borderColor || p.theme.colors.border};
  border-left: 4px solid ${(p) => p.$borderColor || p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  overflow: hidden;
  background: ${(p) => p.theme.colors.surfaceAlt};

  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
`;

const ResultCell = styled.div`
  padding: 12px 14px;
  border-right: 1px solid ${(p) => p.theme.colors.border};
  &:last-child { border-right: none; }
`;

// ── CartaModal ────────────────────────────────────────────────────────────────

function CartaModal({ item, recetas, onClose, onSaved }) {
  const [form, setForm] = useState({
    receta_id: item?.receta_id || "",
    nombre_comercial: item?.nombre_comercial || "",
    precio_venta: item?.precio_venta || "",
    markup: item?.markup || 30,
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const recetaSel = recetas.find((r) => r.id === form.receta_id);
  const costo = recetaSel?.costo_por_porcion || 0;
  const precio = parseFloat(form.precio_venta) || 0;
  const cmv = precio > 0 ? (costo / precio) * 100 : 0;
  const ctm = 100 - cmv;
  const sugerido = costo > 0 && form.markup > 0
    ? costo / (1 - form.markup / 100)
    : 0;
  const colors = cmvColors(cmv);

  async function guardar() {
    if (!form.receta_id || !form.nombre_comercial.trim() || !precio) return;
    const payload = {
      receta_id: form.receta_id,
      nombre_comercial: form.nombre_comercial,
      precio_venta: precio,
      cmv,
      ctm,
      markup: parseFloat(form.markup),
      activo: true,
    };
    if (item) {
      await supabase.from("carta").update(payload).eq("id", item.id);
    } else {
      await supabase.from("carta").insert(payload);
    }
    onSaved();
  }

  const canSave = form.receta_id && form.nombre_comercial.trim() && precio;

  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHead>
          <div>
            <ModalTitle>{item ? "Editar producto" : "Agregar a la carta"}</ModalTitle>
            <ModalSub>Mirá el CMV en vivo mientras ajustás el precio</ModalSub>
          </div>
          <IconBtn onClick={onClose} style={{ border: "none", background: "none" }}>✕</IconBtn>
        </ModalHead>

        <ModalBody>
          <div>
            <FieldLabel>Receta base</FieldLabel>
            <SelectEl
              value={form.receta_id}
              onChange={(e) => {
                const r = recetas.find((x) => x.id === e.target.value);
                setForm({ ...form, receta_id: e.target.value, nombre_comercial: form.nombre_comercial || r?.nombre || "" });
              }}
            >
              <option value="">Seleccionar receta…</option>
              {recetas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({formatPrecio(r.costo_por_porcion)} costo)
                </option>
              ))}
            </SelectEl>
          </div>

          <div>
            <FieldLabel>Nombre comercial</FieldLabel>
            <Input
              value={form.nombre_comercial}
              onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
              placeholder="Como aparece en la carta"
            />
          </div>

          <Grid2>
            <div>
              <FieldLabel>Precio de venta ($)</FieldLabel>
              <Input
                type="number"
                value={form.precio_venta}
                onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Markup deseado (%)</FieldLabel>
              <Input
                type="number"
                value={form.markup}
                onChange={(e) => setForm({ ...form, markup: e.target.value })}
              />
              {sugerido > 0 && Math.abs(sugerido - precio) > 1 && (
                <FieldHint>
                  Sugerido:{" "}
                  <LinkBtn
                    type="button"
                    onClick={() => setForm({ ...form, precio_venta: Math.round(sugerido) })}
                  >
                    {formatPrecio(sugerido)}
                  </LinkBtn>
                </FieldHint>
              )}
            </div>
          </Grid2>

          {form.receta_id && precio > 0 && (
            <ResultGrid $borderColor={colors.border}>
              <ResultCell>
                <StatLbl>Costo</StatLbl>
                <StatVal>{formatPrecio(costo)}</StatVal>
              </ResultCell>
              <ResultCell>
                <StatLbl>Precio</StatLbl>
                <StatVal style={{ color: "#CF5E0E" }}>{formatPrecio(precio)}</StatVal>
              </ResultCell>
              <ResultCell>
                <StatLbl>CMV</StatLbl>
                <StatVal style={{ color: colors.text }}>{cmv.toFixed(1)}%</StatVal>
              </ResultCell>
              <ResultCell>
                <StatLbl>CTM</StatLbl>
                <StatVal>{ctm.toFixed(1)}%</StatVal>
              </ResultCell>
            </ResultGrid>
          )}
        </ModalBody>

        <ModalFoot>
          <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
          <BtnPrimary onClick={guardar} disabled={!canSave}>
            {item ? "Guardar" : "Agregar"}
          </BtnPrimary>
        </ModalFoot>
      </ModalBox>
    </Backdrop>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function Carta() {
  const toast = useToast();
  const [carta, setCarta] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | item

  const fetchTodo = useCallback(async () => {
    setLoading(true);
    const [{ data: cartaData }, { data: recetasData }] = await Promise.all([
      supabase.from("carta").select("*, recetas(*)").eq("activo", true).order("created_at", { ascending: false }),
      supabase.from("recetas").select("*").order("nombre"),
    ]);
    setCarta(cartaData || []);
    setRecetas(recetasData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTodo(); }, [fetchTodo]);

  async function eliminar(id) {
    if (!confirm("¿Eliminar de la carta?")) return;
    await supabase.from("carta").delete().eq("id", id);
    toast("Producto eliminado");
    fetchTodo();
  }

  const filtered = carta.filter((c) =>
    c.nombre_comercial?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Carta</PageTitle>
          <PageSub>Definí el precio de venta y controlá el margen de cada producto.</PageSub>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <ExportarExcel datos={carta} nombreArchivo="Carta_Completa" tipo="carta" />
          <BtnPrimary onClick={() => setModal("add")}><Plus /> Agregar producto</BtnPrimary>
        </div>
      </PageHead>

      <Toolbar>
        <SearchWrap>
          <Search />
          <SearchInput
            placeholder="Buscar producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        <Legend>
          <span><LegendDot $color="#2E7D32" />CMV &lt; 50%</span>
          <span><LegendDot $color="#E65100" />50–70%</span>
          <span><LegendDot $color="#C62828" />&gt; 70%</span>
        </Legend>
      </Toolbar>

      {loading && <EmptyWrap>Cargando…</EmptyWrap>}

      {!loading && filtered.length === 0 && (
        <EmptyWrap>
          {search ? `Sin resultados para "${search}"` : "Todavía no hay productos en la carta."}
        </EmptyWrap>
      )}

      <CartaList>
        {filtered.map((c) => {
          const cmv = c.cmv ?? 0;
          const ctm = c.ctm ?? 0;
          const costo = c.recetas?.costo_por_porcion ?? 0;
          const ganancia = c.precio_venta - costo;
          const { border, bg, text } = cmvColors(cmv);

          return (
            <CartaCard key={c.id} $borderColor={border}>
              <CartaCardTop>
                <div>
                  <CartaNombre>{c.nombre_comercial}</CartaNombre>
                  <CartaSub>
                    Basado en: {c.recetas?.nombre || "—"} · Markup {c.markup}%
                  </CartaSub>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <CmvPill $bg={bg} $color={text}>
                    CMV {cmv.toFixed(1)}%
                  </CmvPill>
                  <IconBtn onClick={() => setModal(c)}><Pencil /></IconBtn>
                  <IconBtn $danger onClick={() => eliminar(c.id)}><Trash2 /></IconBtn>
                </div>
              </CartaCardTop>

              <CartaStats>
                <StatCell>
                  <StatLbl>Costo</StatLbl>
                  <StatVal>{formatPrecio(costo)}</StatVal>
                </StatCell>
                <StatCell>
                  <StatLbl>Precio venta</StatLbl>
                  <StatVal $color="#CF5E0E">{formatPrecio(c.precio_venta)}</StatVal>
                </StatCell>
                <StatCell>
                  <StatLbl>Ganancia</StatLbl>
                  <StatVal $color="#2E7D32">{formatPrecio(ganancia)}</StatVal>
                </StatCell>
                <StatCell>
                  <StatLbl>CMV</StatLbl>
                  <StatVal $color={text}>{cmv.toFixed(1)}%</StatVal>
                </StatCell>
                <StatCell>
                  <StatLbl>CTM</StatLbl>
                  <StatVal $color={ctm > 50 ? "#2E7D32" : undefined}>{ctm.toFixed(1)}%</StatVal>
                </StatCell>
              </CartaStats>
            </CartaCard>
          );
        })}
      </CartaList>

      {modal && (
        <CartaModal
          item={modal === "add" ? null : modal}
          recetas={recetas}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); toast(modal === "add" ? "Producto agregado a la carta" : "Producto actualizado"); fetchTodo(); }}
        />
      )}
    </div>
  );
}

export default Carta;
