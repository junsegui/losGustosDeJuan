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

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const Grid3 = styled(Grid)`
  grid-template-columns: 1fr 1fr 1fr;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${(p) => p.theme.colors.primary};
  }

  &::placeholder {
    color: ${(p) => p.theme.colors.textLight};
  }
`;

const Select = styled.select`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  padding: 10px 14px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${(p) => p.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  background: ${(p) => p.theme.colors.primary};
  color: white;

  &:hover {
    background: ${(p) => p.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const ButtonSecondary = styled(Button)`
  background: ${(p) => p.theme.colors.surfaceAlt};
  color: ${(p) => p.theme.colors.text};
  border: 1px solid ${(p) => p.theme.colors.border};

  &:hover {
    background: ${(p) => p.theme.colors.border};
    transform: translateY(-1px);
  }
`;

const ButtonDanger = styled(Button)`
  background: ${(p) => p.theme.colors.dangerLight};
  color: ${(p) => p.theme.colors.danger};
  border: 1px solid ${(p) => p.theme.colors.danger}33;

  &:hover {
    background: ${(p) => p.theme.colors.danger};
    color: white;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

const InsumoItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 100px;
  gap: 12px;
  align-items: center;
  padding: 14px 20px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  margin-bottom: 8px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const InsumoNombre = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const InsumoDetalle = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const InsumoData = styled.div`
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
`;

const InsumoDataLabel = styled.div`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const InfoBox = styled.div`
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 12px 16px;
  margin-top: 12px;
  display: flex;
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.primary};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 28px;
  width: 100%;
  max-width: 600px;
  box-shadow: ${(p) => p.theme.shadows.lg};
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-family: "DM Serif Display", serif;
  font-size: 20px;
  margin-bottom: 20px;
  color: ${(p) => p.theme.colors.text};
`;

const CATEGORIAS = [
  "Carnes",
  "Verduras",
  "Panificados",
  "Lácteos",
  "Condimentos",
  "Servicios",
  "Otros",
];

const UNIDADES = ["gr", "kg", "ml", "l", "un"];

function EditModal({ insumo, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: insumo.nombre,
    categoria: insumo.categoria || "",
    subcategoria: insumo.subcategoria || "",
    presentacion: insumo.presentacion || "",
    unidad_medida: insumo.unidad_medida || "gr",
    costo_presentacion: insumo.costo_presentacion || "",
    notas: insumo.notas || "",
  });

  const costoUnitario =
    form.presentacion && form.costo_presentacion
      ? parseFloat(form.costo_presentacion) / parseFloat(form.presentacion)
      : 0;

  async function guardar() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");

    const { error } = await supabase
      .from("insumos")
      .update({
        nombre: form.nombre,
        categoria: form.categoria || null,
        subcategoria: form.subcategoria || null,
        presentacion: parseFloat(form.presentacion) || null,
        unidad_medida: form.unidad_medida,
        costo_presentacion: parseFloat(form.costo_presentacion) || null,
        costo_unitario: costoUnitario,
        notas: form.notas || null,
      })
      .eq("id", insumo.id);

    if (!error) onSaved();
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Editar insumo</ModalTitle>
        <Grid3>
          <FormGroup style={{ gridColumn: "1 / -1" }}>
            <Label>Nombre</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label>Categoría</Label>
            <Select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Sin categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup style={{ gridColumn: "span 2" }}>
            <Label>Subcategoría</Label>
            <Input
              placeholder="Opcional"
              value={form.subcategoria}
              onChange={(e) =>
                setForm({ ...form, subcategoria: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Presentación</Label>
            <Input
              type="number"
              placeholder="Ej: 1000"
              value={form.presentacion}
              onChange={(e) =>
                setForm({ ...form, presentacion: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Unidad</Label>
            <Select
              value={form.unidad_medida}
              onChange={(e) =>
                setForm({ ...form, unidad_medida: e.target.value })
              }
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Costo presentación ($)</Label>
            <Input
              type="number"
              placeholder="Ej: 5000"
              value={form.costo_presentacion}
              onChange={(e) =>
                setForm({ ...form, costo_presentacion: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup style={{ gridColumn: "1 / -1" }}>
            <Label>Notas</Label>
            <Input
              placeholder="Opcional"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </FormGroup>
        </Grid3>

        {form.presentacion && form.costo_presentacion && (
          <InfoBox>
            <InfoItem>
              <InfoLabel>Costo unitario</InfoLabel>
              <InfoValue>
                {formatPrecio(costoUnitario)}/{form.unidad_medida}
              </InfoValue>
            </InfoItem>
          </InfoBox>
        )}

        <Row style={{ marginTop: 20 }}>
          <Button onClick={guardar}>Guardar cambios</Button>
          <ButtonSecondary onClick={onClose}>Cancelar</ButtonSecondary>
        </Row>
      </Modal>
    </Overlay>
  );
}

function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    subcategoria: "",
    presentacion: "",
    unidad_medida: "gr",
    costo_presentacion: "",
    notas: "",
  });

  useEffect(() => {
    fetchInsumos();
  }, []);

  async function fetchInsumos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("insumos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setInsumos(data);
    setLoading(false);
  }

  const costoUnitario =
    form.presentacion && form.costo_presentacion
      ? parseFloat(form.costo_presentacion) / parseFloat(form.presentacion)
      : 0;

  async function guardarInsumo() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");

    const { error } = await supabase.from("insumos").insert({
      nombre: form.nombre,
      categoria: form.categoria || null,
      subcategoria: form.subcategoria || null,
      presentacion: parseFloat(form.presentacion) || null,
      unidad_medida: form.unidad_medida,
      costo_presentacion: parseFloat(form.costo_presentacion) || null,
      costo_unitario: costoUnitario,
      notas: form.notas || null,
    });

    if (!error) {
      setForm({
        nombre: "",
        categoria: "",
        subcategoria: "",
        presentacion: "",
        unidad_medida: "gr",
        costo_presentacion: "",
        notas: "",
      });
      setMostrarForm(false);
      fetchInsumos();
    }
  }

  async function eliminarInsumo(id) {
    if (!confirm("¿Eliminar este insumo?")) return;
    await supabase.from("insumos").delete().eq("id", id);
    fetchInsumos();
  }

  return (
    <div>
      <Title>Insumos</Title>
      <Subtitle>
        La materia prima de todo — carnes, verduras, especias, servicios.
      </Subtitle>

      {editando && (
        <EditModal
          insumo={editando}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null);
            fetchInsumos();
          }}
        />
      )}

      {mostrarForm && (
        <Card>
          <SectionTitle>Nuevo insumo</SectionTitle>
          <Grid3>
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Bondiola cruda"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Categoría</Label>
              <Select
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
              >
                <option value="">Sin categoría</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup style={{ gridColumn: "span 2" }}>
              <Label>Subcategoría</Label>
              <Input
                placeholder="Opcional"
                value={form.subcategoria}
                onChange={(e) =>
                  setForm({ ...form, subcategoria: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Presentación</Label>
              <Input
                type="number"
                placeholder="Ej: 1000"
                value={form.presentacion}
                onChange={(e) =>
                  setForm({ ...form, presentacion: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Unidad</Label>
              <Select
                value={form.unidad_medida}
                onChange={(e) =>
                  setForm({ ...form, unidad_medida: e.target.value })
                }
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Costo presentación ($)</Label>
              <Input
                type="number"
                placeholder="Ej: 5000"
                value={form.costo_presentacion}
                onChange={(e) =>
                  setForm({ ...form, costo_presentacion: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <Label>Notas</Label>
              <Input
                placeholder="Opcional"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </FormGroup>
          </Grid3>

          {form.presentacion && form.costo_presentacion && (
            <InfoBox>
              <InfoItem>
                <InfoLabel>Costo unitario</InfoLabel>
                <InfoValue>
                  {formatPrecio(costoUnitario)}/{form.unidad_medida}
                </InfoValue>
              </InfoItem>
            </InfoBox>
          )}

          <Row style={{ marginTop: 16 }}>
            <Button onClick={guardarInsumo}>💾 Guardar insumo</Button>
            <ButtonSecondary onClick={() => setMostrarForm(false)}>
              Cancelar
            </ButtonSecondary>
          </Row>
        </Card>
      )}

      <Row style={{ marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Mis insumos ({insumos.length})
        </SectionTitle>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>+ Nuevo insumo</Button>
        )}
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && insumos.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
          <p>Todavía no hay insumos. ¡Agregá el primero!</p>
        </Empty>
      )}

      {insumos.map((i) => (
        <InsumoItem key={i.id}>
          <div>
            <InsumoNombre>{i.nombre}</InsumoNombre>
            <InsumoDetalle>
              {i.categoria}
              {i.subcategoria ? ` · ${i.subcategoria}` : ""}
            </InsumoDetalle>
          </div>
          <div>
            <InsumoDataLabel>Presentación</InsumoDataLabel>
            <InsumoData>
              {i.presentacion} {i.unidad_medida}
            </InsumoData>
          </div>
          <div>
            <InsumoDataLabel>Costo</InsumoDataLabel>
            <InsumoData>{formatPrecio(i.costo_presentacion)}</InsumoData>
          </div>
          <div>
            <InsumoDataLabel>Unitario</InsumoDataLabel>
            <InsumoData>
              {formatPrecio(i.costo_unitario)}/{i.unidad_medida}
            </InsumoData>
          </div>
          <Row style={{ justifyContent: "flex-end" }}>
            <ButtonSecondary
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => setEditando(i)}
            >
              ✏️
            </ButtonSecondary>
            <ButtonDanger
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => eliminarInsumo(i.id)}
            >
              ×
            </ButtonDanger>
          </Row>
        </InsumoItem>
      ))}
    </div>
  );
}

export default Insumos;
