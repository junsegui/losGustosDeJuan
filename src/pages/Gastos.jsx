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

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Grid3 = styled(Grid)`
  grid-template-columns: 1fr 1fr 1fr;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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

const GastoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  margin-bottom: 8px;
  box-shadow: ${(p) => p.theme.shadows.sm};
`;

const GastoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const GastoDescripcion = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const GastoMeta = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const GastoMonto = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.danger};
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.theme.colors.primaryLight};
  color: ${(p) => p.theme.colors.primary};
  margin-left: 8px;
`;

const StatCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  margin-bottom: 0;
  padding: 20px 24px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  font-family: "DM Serif Display", serif;
  font-size: 26px;
  color: ${(p) => (p.red ? p.theme.colors.danger : p.theme.colors.text)};
`;

const CATEGORIAS = [
  { value: "Insumos", label: "🛒 Insumos / Materia prima" },
  { value: "Transporte", label: "🚗 Transporte" },
  { value: "Equipamiento", label: "🔧 Equipamiento" },
  { value: "Impuestos", label: "📄 Impuestos / Tasas" },
  { value: "Otro", label: "📦 Otro" },
];

function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    categoria: "Insumos",
    fecha: new Date().toISOString().split("T")[0],
    notas: "",
  });

  useEffect(() => {
    fetchGastos();
  }, []);

  async function fetchGastos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });
    if (!error) setGastos(data);
    setLoading(false);
  }

  async function guardarGasto() {
    if (!form.descripcion.trim()) return alert("La descripción es obligatoria");
    if (!form.monto) return alert("El monto es obligatorio");

    const { error } = await supabase.from("gastos").insert({
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      categoria: form.categoria,
      fecha: form.fecha,
      notas: form.notas || null,
    });

    if (!error) {
      setForm({
        descripcion: "",
        monto: "",
        categoria: "Insumos",
        fecha: new Date().toISOString().split("T")[0],
        notas: "",
      });
      fetchGastos();
    }
  }

  async function eliminarGasto(id) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await supabase.from("gastos").delete().eq("id", id);
    fetchGastos();
  }

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const gastoEsteMes = gastos
    .filter((g) => g.fecha?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, g) => s + g.monto, 0);

  return (
    <div>
      <Title>Gastos</Title>
      <Subtitle>Registrá los gastos generales del negocio.</Subtitle>

      <StatCards>
        <StatCard>
          <StatLabel>Total gastado</StatLabel>
          <StatValue red>{formatPrecio(totalGastos)}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Este mes</StatLabel>
          <StatValue red>{formatPrecio(gastoEsteMes)}</StatValue>
        </StatCard>
      </StatCards>

      <Card>
        <SectionTitle>Registrar gasto</SectionTitle>
        <Grid3>
          <FormGroup>
            <Label>Descripción</Label>
            <Input
              placeholder="Ej: Compra de leña"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Monto ($)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label>Categoría</Label>
            <Select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
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
          <FormGroup>
            <Label>Notas</Label>
            <Input
              placeholder="Opcional"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </FormGroup>
        </Grid3>
        <Button onClick={guardarGasto}>💾 Registrar gasto</Button>
      </Card>

      <Row style={{ marginBottom: 16 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Historial ({gastos.length})
        </SectionTitle>
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && gastos.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
          <p>No hay gastos registrados todavía.</p>
        </Empty>
      )}

      {gastos.map((g) => (
        <GastoItem key={g.id}>
          <GastoInfo>
            <GastoDescripcion>
              {g.descripcion}
              <Badge>{g.categoria}</Badge>
            </GastoDescripcion>
            <GastoMeta>
              {g.fecha}
              {g.notas ? ` · ${g.notas}` : ""}
            </GastoMeta>
          </GastoInfo>
          <Row>
            <GastoMonto>{formatPrecio(g.monto)}</GastoMonto>
            <ButtonDanger
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => eliminarGasto(g.id)}
            >
              Eliminar
            </ButtonDanger>
          </Row>
        </GastoItem>
      ))}
    </div>
  );
}

export default Gastos;
