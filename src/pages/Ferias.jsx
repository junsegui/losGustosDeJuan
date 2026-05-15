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

const FeiraCard = styled(Card)`
  padding: 16px 24px;
  margin-bottom: 10px;
`;

const FeriaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const FeriaNombre = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const FeriaDetalle = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const FeriaStats = styled.div`
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
  color: ${(p) =>
    p.green
      ? p.theme.colors.success
      : p.highlight
        ? p.theme.colors.primary
        : p.theme.colors.text};
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

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 120px 28px;
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
  font-size: 16px;
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

function Ferias() {
  const [ferias, setFerias] = useState([]);
  const [carta, setCarta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    fecha: new Date().toISOString().split("T")[0],
    lugar: "",
    notas: "",
  });

  const [ventas, setVentas] = useState([]);
  const [costos, setCostos] = useState([]);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);
    const [{ data: cartaData }, { data: feriasData }] = await Promise.all([
      supabase
        .from("carta")
        .select("*, recetas(*)")
        .eq("activo", true)
        .order("nombre_comercial"),
      supabase
        .from("ferias")
        .select(
          `
        *,
        ventas_feria(*, carta(nombre_comercial, recetas(costo_por_porcion))),
        costos_feria(*)
      `,
        )
        .order("fecha", { ascending: false }),
    ]);
    if (cartaData) setCarta(cartaData);
    if (feriasData) setFerias(feriasData);
    setLoading(false);
  }

  function addVenta() {
    setVentas([
      ...ventas,
      { carta_id: "", cantidad: "", precio_venta_real: "" },
    ]);
  }

  function removeVenta(i) {
    setVentas(ventas.filter((_, idx) => idx !== i));
  }

  function updateVenta(i, field, value) {
    const nuevas = [...ventas];
    nuevas[i][field] = value;
    setVentas(nuevas);
  }

  function addCosto() {
    setCostos([...costos, { descripcion: "", monto: "" }]);
  }

  function removeCosto(i) {
    setCostos(costos.filter((_, idx) => idx !== i));
  }

  function updateCosto(i, field, value) {
    const nuevos = [...costos];
    nuevos[i][field] = value;
    setCostos(nuevos);
  }

  async function guardarFeria() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");

    const { data: feriaCreada, error } = await supabase
      .from("ferias")
      .insert({
        nombre: form.nombre,
        fecha: form.fecha,
        lugar: form.lugar || null,
        notas: form.notas || null,
      })
      .select()
      .single();

    if (error) return alert("Error al guardar la feria");

    const feriaId = feriaCreada.id;

    const ventasValidas = ventas.filter((v) => v.carta_id && v.cantidad);
    if (ventasValidas.length > 0) {
      await supabase.from("ventas_feria").insert(
        ventasValidas.map((v) => ({
          feria_id: feriaId,
          carta_id: v.carta_id,
          cantidad: parseFloat(v.cantidad),
          precio_venta_real: parseFloat(v.precio_venta_real) || 0,
        })),
      );
    }

    const costosValidos = costos.filter((c) => c.descripcion && c.monto);
    if (costosValidos.length > 0) {
      await supabase.from("costos_feria").insert(
        costosValidos.map((c) => ({
          feria_id: feriaId,
          descripcion: c.descripcion,
          monto: parseFloat(c.monto),
        })),
      );
    }

    setForm({
      nombre: "",
      fecha: new Date().toISOString().split("T")[0],
      lugar: "",
      notas: "",
    });
    setVentas([]);
    setCostos([]);
    setMostrarForm(false);
    fetchTodo();
  }

  async function eliminarFeria(id) {
    if (!confirm("¿Eliminar esta feria?")) return;
    await supabase.from("ferias").delete().eq("id", id);
    fetchTodo();
  }

  function calcularResumen(feria) {
    const ingresos = (feria.ventas_feria || []).reduce(
      (s, v) => s + v.cantidad * v.precio_venta_real,
      0,
    );
    const costosDia = (feria.costos_feria || []).reduce(
      (s, c) => s + c.monto,
      0,
    );
    const ganancia = ingresos - costosDia;
    return { ingresos, costosDia, ganancia };
  }

  return (
    <div>
      <Title>Ferias</Title>
      <Subtitle>Registrá cada evento y lo que vendiste en el día.</Subtitle>

      {mostrarForm && (
        <Card>
          <SectionTitle>Nueva Feria</SectionTitle>

          <Grid>
            <FormGroup>
              <Label>Nombre de la feria</Label>
              <Input
                placeholder="Ej: Feria de Palermo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
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
              <Label>Lugar</Label>
              <Input
                placeholder="Opcional"
                value={form.lugar}
                onChange={(e) => setForm({ ...form, lugar: e.target.value })}
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
          </Grid>

          <SubTitle>🥖 Lo que vendiste</SubTitle>
          {ventas.map((v, i) => (
            <ItemRow key={i}>
              <Select
                value={v.carta_id}
                onChange={(e) => updateVenta(i, "carta_id", e.target.value)}
              >
                <option value="">Seleccionar producto...</option>
                {carta.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre_comercial}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                placeholder="Cant."
                value={v.cantidad}
                onChange={(e) => updateVenta(i, "cantidad", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Precio $"
                value={v.precio_venta_real}
                onChange={(e) =>
                  updateVenta(i, "precio_venta_real", e.target.value)
                }
              />
              <RemoveBtn onClick={() => removeVenta(i)}>×</RemoveBtn>
            </ItemRow>
          ))}
          <ButtonSecondary
            style={{ padding: "6px 14px", fontSize: 13, marginBottom: 16 }}
            onClick={addVenta}
          >
            + Agregar venta
          </ButtonSecondary>

          <SubTitle>💸 Costos del día</SubTitle>
          {costos.map((c, i) => (
            <ItemRow key={i} style={{ gridTemplateColumns: "1fr 120px 28px" }}>
              <Input
                placeholder="Ej: Puesto, Empleado, Transporte..."
                value={c.descripcion}
                onChange={(e) => updateCosto(i, "descripcion", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Monto $"
                value={c.monto}
                onChange={(e) => updateCosto(i, "monto", e.target.value)}
              />
              <RemoveBtn onClick={() => removeCosto(i)}>×</RemoveBtn>
            </ItemRow>
          ))}
          <ButtonSecondary
            style={{ padding: "6px 14px", fontSize: 13, marginBottom: 16 }}
            onClick={addCosto}
          >
            + Agregar costo
          </ButtonSecondary>

          <Row style={{ marginTop: 8 }}>
            <Button onClick={guardarFeria}>💾 Guardar feria</Button>
            <ButtonSecondary
              onClick={() => {
                setMostrarForm(false);
                setVentas([]);
                setCostos([]);
              }}
            >
              Cancelar
            </ButtonSecondary>
          </Row>
        </Card>
      )}

      <Row style={{ marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Historial ({ferias.length})
        </SectionTitle>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>+ Nueva feria</Button>
        )}
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && ferias.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
          <p>Todavía no hay ferias registradas.</p>
        </Empty>
      )}

      {ferias.map((f) => {
        const { ingresos, costosDia, ganancia } = calcularResumen(f);
        return (
          <FeiraCard key={f.id}>
            <FeriaHeader>
              <div>
                <FeriaNombre>{f.nombre}</FeriaNombre>
                <FeriaDetalle>
                  {f.fecha}
                  {f.lugar ? ` · ${f.lugar}` : ""}
                </FeriaDetalle>
              </div>
              <ButtonDanger
                style={{ padding: "6px 12px", fontSize: 12 }}
                onClick={() => eliminarFeria(f.id)}
              >
                Eliminar
              </ButtonDanger>
            </FeriaHeader>
            <FeriaStats>
              <StatItem>
                <StatLabel>Ingresos</StatLabel>
                <StatValue>{formatPrecio(ingresos)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Costos del día</StatLabel>
                <StatValue>{formatPrecio(costosDia)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Ganancia</StatLabel>
                <StatValue green={ganancia > 0}>
                  {formatPrecio(ganancia)}
                </StatValue>
              </StatItem>
            </FeriaStats>
            {f.notas && (
              <div style={{ marginTop: 10, fontSize: 13, color: "#8C7B6B" }}>
                📝 {f.notas}
              </div>
            )}
          </FeiraCard>
        );
      })}
    </div>
  );
}

export default Ferias;
