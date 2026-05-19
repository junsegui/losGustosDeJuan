import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { formatPrecio } from "../lib/calculos";

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

const BtnSm = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  font-size: 12px;
  font-weight: 500;
  font-family: ${(p) => p.theme.fonts.sans};
  cursor: pointer;
  svg { width: 12px; height: 12px; }
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; }
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => (p.$danger ? p.theme.colors.danger : p.theme.colors.textMuted)};
  cursor: pointer;
  transition: background 0.12s;
  svg { width: 13px; height: 13px; }
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
  margin-bottom: 18px;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
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

const Counter = styled.div`
  margin-left: auto;
  font-size: 12.5px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const RecetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

// ── receta card ───────────────────────────────────────────────────────────────

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadows.sm};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 18px 12px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const RecetaNombre = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 18px;
  color: ${(p) => p.theme.colors.text};
  line-height: 1.2;
`;

const RecetaSub = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 3px;
`;

const IngList = styled.div`
  padding: 12px 18px;
  flex: 1;
`;

const IngLabel = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textMuted};
  margin-bottom: 8px;
`;

const IngRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const SubPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 600;
  background: ${(p) => p.theme.colors.infoLight};
  color: ${(p) => p.theme.colors.info};
  margin-right: 5px;
`;

const CardFoot = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const FootCell = styled.div`
  padding: 10px 16px;
  border-right: 1px solid ${(p) => p.theme.colors.border};
  &:last-child { border-right: none; }
`;

const FootLbl = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textMuted};
  margin-bottom: 2px;
`;

const FootVal = styled.div`
  font-family: ${(p) => p.theme.fonts.mono};
  font-variant-numeric: tabular-nums;
  font-size: 13.5px;
  font-weight: 600;
  color: ${(p) => p.$accent ? p.theme.colors.primaryHover : p.theme.colors.text};
`;

const EmptyWrap = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13.5px;
  grid-column: 1 / -1;
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
  max-width: 580px;
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

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 10px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const IngSection = styled.div``;

const IngSectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const IngSectionLabel = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textMuted};
`;

const IngFormRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 80px 70px 28px;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
  @media (max-width: 500px) { grid-template-columns: 1fr 1fr; }
`;

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: none;
  background: none;
  color: ${(p) => p.theme.colors.textMuted};
  cursor: pointer;
  svg { width: 14px; height: 14px; }
  &:hover { color: ${(p) => p.theme.colors.danger}; background: ${(p) => p.theme.colors.dangerLight}; }
`;

const CostBox = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}44;
  border-radius: ${(p) => p.theme.radii.md};
  overflow: hidden;
`;

const CostCell = styled.div`
  padding: 12px 14px;
  border-right: 1px solid ${(p) => p.theme.colors.primary}33;
  &:last-child { border-right: none; }
`;

const CostLbl = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.textMuted};
  margin-bottom: 3px;
`;

const CostVal = styled.div`
  font-family: ${(p) => p.theme.fonts.mono};
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => p.$accent ? p.theme.colors.primaryHover : p.theme.colors.text};
`;

const UNIDADES = ["gr", "kg", "ml", "l", "un", "porcion"];

// ── RecetaModal ───────────────────────────────────────────────────────────────

function RecetaModal({ receta, insumos, subRecetas, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: receta?.nombre || "",
    categoria: receta?.categoria || "",
    rinde: receta?.rinde || 1,
    unidad_rinde: receta?.unidad_rinde || "un",
    notas: receta?.notas || "",
  });
  const [ings, setIngs] = useState([]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (receta?.ingredientes_receta) {
      setIngs(
        receta.ingredientes_receta.map((i) => ({
          tipo: i.insumo_id ? "insumo" : "sub-receta",
          insumo_id: i.insumo_id || "",
          sub_receta_id: i.sub_receta_id || "",
          cantidad: i.cantidad,
          unidad: i.unidad,
        }))
      );
    }
  }, [receta]);

  function addIng() {
    setIngs([...ings, { tipo: "insumo", insumo_id: "", sub_receta_id: "", cantidad: "", unidad: "gr" }]);
  }

  function updateIng(i, field, value) {
    const next = [...ings];
    next[i] = { ...next[i], [field]: value };
    if (field === "tipo") { next[i].insumo_id = ""; next[i].sub_receta_id = ""; }
    setIngs(next);
  }

  function removeIng(i) {
    setIngs(ings.filter((_, idx) => idx !== i));
  }

  const costoTotal = ings.reduce((sum, ing) => {
    if (ing.tipo === "insumo" && ing.insumo_id && ing.cantidad) {
      const ins = insumos.find((x) => x.id === ing.insumo_id);
      return sum + (ins?.costo_unitario ?? 0) * parseFloat(ing.cantidad);
    }
    if (ing.tipo === "sub-receta" && ing.sub_receta_id && ing.cantidad) {
      const sr = subRecetas.find((x) => x.id === ing.sub_receta_id);
      return sum + (sr?.costo_unitario ?? 0) * parseFloat(ing.cantidad);
    }
    return sum;
  }, 0);

  const costoPorPorcion = form.rinde > 0 ? costoTotal / parseFloat(form.rinde) : 0;

  async function guardar() {
    if (!form.nombre.trim() || !form.rinde || ings.length === 0) return;

    const payload = {
      nombre: form.nombre,
      categoria: form.categoria || null,
      rinde: parseFloat(form.rinde),
      unidad_rinde: form.unidad_rinde,
      costo_total: costoTotal,
      costo_por_porcion: costoPorPorcion,
      notas: form.notas || null,
    };

    let recetaId = receta?.id;

    if (receta) {
      await supabase.from("recetas").update(payload).eq("id", receta.id);
      await supabase.from("ingredientes_receta").delete().eq("receta_id", receta.id);
    } else {
      const { data } = await supabase.from("recetas").insert(payload).select().single();
      recetaId = data?.id;
    }

    const validos = ings.filter(
      (i) => (i.tipo === "insumo" && i.insumo_id && i.cantidad) ||
             (i.tipo === "sub-receta" && i.sub_receta_id && i.cantidad)
    );
    if (validos.length > 0 && recetaId) {
      await supabase.from("ingredientes_receta").insert(
        validos.map((i) => ({
          receta_id: recetaId,
          insumo_id: i.tipo === "insumo" ? i.insumo_id : null,
          sub_receta_id: i.tipo === "sub-receta" ? i.sub_receta_id : null,
          cantidad: parseFloat(i.cantidad),
          unidad: i.unidad,
        }))
      );
    }
    onSaved();
  }

  const canSave = form.nombre.trim() && form.rinde && ings.length > 0;

  return (
    <Backdrop onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHead>
          <div>
            <ModalTitle>{receta ? "Editar receta" : "Nueva receta"}</ModalTitle>
            <ModalSub>Combiná insumos y sub-recetas para calcular el costo por porción</ModalSub>
          </div>
          <IconBtn onClick={onClose} style={{ border: "none", background: "none" }}><X /></IconBtn>
        </ModalHead>

        <ModalBody>
          <div>
            <FieldLabel>Nombre</FieldLabel>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Sándwich de bondiola" />
          </div>

          <Grid3>
            <div>
              <FieldLabel>Categoría</FieldLabel>
              <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Opcional" />
            </div>
            <div>
              <FieldLabel>Rinde</FieldLabel>
              <Input type="number" value={form.rinde} onChange={(e) => setForm({ ...form, rinde: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Unidad</FieldLabel>
              <SelectEl value={form.unidad_rinde} onChange={(e) => setForm({ ...form, unidad_rinde: e.target.value })}>
                <option value="un">un</option>
                <option value="porcion">porción</option>
                <option value="gr">gr</option>
                <option value="ml">ml</option>
              </SelectEl>
            </div>
          </Grid3>

          <IngSection>
            <IngSectionHead>
              <IngSectionLabel>Ingredientes</IngSectionLabel>
              <BtnSm onClick={addIng}><Plus /> Agregar</BtnSm>
            </IngSectionHead>

            {ings.length === 0 && (
              <div style={{ padding: "14px", textAlign: "center", fontSize: 13, color: "#8C7B6B", background: "#F2EDE4", borderRadius: 8 }}>
                Sin ingredientes todavía
              </div>
            )}

            {ings.map((ing, i) => {
              const lista = ing.tipo === "insumo" ? insumos : subRecetas;
              const idKey = ing.tipo === "insumo" ? "insumo_id" : "sub_receta_id";
              return (
                <IngFormRow key={i}>
                  <SelectEl value={ing.tipo} onChange={(e) => updateIng(i, "tipo", e.target.value)}>
                    <option value="insumo">Insumo</option>
                    <option value="sub-receta">Sub-receta</option>
                  </SelectEl>
                  <SelectEl value={ing[idKey]} onChange={(e) => updateIng(i, idKey, e.target.value)}>
                    <option value="">Seleccionar…</option>
                    {lista.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.nombre} ({formatPrecio(x.costo_unitario)}/{x.unidad_medida || x.unidad_rinde})
                      </option>
                    ))}
                  </SelectEl>
                  <Input type="number" placeholder="Cant." value={ing.cantidad} onChange={(e) => updateIng(i, "cantidad", e.target.value)} />
                  <SelectEl value={ing.unidad} onChange={(e) => updateIng(i, "unidad", e.target.value)}>
                    {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                  </SelectEl>
                  <RemoveBtn onClick={() => removeIng(i)}><X /></RemoveBtn>
                </IngFormRow>
              );
            })}
          </IngSection>

          {ings.length > 0 && (
            <CostBox>
              <CostCell>
                <CostLbl>Costo total</CostLbl>
                <CostVal>{formatPrecio(costoTotal)}</CostVal>
              </CostCell>
              <CostCell>
                <CostLbl>Rinde</CostLbl>
                <CostVal>{form.rinde} {form.unidad_rinde}</CostVal>
              </CostCell>
              <CostCell>
                <CostLbl>Costo / {form.unidad_rinde}</CostLbl>
                <CostVal $accent>{formatPrecio(costoPorPorcion)}</CostVal>
              </CostCell>
            </CostBox>
          )}

          <div>
            <FieldLabel>Notas</FieldLabel>
            <Input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Opcional" />
          </div>
        </ModalBody>

        <ModalFoot>
          <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
          <BtnPrimary onClick={guardar} disabled={!canSave}>
            {receta ? "Guardar cambios" : "Guardar receta"}
          </BtnPrimary>
        </ModalFoot>
      </ModalBox>
    </Backdrop>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function Recetas() {
  const toast = useToast();
  const [recetas, setRecetas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [subRecetas, setSubRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "new" | receta object

  const fetchTodo = useCallback(async () => {
    setLoading(true);
    const [{ data: recs }, { data: ins }, { data: subs }] = await Promise.all([
      supabase
        .from("recetas")
        .select("*, ingredientes_receta(*, insumos(*), sub_recetas(*))")
        .order("created_at", { ascending: false }),
      supabase.from("insumos").select("*").order("nombre"),
      supabase.from("sub_recetas").select("*").order("nombre"),
    ]);
    setRecetas(recs || []);
    setInsumos(ins || []);
    setSubRecetas(subs || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTodo(); }, [fetchTodo]);

  async function eliminar(id) {
    if (!confirm("¿Eliminar esta receta?")) return;
    await supabase.from("recetas").delete().eq("id", id);
    toast("Receta eliminada");
    fetchTodo();
  }

  const filtered = recetas.filter((r) =>
    r.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Recetas</PageTitle>
          <PageSub>El producto final — sándwiches, hamburguesas, todo lo que vendés.</PageSub>
        </div>
        <BtnPrimary onClick={() => setModal("new")}><Plus /> Nueva receta</BtnPrimary>
      </PageHead>

      <Toolbar>
        <SearchWrap>
          <Search />
          <SearchInput
            placeholder="Buscar receta…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchWrap>
        <Counter>{filtered.length} de {recetas.length}</Counter>
      </Toolbar>

      {loading && <EmptyWrap>Cargando…</EmptyWrap>}

      <RecetaGrid>
        {!loading && filtered.length === 0 && (
          <EmptyWrap>
            {search ? `Sin resultados para "${search}"` : "Todavía no hay recetas cargadas."}
          </EmptyWrap>
        )}

        {filtered.map((r) => {
          const ings = r.ingredientes_receta || [];
          return (
            <Card key={r.id}>
              <CardHead>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <RecetaNombre>{r.nombre}</RecetaNombre>
                  <RecetaSub>
                    {r.categoria || "Sin categoría"} · Rinde {r.rinde} {r.unidad_rinde}
                  </RecetaSub>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <IconBtn onClick={() => setModal(r)}><Pencil /></IconBtn>
                  <IconBtn $danger onClick={() => eliminar(r.id)}><Trash2 /></IconBtn>
                </div>
              </CardHead>

              {ings.length > 0 && (
                <IngList>
                  <IngLabel>Ingredientes</IngLabel>
                  {ings.map((ing, i) => {
                    const nombre = ing.insumos?.nombre || ing.sub_recetas?.nombre || "—";
                    const esSub = !!ing.sub_receta_id;
                    return (
                      <IngRow key={i}>
                        <span>
                          {esSub && <SubPill>sub</SubPill>}
                          {nombre}
                        </span>
                        <span style={{ fontSize: 12, color: "#8C7B6B", fontFamily: "DM Mono, monospace" }}>
                          {ing.cantidad} {ing.unidad}
                        </span>
                      </IngRow>
                    );
                  })}
                </IngList>
              )}

              <CardFoot>
                <FootCell>
                  <FootLbl>Costo total</FootLbl>
                  <FootVal>{formatPrecio(r.costo_total)}</FootVal>
                </FootCell>
                <FootCell>
                  <FootLbl>Costo / {r.unidad_rinde}</FootLbl>
                  <FootVal $accent>{formatPrecio(r.costo_por_porcion)}</FootVal>
                </FootCell>
              </CardFoot>
            </Card>
          );
        })}
      </RecetaGrid>

      {modal && (
        <RecetaModal
          receta={modal === "new" ? null : modal}
          insumos={insumos}
          subRecetas={subRecetas}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); toast(modal === "add" ? "Receta creada" : "Receta actualizada"); fetchTodo(); }}
        />
      )}
    </div>
  );
}

export default Recetas;
