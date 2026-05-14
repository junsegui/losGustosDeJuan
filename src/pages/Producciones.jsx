import { useState, useEffect } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import {
  calcularKgFinales,
  calcularCostoTotal,
  calcularCostoPorKg,
  calcularPrecioSugerido,
  formatPrecio,
} from "../lib/calculos";

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

// Caja de resultado del cálculo
const ResultBox = styled.div`
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 20px 24px;
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  font-size: 20px;
  font-weight: 700;
  color: ${(p) => (p.highlight ? p.theme.colors.primary : p.theme.colors.text)};
`;

const ProduccionCard = styled(Card)`
  padding: 16px 24px;
  margin-bottom: 10px;
`;

const ProduccionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProduccionNombre = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const ProduccionFecha = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const ProduccionStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

function Producciones() {
  const [producciones, setProducciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    producto_id: "",
    fecha: new Date().toISOString().split("T")[0],
    kg_comprados: "",
    precio_kg: "",
    merma_porcentaje: "",
    costo_insumos_extra: "",
    margen_deseado: "30",
    notas: "",
  });

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);
    const [{ data: prods }, { data: producs }] = await Promise.all([
      supabase.from("productos").select("*").order("nombre"),
      supabase
        .from("producciones")
        .select("*, productos(nombre)")
        .order("fecha", { ascending: false }),
    ]);
    if (prods) setProductos(prods);
    if (producs) setProducciones(producs);
    setLoading(false);
  }

  // Calculos en tiempo real
  const kgFinales = calcularKgFinales(
    parseFloat(form.kg_comprados) || 0,
    parseFloat(form.merma_porcentaje) || 0,
  );
  const costoTotal = calcularCostoTotal(
    parseFloat(form.kg_comprados) || 0,
    parseFloat(form.precio_kg) || 0,
    parseFloat(form.costo_insumos_extra) || 0,
  );
  const costoPorKg = calcularCostoPorKg(costoTotal, kgFinales);
  const precioSugerido = calcularPrecioSugerido(
    costoPorKg,
    parseFloat(form.margen_deseado) || 0,
  );

  const hayCalculo = form.kg_comprados && form.precio_kg;

  async function guardarProduccion() {
    if (!form.producto_id) return alert("Seleccioná un producto");
    if (!form.kg_comprados || !form.precio_kg)
      return alert("Kg y precio por kg son obligatorios");

    const { error } = await supabase.from("producciones").insert({
      producto_id: form.producto_id,
      fecha: form.fecha,
      kg_comprados: parseFloat(form.kg_comprados),
      precio_kg: parseFloat(form.precio_kg),
      merma_porcentaje: parseFloat(form.merma_porcentaje) || 0,
      kg_finales: kgFinales,
      costo_insumos_extra: parseFloat(form.costo_insumos_extra) || 0,
      costo_total: costoTotal,
      costo_por_kg: costoPorKg,
      notas: form.notas || null,
    });

    if (!error) {
      setForm({
        producto_id: "",
        fecha: new Date().toISOString().split("T")[0],
        kg_comprados: "",
        precio_kg: "",
        merma_porcentaje: "",
        costo_insumos_extra: "",
        margen_deseado: "30",
        notas: "",
      });
      setMostrarForm(false);
      fetchTodo();
    }
  }

  async function eliminarProduccion(id) {
    if (!confirm("¿Eliminar esta producción?")) return;
    await supabase.from("producciones").delete().eq("id", id);
    fetchTodo();
  }

  return (
    <div>
      <Title>Producciones</Title>
      <Subtitle>
        Registrá cada lote que hacés y calculá el costo real por kg.
      </Subtitle>

      {mostrarForm && (
        <Card>
          <SectionTitle>Nueva Producción</SectionTitle>

          <Grid>
            <FormGroup>
              <Label>Producto</Label>
              <Select
                value={form.producto_id}
                onChange={(e) =>
                  setForm({ ...form, producto_id: e.target.value })
                }
              >
                <option value="">Seleccioná un producto...</option>
                {productos
                  .filter((p) => p.tipo === "pieza")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
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
          </Grid>

          <Grid3>
            <FormGroup>
              <Label>Kg comprados</Label>
              <Input
                type="number"
                placeholder="Ej: 10"
                value={form.kg_comprados}
                onChange={(e) =>
                  setForm({ ...form, kg_comprados: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Precio por kg ($)</Label>
              <Input
                type="number"
                placeholder="Ej: 5000"
                value={form.precio_kg}
                onChange={(e) =>
                  setForm({ ...form, precio_kg: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Merma (%)</Label>
              <Input
                type="number"
                placeholder="Ej: 30"
                value={form.merma_porcentaje}
                onChange={(e) =>
                  setForm({ ...form, merma_porcentaje: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Insumos extra ($)</Label>
              <Input
                type="number"
                placeholder="Especias, leña... (opcional)"
                value={form.costo_insumos_extra}
                onChange={(e) =>
                  setForm({ ...form, costo_insumos_extra: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Margen deseado (%)</Label>
              <Input
                type="number"
                placeholder="Ej: 30"
                value={form.margen_deseado}
                onChange={(e) =>
                  setForm({ ...form, margen_deseado: e.target.value })
                }
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

          {hayCalculo && (
            <ResultBox>
              <ResultItem>
                <ResultLabel>Kg finales</ResultLabel>
                <ResultValue>{kgFinales.toFixed(2)} kg</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>Costo total</ResultLabel>
                <ResultValue>{formatPrecio(costoTotal)}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>Costo por kg</ResultLabel>
                <ResultValue>{formatPrecio(costoPorKg)}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>Precio sugerido</ResultLabel>
                <ResultValue highlight>
                  {formatPrecio(precioSugerido)}
                </ResultValue>
              </ResultItem>
            </ResultBox>
          )}

          <Row style={{ marginTop: 20 }}>
            <Button onClick={guardarProduccion}>💾 Guardar producción</Button>
            <ButtonSecondary onClick={() => setMostrarForm(false)}>
              Cancelar
            </ButtonSecondary>
          </Row>
        </Card>
      )}

      <Row style={{ marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Historial ({producciones.length})
        </SectionTitle>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>
            + Nueva producción
          </Button>
        )}
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && producciones.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍖</div>
          <p>Todavía no hay producciones registradas.</p>
        </Empty>
      )}

      {producciones.map((p) => (
        <ProduccionCard key={p.id}>
          <ProduccionHeader>
            <div>
              <ProduccionNombre>{p.productos?.nombre}</ProduccionNombre>
              <ProduccionFecha>{p.fecha}</ProduccionFecha>
            </div>
            <ButtonDanger
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => eliminarProduccion(p.id)}
            >
              Eliminar
            </ButtonDanger>
          </ProduccionHeader>
          <ProduccionStats>
            <StatItem>
              <StatLabel>Kg comprados</StatLabel>
              <StatValue>{p.kg_comprados} kg</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Kg finales</StatLabel>
              <StatValue>{p.kg_finales?.toFixed(2)} kg</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Costo total</StatLabel>
              <StatValue>{formatPrecio(p.costo_total)}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Costo por kg</StatLabel>
              <StatValue highlight>{formatPrecio(p.costo_por_kg)}</StatValue>
            </StatItem>
          </ProduccionStats>
          {p.notas && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#8C7B6B" }}>
              📝 {p.notas}
            </div>
          )}
        </ProduccionCard>
      ))}
    </div>
  );
}

export default Producciones;
