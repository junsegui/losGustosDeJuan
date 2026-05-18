import { useState, useEffect } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import ExportarExcel from "../components/ExportarExcel";

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

const ResultBox = styled.div`
  background: ${(p) =>
    p.bad
      ? p.theme.colors.dangerLight
      : p.warn
        ? p.theme.colors.warningLight
        : p.theme.colors.successLight};
  border: 1px solid
    ${(p) =>
      p.bad
        ? `${p.theme.colors.danger}33`
        : p.warn
          ? `${p.theme.colors.warning}33`
          : `${p.theme.colors.success}33`};
  border-radius: ${(p) => p.theme.radii.md};
  padding: 16px 20px;
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
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
  color: ${(p) =>
    p.bad
      ? p.theme.colors.danger
      : p.warn
        ? p.theme.colors.warning
        : p.good
          ? p.theme.colors.success
          : p.theme.colors.text};
`;

const CartaCard = styled(Card)`
  padding: 16px 24px;
  margin-bottom: 10px;
  border-left: 4px solid
    ${(p) =>
      p.bad
        ? p.theme.colors.danger
        : p.warn
          ? p.theme.colors.warning
          : p.theme.colors.success};
`;

const CartaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CartaNombre = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const CartaDetalle = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 2px;
`;

const CartaStats = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  background: ${(p) => p.theme.colors.background};
  border-radius: ${(p) => p.theme.radii.sm};
  padding: 12px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
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
    p.bad
      ? p.theme.colors.danger
      : p.warn
        ? p.theme.colors.warning
        : p.good
          ? p.theme.colors.success
          : p.highlight
            ? p.theme.colors.primary
            : p.theme.colors.text};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
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

  @media (max-width: 640px) {
    padding: 20px 16px;
    border-radius: ${(p) => p.theme.radii.md};
  }
`;

const ModalTitle = styled.h3`
  font-family: "DM Serif Display", serif;
  font-size: 20px;
  margin-bottom: 20px;
  color: ${(p) => p.theme.colors.text};
`;

function EditModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    precio_venta: item.precio_venta || "",
    markup: item.markup || "30",
  });

  const costo = item.recetas?.costo_por_porcion || 0;
  const precioVenta = parseFloat(form.precio_venta) || 0;
  const cmv = precioVenta > 0 ? (costo / precioVenta) * 100 : 0;
  const ctm = 100 - cmv;

  async function guardar() {
    if (!form.precio_venta) return alert("El precio de venta es obligatorio");

    const { error } = await supabase
      .from("carta")
      .update({
        precio_venta: parseFloat(form.precio_venta),
        cmv: cmv,
        ctm: ctm,
        markup: parseFloat(form.markup),
      })
      .eq("id", item.id);

    if (!error) onSaved();
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Editar precio - {item.nombre_comercial}</ModalTitle>
        <Grid>
          <FormGroup>
            <Label>Precio de venta ($)</Label>
            <Input
              type="number"
              value={form.precio_venta}
              onChange={(e) =>
                setForm({ ...form, precio_venta: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Markup deseado (%)</Label>
            <Input
              type="number"
              value={form.markup}
              onChange={(e) => setForm({ ...form, markup: e.target.value })}
            />
          </FormGroup>
        </Grid>

        {form.precio_venta && (
          <ResultBox bad={cmv > 70} warn={cmv > 50 && cmv <= 70}>
            <ResultItem>
              <ResultLabel>Costo</ResultLabel>
              <ResultValue>{formatPrecio(costo)}</ResultValue>
            </ResultItem>
            <ResultItem>
              <ResultLabel>Precio venta</ResultLabel>
              <ResultValue highlight>{formatPrecio(precioVenta)}</ResultValue>
            </ResultItem>
            <ResultItem>
              <ResultLabel>CMV</ResultLabel>
              <ResultValue bad={cmv > 70} warn={cmv > 50 && cmv <= 70}>
                {cmv.toFixed(1)}%
              </ResultValue>
            </ResultItem>
            <ResultItem>
              <ResultLabel>CTM</ResultLabel>
              <ResultValue good={ctm > 50}>{ctm.toFixed(1)}%</ResultValue>
            </ResultItem>
          </ResultBox>
        )}

        <Row style={{ marginTop: 20 }}>
          <Button onClick={guardar}>Guardar cambios</Button>
          <ButtonSecondary onClick={onClose}>Cancelar</ButtonSecondary>
        </Row>
      </Modal>
    </Overlay>
  );
}

function Carta() {
  const [carta, setCarta] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    receta_id: "",
    nombre_comercial: "",
    precio_venta: "",
    markup: "30",
  });

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    setLoading(true);
    const [{ data: cartaData }, { data: recetasData }] = await Promise.all([
      supabase
        .from("carta")
        .select("*, recetas(*)")
        .order("created_at", { ascending: false }),
      supabase.from("recetas").select("*").order("nombre"),
    ]);
    if (cartaData) setCarta(cartaData);
    if (recetasData) setRecetas(recetasData);
    setLoading(false);
  }

  const recetaSeleccionada = recetas.find((r) => r.id === form.receta_id);
  const costo = recetaSeleccionada?.costo_por_porcion || 0;
  const precioVenta = parseFloat(form.precio_venta) || 0;
  const cmv = precioVenta > 0 ? (costo / precioVenta) * 100 : 0;
  const ctm = 100 - cmv;

  async function guardarCarta() {
    if (!form.receta_id) return alert("Seleccioná una receta");
    if (!form.nombre_comercial.trim())
      return alert("El nombre comercial es obligatorio");
    if (!form.precio_venta) return alert("El precio de venta es obligatorio");

    const { error } = await supabase.from("carta").insert({
      receta_id: form.receta_id,
      nombre_comercial: form.nombre_comercial,
      precio_venta: parseFloat(form.precio_venta),
      cmv: cmv,
      ctm: ctm,
      markup: parseFloat(form.markup),
      activo: true,
    });

    if (!error) {
      setForm({
        receta_id: "",
        nombre_comercial: "",
        precio_venta: "",
        markup: "30",
      });
      setMostrarForm(false);
      fetchTodo();
    }
  }

  async function eliminarCarta(id) {
    if (!confirm("¿Eliminar de la carta?")) return;
    await supabase.from("carta").delete().eq("id", id);
    fetchTodo();
  }

  return (
    <div>
      <Title>Carta</Title>
      <Subtitle>
        Definí el precio de venta y controlá el margen de cada producto.
      </Subtitle>

      {editando && (
        <EditModal
          item={editando}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null);
            fetchTodo();
          }}
        />
      )}

      {mostrarForm && (
        <Card>
          <SectionTitle>Agregar a la carta</SectionTitle>

          <Grid3>
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <Label>Receta</Label>
              <Select
                value={form.receta_id}
                onChange={(e) => {
                  const receta = recetas.find((r) => r.id === e.target.value);
                  setForm({
                    ...form,
                    receta_id: e.target.value,
                    nombre_comercial: receta?.nombre || "",
                  });
                }}
              >
                <option value="">Seleccionar receta...</option>
                {recetas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({formatPrecio(r.costo_por_porcion)} costo)
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <Label>Nombre comercial</Label>
              <Input
                placeholder="Nombre que aparece en la carta"
                value={form.nombre_comercial}
                onChange={(e) =>
                  setForm({ ...form, nombre_comercial: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Precio de venta ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.precio_venta}
                onChange={(e) =>
                  setForm({ ...form, precio_venta: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Markup deseado (%)</Label>
              <Input
                type="number"
                placeholder="30"
                value={form.markup}
                onChange={(e) => setForm({ ...form, markup: e.target.value })}
              />
            </FormGroup>
          </Grid3>

          {form.receta_id && form.precio_venta && (
            <ResultBox bad={cmv > 70} warn={cmv > 50 && cmv <= 70}>
              <ResultItem>
                <ResultLabel>Costo</ResultLabel>
                <ResultValue>{formatPrecio(costo)}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>Precio venta</ResultLabel>
                <ResultValue highlight>{formatPrecio(precioVenta)}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>CMV</ResultLabel>
                <ResultValue bad={cmv > 70} warn={cmv > 50 && cmv <= 70}>
                  {cmv.toFixed(1)}%
                </ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>CTM</ResultLabel>
                <ResultValue good={ctm > 50}>{ctm.toFixed(1)}%</ResultValue>
              </ResultItem>
            </ResultBox>
          )}

          <Row style={{ marginTop: 16 }}>
            <Button onClick={guardarCarta}>💾 Agregar a la carta</Button>
            <ButtonSecondary onClick={() => setMostrarForm(false)}>
              Cancelar
            </ButtonSecondary>
          </Row>
        </Card>
      )}

      <Row style={{ marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Mi carta ({carta.length})
        </SectionTitle>
        <div style={{ flex: 1 }} />
        <ExportarExcel
          datos={carta}
          nombreArchivo="Carta_Completa"
          tipo="carta"
        />
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>
            + Agregar producto
          </Button>
        )}
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && carta.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>Todavía no hay productos en la carta.</p>
        </Empty>
      )}

      {carta.map((c) => {
        const cmvVal = c.cmv || 0;
        const ctmVal = c.ctm || 0;
        return (
          <CartaCard
            key={c.id}
            bad={cmvVal > 70}
            warn={cmvVal > 50 && cmvVal <= 70}
          >
            <CartaHeader>
              <div>
                <CartaNombre>{c.nombre_comercial}</CartaNombre>
                <CartaDetalle>Basado en: {c.recetas?.nombre}</CartaDetalle>
              </div>
              <Row>
                <ButtonSecondary
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => setEditando(c)}
                >
                  ✏️ Editar
                </ButtonSecondary>
                <ButtonDanger
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => eliminarCarta(c.id)}
                >
                  Eliminar
                </ButtonDanger>
              </Row>
            </CartaHeader>
            <CartaStats>
              <StatItem>
                <StatLabel>Costo</StatLabel>
                <StatValue>
                  {formatPrecio(c.recetas?.costo_por_porcion)}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Precio venta</StatLabel>
                <StatValue highlight>{formatPrecio(c.precio_venta)}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Ganancia</StatLabel>
                <StatValue good>
                  {formatPrecio(
                    c.precio_venta - (c.recetas?.costo_por_porcion || 0),
                  )}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>CMV</StatLabel>
                <StatValue bad={cmvVal > 70} warn={cmvVal > 50 && cmvVal <= 70}>
                  {cmvVal.toFixed(1)}%
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>CTM</StatLabel>
                <StatValue good={ctmVal > 50}>{ctmVal.toFixed(1)}%</StatValue>
              </StatItem>
            </CartaStats>
          </CartaCard>
        );
      })}
    </div>
  );
}

export default Carta;
