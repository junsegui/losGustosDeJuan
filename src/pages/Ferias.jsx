import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import { useToast } from "../components/Toast";
import { Plus, Pencil, Trash2, MapPin, X } from "lucide-react";

// ─── Layout ───────────────────────────────────────────────────────────────────

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
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 8px 12px;
  outline: none;
  cursor: pointer;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
`;

const Counter = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-left: auto;
`;

const SectionLabel = styled.h2`
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 10px;
  margin-bottom: 32px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

// ─── Event Card ───────────────────────────────────────────────────────────────

const EventCard = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 16px 20px;
  box-shadow: ${(p) => p.theme.shadows.sm};
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 0 16px;
  position: relative;
  transition: box-shadow 0.15s;

  &:hover { box-shadow: ${(p) => p.theme.shadows.md}; }
`;

const DateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$upcoming ? p.theme.colors.primaryLight : p.theme.colors.surfaceAlt};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 10px 4px;
  align-self: start;
`;

const DateMonth = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${(p) => p.$upcoming ? p.theme.colors.primary : p.theme.colors.textMuted};
`;

const DateDay = styled.span`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 28px;
  line-height: 1;
  color: ${(p) => p.$upcoming ? p.theme.colors.primary : p.theme.colors.text};
  margin: 3px 0;
`;

const DateWeekday = styled.span`
  font-size: 10px;
  color: ${(p) => p.$upcoming ? p.theme.colors.primary : p.theme.colors.textMuted};
  text-transform: capitalize;
`;

const EventBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  padding-right: 48px;
`;

const EventNombre = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 17px;
  color: ${(p) => p.theme.colors.text};
  line-height: 1.2;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const TipoPill = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: ${(p) => p.$tipo === "puesto_ruta" ? p.theme.colors.successLight : p.theme.colors.primaryLight};
  color: ${(p) => p.$tipo === "puesto_ruta" ? p.theme.colors.success : p.theme.colors.primary};
`;

const LugarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const NotasBlock = styled.div`
  grid-column: 1 / -1;
  margin-top: 10px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 8px 10px;
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  line-height: 1.5;
`;

const StatsFooter = styled.div`
  grid-column: 1 / -1;
  margin-top: 10px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLbl = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const StatVal = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${(p) =>
    p.$positive ? p.theme.colors.success :
    p.$negative ? p.theme.colors.danger :
    p.theme.colors.text};
`;

const ActionsRow = styled.div`
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  gap: 2px;
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
  max-width: 520px;
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
  grid-template-columns: 1fr 1fr;
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
  transition: border-color 0.2s;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const Select = styled.select`
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

const Textarea = styled.textarea`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  padding: 9px 12px;
  outline: none;
  resize: vertical;
  min-height: 72px;

  &:focus { border-color: ${(p) => p.theme.colors.primary}; }
  &::placeholder { color: ${(p) => p.theme.colors.textLight}; }
`;

const Divider = styled.div`
  grid-column: 1 / -1;
  border-top: 1px solid ${(p) => p.theme.colors.border};
  margin: 4px 0;
`;

const DividerLabel = styled.div`
  grid-column: 1 / -1;
  font-size: 11px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GananciaRow = styled.div`
  grid-column: 1 / -1;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GananciaLabel = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  font-weight: 600;
`;

const GananciaVal = styled.span`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 22px;
  color: ${(p) => p.$positive ? p.theme.colors.success : p.$negative ? p.theme.colors.danger : p.theme.colors.textMuted};
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

const TIPOS = [
  { value: "feria", label: "Feria" },
  { value: "puesto_ruta", label: "Puesto en ruta" },
];

const MESES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const DIAS = ["dom","lun","mar","mié","jue","vie","sáb"];

const FORM_VACIO = {
  nombre: "",
  tipo: "feria",
  fecha: new Date().toISOString().split("T")[0],
  lugar: "",
  notas: "",
  ingresos_dia: "",
  gastos_dia: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FechaBlock({ fecha, upcoming }) {
  const [y, m, d] = fecha.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    <DateBlock $upcoming={upcoming}>
      <DateMonth $upcoming={upcoming}>{MESES[m - 1]}</DateMonth>
      <DateDay $upcoming={upcoming}>{d}</DateDay>
      <DateWeekday $upcoming={upcoming}>{DIAS[date.getDay()]}</DateWeekday>
    </DateBlock>
  );
}

function EventoCard({ ev, hoy, onEdit, onDelete }) {
  const upcoming = ev.fecha >= hoy;
  const ingresos = ev.ingresos_dia || 0;
  const gastos = ev.gastos_dia || 0;
  const ganancia = ingresos - gastos;
  const tieneFinanzas = ingresos > 0 || gastos > 0;

  return (
    <EventCard>
      <FechaBlock fecha={ev.fecha} upcoming={upcoming} />
      <EventBody>
        <EventNombre>{ev.nombre}</EventNombre>
        <EventMeta>
          <TipoPill $tipo={ev.tipo ?? "feria"}>
            {ev.tipo === "puesto_ruta" ? "Puesto en ruta" : "Feria"}
          </TipoPill>
          {ev.lugar && (
            <LugarRow>
              <MapPin size={11} />
              {ev.lugar}
            </LugarRow>
          )}
        </EventMeta>
      </EventBody>

      {ev.notas && <NotasBlock>📝 {ev.notas}</NotasBlock>}

      {tieneFinanzas && (
        <StatsFooter>
          <StatItem>
            <StatLbl>Ingresos</StatLbl>
            <StatVal>{formatPrecio(ingresos)}</StatVal>
          </StatItem>
          <StatItem>
            <StatLbl>Gastos</StatLbl>
            <StatVal $negative>{formatPrecio(gastos)}</StatVal>
          </StatItem>
          <StatItem>
            <StatLbl>Ganancia</StatLbl>
            <StatVal $positive={ganancia > 0} $negative={ganancia < 0}>
              {formatPrecio(ganancia)}
            </StatVal>
          </StatItem>
        </StatsFooter>
      )}

      <ActionsRow>
        <IconBtn onClick={() => onEdit(ev)} title="Editar"><Pencil size={14} /></IconBtn>
        <IconBtn $danger onClick={() => onDelete(ev.id)} title="Eliminar"><Trash2 size={14} /></IconBtn>
      </ActionsRow>
    </EventCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Ferias() {
  const toast = useToast();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroLugar, setFiltroLugar] = useState("todos");
  const [modal, setModal] = useState(null); // null | "add" | evento-obj
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const fetchTodo = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ferias")
      .select("*")
      .order("fecha", { ascending: true });
    if (data) setEventos(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTodo(); }, [fetchTodo]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const hoy = new Date().toISOString().split("T")[0];
  const lugaresUnicos = [...new Set(eventos.map((e) => e.lugar).filter(Boolean))];

  const filtrados = eventos.filter((e) => {
    if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
    if (filtroLugar !== "todos" && e.lugar !== filtroLugar) return false;
    return true;
  });

  const proximos = [...filtrados]
    .filter((e) => e.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const pasados = [...filtrados]
    .filter((e) => e.fecha < hoy)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Live ganancia for modal
  const ingresosLive = parseFloat(form.ingresos_dia) || 0;
  const gastosLive = parseFloat(form.gastos_dia) || 0;
  const gananciaLive = ingresosLive - gastosLive;
  const tieneFinanzasLive = ingresosLive > 0 || gastosLive > 0;

  function abrirAdd() {
    setForm(FORM_VACIO);
    setModal("add");
  }

  function abrirEdit(ev) {
    setForm({
      nombre: ev.nombre,
      tipo: ev.tipo ?? "feria",
      fecha: ev.fecha,
      lugar: ev.lugar ?? "",
      notas: ev.notas ?? "",
      ingresos_dia: ev.ingresos_dia ?? "",
      gastos_dia: ev.gastos_dia ?? "",
    });
    setModal(ev);
  }

  async function guardar() {
    if (!form.nombre.trim()) return;
    setGuardando(true);
    const payload = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      fecha: form.fecha,
      lugar: form.lugar.trim() || null,
      notas: form.notas.trim() || null,
      ingresos_dia: parseFloat(form.ingresos_dia) || null,
      gastos_dia: parseFloat(form.gastos_dia) || null,
    };
    if (modal === "add") {
      await supabase.from("ferias").insert(payload);
    } else {
      await supabase.from("ferias").update(payload).eq("id", modal.id);
    }
    setGuardando(false);
    setModal(null);
    toast(modal === "add" ? "Evento creado" : "Evento actualizado");
    fetchTodo();
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar este evento?")) return;
    await supabase.from("ferias").delete().eq("id", id);
    toast("Evento eliminado");
    fetchTodo();
  }

  return (
    <div>
      <PageHead>
        <div>
          <PageTitle>Eventos</PageTitle>
          <PageSub>Agenda de ferias y puestos en ruta.</PageSub>
        </div>
        <BtnPrimary onClick={abrirAdd}>
          <Plus size={16} /> Nuevo evento
        </BtnPrimary>
      </PageHead>

      <Toolbar>
        <FilterSelect value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </FilterSelect>
        {lugaresUnicos.length > 0 && (
          <FilterSelect value={filtroLugar} onChange={(e) => setFiltroLugar(e.target.value)}>
            <option value="todos">Todos los lugares</option>
            {lugaresUnicos.map((l) => <option key={l} value={l}>{l}</option>)}
          </FilterSelect>
        )}
        <Counter>{filtrados.length} evento{filtrados.length !== 1 ? "s" : ""}</Counter>
      </Toolbar>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && filtrados.length === 0 && (
        <Empty>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
          <p>No hay eventos registrados todavía.</p>
          <p style={{ marginTop: 6, fontSize: 13 }}>Creá uno con el botón "Nuevo evento".</p>
        </Empty>
      )}

      {!loading && proximos.length > 0 && (
        <>
          <SectionLabel>Próximos — {proximos.length}</SectionLabel>
          <EventGrid>
            {proximos.map((ev) => (
              <EventoCard key={ev.id} ev={ev} hoy={hoy} onEdit={abrirEdit} onDelete={eliminar} />
            ))}
          </EventGrid>
        </>
      )}

      {!loading && pasados.length > 0 && (
        <>
          <SectionLabel>Pasados — {pasados.length}</SectionLabel>
          <EventGrid>
            {pasados.map((ev) => (
              <EventoCard key={ev.id} ev={ev} hoy={hoy} onEdit={abrirEdit} onDelete={eliminar} />
            ))}
          </EventGrid>
        </>
      )}

      {modal && (
        <Overlay onClick={() => setModal(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>{modal === "add" ? "Nuevo evento" : "Editar evento"}</ModalTitle>
              <IconBtn onClick={() => setModal(null)}><X size={18} /></IconBtn>
            </ModalHead>

            <FormGrid>
              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Nombre *</Label>
                <Input
                  placeholder="Ej: Feria de Palermo"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <Label>Tipo</Label>
                <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </FormGroup>

              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Lugar</Label>
                <Input
                  placeholder="Opcional"
                  value={form.lugar}
                  onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                />
              </FormGroup>

              <FormGroup style={{ gridColumn: "1 / -1" }}>
                <Label>Notas</Label>
                <Textarea
                  placeholder="Opcional — qué llevar, contacto, etc."
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                />
              </FormGroup>

              <Divider />
              <DividerLabel>Resultado del día (opcional)</DividerLabel>

              <FormGroup>
                <Label>Ingresos ($)</Label>
                <Input
                  type="number"
                  placeholder="Lo que vendiste"
                  value={form.ingresos_dia}
                  onChange={(e) => setForm({ ...form, ingresos_dia: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Gastos ($)</Label>
                <Input
                  type="number"
                  placeholder="Puesto, transporte..."
                  value={form.gastos_dia}
                  onChange={(e) => setForm({ ...form, gastos_dia: e.target.value })}
                />
              </FormGroup>

              {tieneFinanzasLive && (
                <GananciaRow>
                  <GananciaLabel>Ganancia del día</GananciaLabel>
                  <GananciaVal
                    $positive={gananciaLive > 0}
                    $negative={gananciaLive < 0}
                  >
                    {formatPrecio(gananciaLive)}
                  </GananciaVal>
                </GananciaRow>
              )}
            </FormGrid>

            <ModalFooter>
              <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
              <BtnPrimary
                onClick={guardar}
                disabled={guardando || !form.nombre.trim()}
              >
                {guardando ? "Guardando..." : modal === "add" ? "Crear evento" : "Guardar cambios"}
              </BtnPrimary>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

export default Ferias;
