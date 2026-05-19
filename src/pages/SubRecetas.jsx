import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import { recalcularTodo } from "../lib/recalcular";
import ExportarExcel from "../components/ExportarExcel";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useToast } from "../components/Toast";

// ─── Table ────────────────────────────────────────────────────────────────────

const COLS = "2fr 1fr 110px 140px 150px 80px";

const PageHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

const BtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: ${(p) => p.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover { background: ${(p) => p.theme.colors.primaryHover}; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(p) => p.theme.colors.textMuted};
  display: flex;
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 8px 12px 8px 32px;
  outline: none;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const Counter = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-left: auto;
`;

const Table = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  overflow: hidden;
`;

const THead = styled.div`
  display: grid;
  grid-template-columns: ${COLS};
  padding: 10px 16px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  gap: 12px;
`;

const TH = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TRow = styled.div`
  display: grid;
  grid-template-columns: ${COLS};
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  gap: 12px;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: ${(p) => p.theme.colors.surfaceHover}; }
`;

const CellMain = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.text};
`;

const CellSub = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 1px;
`;

const Pill = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.theme.colors.primaryLight};
  color: ${(p) => p.theme.colors.primary};
`;

const Accent = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.primary};
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 4px;
  justify-content: flex-end;
`;

const IconBtn = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
  color: ${(p) => p.theme.colors.textMuted};

  &:hover {
    background: ${(p) => p.$danger ? p.theme.colors.dangerLight : p.theme.colors.surfaceAlt};
    color: ${(p) => p.$danger ? p.theme.colors.danger : p.theme.colors.text};
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.15s;

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const Modal = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 28px;
  width: 100%;
  max-width: 680px;
  box-shadow: ${(p) => p.theme.shadows.lg};
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.15s;

  @keyframes slideUp {
    from { transform: translateY(12px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
`;

const ModalTitle = styled.h3`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 20px;
  color: ${(p) => p.theme.colors.text};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 9px 12px;
  outline: none;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const SelectInput = styled.select`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 9px 12px;
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 20px 0 10px;
`;

const IngRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 90px 80px 80px 80px 32px;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  margin-bottom: 6px;
  overflow-x: auto;

  @media (max-width: 600px) { grid-template-columns: 1fr 80px 32px; }
`;

const RemoveBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${(p) => p.theme.radii.sm};
  cursor: pointer;
  background: transparent;
  color: ${(p) => p.theme.colors.textMuted};
  transition: all 0.15s;

  &:hover { background: ${(p) => p.theme.colors.dangerLight}; color: ${(p) => p.theme.colors.danger}; }
`;

const AddIngBtn = styled.button`
  padding: 7px 14px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px dashed ${(p) => p.theme.colors.border};
  background: transparent;
  color: ${(p) => p.theme.colors.textMuted};
  transition: all 0.15s;
  margin-top: 4px;

  &:hover { border-color: ${(p) => p.theme.colors.primary}; color: ${(p) => p.theme.colors.primary}; }
`;

const CostBox = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 14px 18px;
  margin-top: 16px;
`;

const CostItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CostLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CostValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => p.$accent ? p.theme.colors.primary : p.theme.colors.text};
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 22px;
`;

const BtnGhost = styled.button`
  padding: 9px 16px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${(p) => p.theme.colors.border};
  background: transparent;
  color: ${(p) => p.theme.colors.textMuted};
  transition: all 0.15s;

  &:hover { background: ${(p) => p.theme.colors.surfaceAlt}; color: ${(p) => p.theme.colors.text}; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const UNIDADES_RINDE = ["gr", "kg", "un", "ml", "l"];

const FORM_VACIO = {
  nombre: "",
  categoria: "",
  rinde: "",
  unidad_rinde: "gr",
  notas: "",
};

const ING_VACIO = { insumo_id: "", cantidad: "", unidad: "gr", desperdicio: 0, merma: 0 };

// ─── Page ─────────────────────────────────────────────────────────────────────

function SubRecetas() {
  const [subRecetas, setSubRecetas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | sr-obj
  const [form, setForm] = useState(FORM_VACIO);
  const [ingredientes, setIngredientes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const toast = useToast();

  const fetchTodo = useCallback(async () => {
    setLoading(true);
    const [{ data: subs }, { data: ins }] = await Promise.all([
      supabase.from("sub_recetas").select("*").order("nombre"),
      supabase.from("insumos").select("*").order("nombre"),
    ]);
    if (subs) setSubRecetas(subs);
    if (ins) setInsumos(ins);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTodo(); }, [fetchTodo]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const costoTotal = ingredientes.reduce((sum, ing) => {
    const ins = insumos.find((i) => i.id === ing.insumo_id);
    if (!ins || !ing.cantidad) return sum;
    return sum + ins.costo_unitario * parseFloat(ing.cantidad);
  }, 0);

  const costoUnitario = form.rinde ? costoTotal / parseFloat(form.rinde) : 0;

  const filtrados = subRecetas.filter((sr) =>
    !busqueda || sr.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function abrirAdd() {
    setForm(FORM_VACIO);
    setIngredientes([]);
    setModal("add");
  }

  async function abrirEdit(sr) {
    const { data } = await supabase
      .from("ingredientes_sub_receta")
      .select("*")
      .eq("sub_receta_id", sr.id);

    setForm({
      nombre: sr.nombre,
      categoria: sr.categoria || "",
      rinde: sr.rinde,
      unidad_rinde: sr.unidad_rinde,
      notas: sr.notas || "",
    });
    setIngredientes(
      (data || []).map((i) => ({
        insumo_id: i.insumo_id,
        cantidad: i.cantidad,
        unidad: i.unidad,
        desperdicio: i.desperdicio ?? 0,
        merma: i.merma ?? 0,
      }))
    );
    setModal(sr);
  }

  function addIngrediente() {
    setIngredientes([...ingredientes, { ...ING_VACIO }]);
  }

  function removeIngrediente(idx) {
    setIngredientes(ingredientes.filter((_, i) => i !== idx));
  }

  function updateIngrediente(idx, field, value) {
    const next = [...ingredientes];
    next[idx] = { ...next[idx], [field]: value };
    setIngredientes(next);
  }

  async function guardar() {
    if (!form.nombre.trim() || !form.rinde) return;
    setGuardando(true);

    const srPayload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim() || null,
      rinde: parseFloat(form.rinde),
      unidad_rinde: form.unidad_rinde,
      costo_total: costoTotal,
      costo_unitario: costoUnitario,
      notas: form.notas.trim() || null,
    };

    let srId;
    if (modal === "add") {
      const { data } = await supabase.from("sub_recetas").insert(srPayload).select().single();
      srId = data?.id;
    } else {
      await supabase.from("sub_recetas").update(srPayload).eq("id", modal.id);
      srId = modal.id;
      await supabase.from("ingredientes_sub_receta").delete().eq("sub_receta_id", srId);
    }

    const validos = ingredientes.filter((i) => i.insumo_id && i.cantidad);
    if (validos.length > 0 && srId) {
      await supabase.from("ingredientes_sub_receta").insert(
        validos.map((i) => ({
          sub_receta_id: srId,
          insumo_id: i.insumo_id,
          cantidad: parseFloat(i.cantidad),
          unidad: i.unidad,
          desperdicio: parseFloat(i.desperdicio) || 0,
          merma: parseFloat(i.merma) || 0,
        }))
      );
    }

    await recalcularTodo();
    setGuardando(false);
    setModal(null);
    toast(modal === "add" ? "Sub-receta creada" : "Sub-receta actualizada");
    fetchTodo();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar esta sub-receta?")) return;
    await supabase.from("sub_recetas").delete().eq("id", id);
    toast("Sub-receta eliminada");
    fetchTodo();
  }

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Sub-recetas</PageTitle>
          <PageSub>Preparaciones intermedias — bondiola ahumada, pulled pork, salsas.</PageSub>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <ExportarExcel datos={subRecetas} nombreArchivo="Sub_Recetas" tipo="sub-recetas" />
          <BtnPrimary onClick={abrirAdd}><Plus size={16} /> Nueva sub-receta</BtnPrimary>
        </div>
      </PageHead>

      <Toolbar>
        <SearchWrap>
          <SearchIcon><Search size={14} /></SearchIcon>
          <SearchInput
            placeholder="Buscar sub-receta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </SearchWrap>
        <Counter>{filtrados.length} sub-receta{filtrados.length !== 1 ? "s" : ""}</Counter>
      </Toolbar>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && filtrados.length === 0 && (
        <Empty>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🍖</div>
          <p>{subRecetas.length === 0 ? "No hay sub-recetas todavía." : "No hay resultados."}</p>
        </Empty>
      )}

      {!loading && filtrados.length > 0 && (
        <Table>
          <THead>
            <TH>Nombre</TH>
            <TH>Categoría</TH>
            <TH>Rinde</TH>
            <TH>Costo total</TH>
            <TH>Costo unitario</TH>
            <TH />
          </THead>
          {filtrados.map((sr) => (
            <TRow key={sr.id}>
              <div>
                <CellMain>{sr.nombre}</CellMain>
                {sr.notas && <CellSub>{sr.notas}</CellSub>}
              </div>
              <div>
                {sr.categoria ? <Pill>{sr.categoria}</Pill> : <CellSub>—</CellSub>}
              </div>
              <CellMain>{sr.rinde} {sr.unidad_rinde}</CellMain>
              <CellMain>{formatPrecio(sr.costo_total)}</CellMain>
              <Accent>{formatPrecio(sr.costo_unitario)}/{sr.unidad_rinde}</Accent>
              <ActionsCell>
                <IconBtn onClick={() => abrirEdit(sr)} title="Editar"><Pencil size={14} /></IconBtn>
                <IconBtn $danger onClick={() => eliminar(sr.id)} title="Eliminar"><Trash2 size={14} /></IconBtn>
              </ActionsCell>
            </TRow>
          ))}
        </Table>
      )}

      {modal && (
        <Overlay onClick={() => setModal(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>{modal === "add" ? "Nueva sub-receta" : "Editar sub-receta"}</ModalTitle>
              <IconBtn onClick={() => setModal(null)}><X size={18} /></IconBtn>
            </ModalHead>

            <FormGrid>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Nombre *</Label>
                <Input
                  placeholder="Ej: Bondiola ahumada"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Categoría</Label>
                <Input
                  placeholder="Opcional"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Rinde *</Label>
                <Input
                  type="number"
                  placeholder="Ej: 700"
                  value={form.rinde}
                  onChange={(e) => setForm({ ...form, rinde: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Unidad</Label>
                <SelectInput
                  value={form.unidad_rinde}
                  onChange={(e) => setForm({ ...form, unidad_rinde: e.target.value })}
                >
                  {UNIDADES_RINDE.map((u) => <option key={u} value={u}>{u}</option>)}
                </SelectInput>
              </FormGroup>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Notas</Label>
                <Input
                  placeholder="Opcional"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </FormGroup>
            </FormGrid>

            <SectionLabel>Ingredientes</SectionLabel>

            {ingredientes.map((ing, i) => (
              <IngRow key={i}>
                <SelectInput
                  value={ing.insumo_id}
                  onChange={(e) => updateIngrediente(i, "insumo_id", e.target.value)}
                >
                  <option value="">Seleccionar insumo...</option>
                  {insumos.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.nombre} ({formatPrecio(ins.costo_unitario)}/{ins.unidad_medida})
                    </option>
                  ))}
                </SelectInput>
                <Input
                  type="number"
                  placeholder="Cant."
                  value={ing.cantidad}
                  onChange={(e) => updateIngrediente(i, "cantidad", e.target.value)}
                />
                <SelectInput
                  value={ing.unidad}
                  onChange={(e) => updateIngrediente(i, "unidad", e.target.value)}
                >
                  {UNIDADES_RINDE.map((u) => <option key={u} value={u}>{u}</option>)}
                </SelectInput>
                <Input
                  type="number"
                  placeholder="Desp %"
                  value={ing.desperdicio}
                  onChange={(e) => updateIngrediente(i, "desperdicio", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Merma %"
                  value={ing.merma}
                  onChange={(e) => updateIngrediente(i, "merma", e.target.value)}
                />
                <RemoveBtn onClick={() => removeIngrediente(i)}>
                  <X size={14} />
                </RemoveBtn>
              </IngRow>
            ))}

            <AddIngBtn onClick={addIngrediente}>+ Agregar ingrediente</AddIngBtn>

            {ingredientes.length > 0 && form.rinde && (
              <CostBox>
                <CostItem>
                  <CostLabel>Costo total</CostLabel>
                  <CostValue>{formatPrecio(costoTotal)}</CostValue>
                </CostItem>
                <CostItem>
                  <CostLabel>Rinde</CostLabel>
                  <CostValue>{form.rinde} {form.unidad_rinde}</CostValue>
                </CostItem>
                <CostItem>
                  <CostLabel>Costo unitario</CostLabel>
                  <CostValue $accent>{formatPrecio(costoUnitario)}/{form.unidad_rinde}</CostValue>
                </CostItem>
              </CostBox>
            )}

            <ModalFooter>
              <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
              <BtnPrimary
                onClick={guardar}
                disabled={guardando || !form.nombre.trim() || !form.rinde}
              >
                {guardando ? "Guardando..." : modal === "add" ? "Crear sub-receta" : "Guardar cambios"}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

export default SubRecetas;
