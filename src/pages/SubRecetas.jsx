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

const SubTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  margin-top: 16px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

const IngredienteRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 100px 100px 100px 100px 32px;
  gap: 8px;
  align-items: center;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 8px 12px;
  margin-bottom: 6px;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${(p) => p.theme.colors.textMuted};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    color: ${(p) => p.theme.colors.danger};
    background: ${(p) => p.theme.colors.dangerLight};
  }
`;

const ResultBox = styled.div`
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 16px 20px;
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ResultLabel = styled.span`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const ResultValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.highlight ? p.theme.colors.primary : p.theme.colors.text)};
`;

const SubRecetaCard = styled(Card)`
  padding: 16px 24px;
  margin-bottom: 10px;
`;

const SubRecetaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SubRecetaNombre = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const SubRecetaDetalle = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const SubRecetaStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: ${(p) => p.theme.colors.background};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 12px 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.span`
  font-size: 11px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${(p) => (p.highlight ? p.theme.colors.primary : p.theme.colors.text)};
`;

function SubRecetas() {
  const [subRecetas, setSubRecetas] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    rinde: "",
    unidad_rinde: "gr",
    notas: "",
  });

  const [ingredientes, setIngredientes] = useState([]);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);
    const [{ data: subs }, { data: ins }] = await Promise.all([
      supabase
        .from("sub_recetas")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("insumos").select("*").order("nombre"),
    ]);
    if (subs) setSubRecetas(subs);
    if (ins) setInsumos(ins);
    setLoading(false);
  }

  function addIngrediente() {
    setIngredientes([
      ...ingredientes,
      { insumo_id: "", cantidad: "", unidad: "gr", desperdicio: 0, merma: 0 },
    ]);
  }

  function removeIngrediente(i) {
    setIngredientes(ingredientes.filter((_, idx) => idx !== i));
  }

  function updateIngrediente(i, field, value) {
    const nuevos = [...ingredientes];
    nuevos[i][field] = value;
    setIngredientes(nuevos);
  }

  // Calcular costo total y unitario en tiempo real
  const costoTotal = ingredientes.reduce((sum, ing) => {
    const insumo = insumos.find((ins) => ins.id === ing.insumo_id);
    if (!insumo || !ing.cantidad) return sum;
    const costo = insumo.costo_unitario * parseFloat(ing.cantidad);
    return sum + costo;
  }, 0);

  const costoUnitario = form.rinde ? costoTotal / parseFloat(form.rinde) : 0;

  async function guardarSubReceta() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");
    if (!form.rinde) return alert("El rinde es obligatorio");
    if (ingredientes.length === 0)
      return alert("Agregá al menos un ingrediente");

    // 1. Crear sub-receta
    const { data: subReceta, error } = await supabase
      .from("sub_recetas")
      .insert({
        nombre: form.nombre,
        categoria: form.categoria || null,
        rinde: parseFloat(form.rinde),
        unidad_rinde: form.unidad_rinde,
        costo_total: costoTotal,
        costo_unitario: costoUnitario,
        notas: form.notas || null,
      })
      .select()
      .single();

    if (error) return alert("Error al guardar");

    // 2. Guardar ingredientes
    const ingredientesValidos = ingredientes.filter(
      (i) => i.insumo_id && i.cantidad,
    );
    if (ingredientesValidos.length > 0) {
      await supabase.from("ingredientes_sub_receta").insert(
        ingredientesValidos.map((i) => ({
          sub_receta_id: subReceta.id,
          insumo_id: i.insumo_id,
          cantidad: parseFloat(i.cantidad),
          unidad: i.unidad,
          desperdicio: parseFloat(i.desperdicio) || 0,
          merma: parseFloat(i.merma) || 0,
        })),
      );
    }

    // Resetear
    setForm({
      nombre: "",
      categoria: "",
      rinde: "",
      unidad_rinde: "gr",
      notas: "",
    });
    setIngredientes([]);
    setMostrarForm(false);
    fetchTodo();
  }

  async function eliminarSubReceta(id) {
    if (!confirm("¿Eliminar esta sub-receta?")) return;
    await supabase.from("sub_recetas").delete().eq("id", id);
    fetchTodo();
  }

  return (
    <div>
      <Title>Sub-recetas</Title>
      <Subtitle>
        Productos intermedios que hacés con merma — bondiola ahumada, pulled
        pork, etc.
      </Subtitle>

      {mostrarForm && (
        <Card>
          <SectionTitle>Nueva sub-receta</SectionTitle>

          <Grid3>
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Bondiola ahumada"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Categoría</Label>
              <Input
                placeholder="Opcional"
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Rinde</Label>
              <Input
                type="number"
                placeholder="Cuánto sale"
                value={form.rinde}
                onChange={(e) => setForm({ ...form, rinde: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Unidad rinde</Label>
              <Select
                value={form.unidad_rinde}
                onChange={(e) =>
                  setForm({ ...form, unidad_rinde: e.target.value })
                }
              >
                <option value="gr">gr</option>
                <option value="kg">kg</option>
                <option value="un">un</option>
              </Select>
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

          <SubTitle>🧾 Ingredientes</SubTitle>
          {ingredientes.map((ing, i) => (
            <IngredienteRow key={i}>
              <Select
                value={ing.insumo_id}
                onChange={(e) =>
                  updateIngrediente(i, "insumo_id", e.target.value)
                }
              >
                <option value="">Seleccionar insumo...</option>
                {insumos.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.nombre} ({formatPrecio(ins.costo_unitario)}/
                    {ins.unidad_medida})
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                placeholder="Cant."
                value={ing.cantidad}
                onChange={(e) =>
                  updateIngrediente(i, "cantidad", e.target.value)
                }
              />
              <Select
                value={ing.unidad}
                onChange={(e) => updateIngrediente(i, "unidad", e.target.value)}
              >
                <option value="gr">gr</option>
                <option value="kg">kg</option>
                <option value="un">un</option>
              </Select>
              <Input
                type="number"
                placeholder="Desp. %"
                value={ing.desperdicio}
                onChange={(e) =>
                  updateIngrediente(i, "desperdicio", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Merma %"
                value={ing.merma}
                onChange={(e) => updateIngrediente(i, "merma", e.target.value)}
              />
              <RemoveBtn onClick={() => removeIngrediente(i)}>×</RemoveBtn>
            </IngredienteRow>
          ))}

          <ButtonSecondary
            style={{ padding: "8px 14px", fontSize: 13, marginTop: 8 }}
            onClick={addIngrediente}
          >
            + Agregar ingrediente
          </ButtonSecondary>

          {ingredientes.length > 0 && form.rinde && (
            <ResultBox>
              <ResultItem>
                <ResultLabel>Costo total</ResultLabel>
                <ResultValue>{formatPrecio(costoTotal)}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>Rinde</ResultLabel>
                <ResultValue>
                  {form.rinde} {form.unidad_rinde}
                </ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>Costo unitario</ResultLabel>
                <ResultValue highlight>
                  {formatPrecio(costoUnitario)}/{form.unidad_rinde}
                </ResultValue>
              </ResultItem>
            </ResultBox>
          )}

          <Row style={{ marginTop: 20 }}>
            <Button onClick={guardarSubReceta}>💾 Guardar sub-receta</Button>
            <ButtonSecondary
              onClick={() => {
                setMostrarForm(false);
                setIngredientes([]);
              }}
            >
              Cancelar
            </ButtonSecondary>
          </Row>
        </Card>
      )}

      <Row style={{ marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Mis sub-recetas ({subRecetas.length})
        </SectionTitle>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>
            + Nueva sub-receta
          </Button>
        )}
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && subRecetas.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍖</div>
          <p>Todavía no hay sub-recetas registradas.</p>
        </Empty>
      )}

      {subRecetas.map((sr) => (
        <SubRecetaCard key={sr.id}>
          <SubRecetaHeader>
            <div>
              <SubRecetaNombre>{sr.nombre}</SubRecetaNombre>
              <SubRecetaDetalle>{sr.categoria}</SubRecetaDetalle>
            </div>
            <ButtonDanger
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => eliminarSubReceta(sr.id)}
            >
              Eliminar
            </ButtonDanger>
          </SubRecetaHeader>
          <SubRecetaStats>
            <StatItem>
              <StatLabel>Rinde</StatLabel>
              <StatValue>
                {sr.rinde} {sr.unidad_rinde}
              </StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Costo total</StatLabel>
              <StatValue>{formatPrecio(sr.costo_total)}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Costo unitario</StatLabel>
              <StatValue highlight>
                {formatPrecio(sr.costo_unitario)}/{sr.unidad_rinde}
              </StatValue>
            </StatItem>
          </SubRecetaStats>
          {sr.notas && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#8C7B6B" }}>
              📝 {sr.notas}
            </div>
          )}
        </SubRecetaCard>
      ))}
    </div>
  );
}

export default SubRecetas;
