import { useState, useEffect } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";

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
    transform: translateY(-1px);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) =>
    p.pieza ? p.theme.colors.primaryLight : p.theme.colors.successLight};
  color: ${(p) => (p.pieza ? p.theme.colors.primary : p.theme.colors.success)};
`;

const ProductoCard = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  margin-bottom: 10px;
  position: relative;
`;

const ProductoNombre = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ProductoDetalle = styled.div`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

// Tooltip / Popover de edición
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Popover = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 28px;
  width: 100%;
  max-width: 480px;
  box-shadow: ${(p) => p.theme.shadows.lg};
`;

const PopoverTitle = styled.h3`
  font-family: "DM Serif Display", serif;
  font-size: 20px;
  margin-bottom: 20px;
  color: ${(p) => p.theme.colors.text};
`;

function EditModal({ producto, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre: producto.nombre,
    tipo: producto.tipo,
    precio_venta: producto.precio_venta || "",
    notas: producto.notas || "",
  });

  async function guardar() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");

    const { error } = await supabase
      .from("productos")
      .update({
        nombre: form.nombre,
        tipo: form.tipo,
        precio_venta: form.precio_venta || null,
        notas: form.notas || null,
      })
      .eq("id", producto.id);

    if (!error) onSaved();
  }

  return (
    <Overlay onClick={onClose}>
      <Popover onClick={(e) => e.stopPropagation()}>
        <PopoverTitle>Editar producto</PopoverTitle>
        <Grid>
          <FormGroup>
            <Label>Nombre</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Label>Tipo</Label>
            <Select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="pieza">🍖 Pieza (por kg)</option>
              <option value="sanguche">🥖 Sanguche (por unidad)</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Precio de venta</Label>
            <Input
              type="number"
              placeholder="Opcional"
              value={form.precio_venta}
              onChange={(e) =>
                setForm({ ...form, precio_venta: e.target.value })
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
        </Grid>
        <Row>
          <Button onClick={guardar}>Guardar cambios</Button>
          <ButtonSecondary onClick={onClose}>Cancelar</ButtonSecondary>
        </Row>
      </Popover>
    </Overlay>
  );
}

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "pieza",
    precio_venta: "",
    notas: "",
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProductos(data);
    setLoading(false);
  }

  async function guardarProducto() {
    if (!form.nombre.trim()) return alert("El nombre es obligatorio");

    const { error } = await supabase.from("productos").insert({
      nombre: form.nombre,
      tipo: form.tipo,
      precio_venta: form.precio_venta || null,
      notas: form.notas || null,
    });

    if (!error) {
      setForm({ nombre: "", tipo: "pieza", precio_venta: "", notas: "" });
      setMostrarForm(false);
      fetchProductos();
    }
  }

  async function eliminarProducto(id) {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;
    await supabase.from("productos").delete().eq("id", id);
    fetchProductos();
  }

  return (
    <div>
      <Title>Productos</Title>
      <Subtitle>El catálogo de todo lo que hacés y vendés.</Subtitle>

      {editando && (
        <EditModal
          producto={editando}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null);
            fetchProductos();
          }}
        />
      )}

      {mostrarForm && (
        <Card>
          <SectionTitle>Nuevo Producto</SectionTitle>
          <Grid>
            <FormGroup>
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Bondiola ahumada"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="pieza">🍖 Pieza (se vende por kg)</option>
                <option value="sanguche">
                  🥖 Sanguche (se vende por unidad)
                </option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Precio de venta referencia</Label>
              <Input
                type="number"
                placeholder="Opcional"
                value={form.precio_venta}
                onChange={(e) =>
                  setForm({ ...form, precio_venta: e.target.value })
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
          </Grid>
          <Row>
            <Button onClick={guardarProducto}>Guardar producto</Button>
            <ButtonSecondary onClick={() => setMostrarForm(false)}>
              Cancelar
            </ButtonSecondary>
          </Row>
        </Card>
      )}

      <Row style={{ marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0, border: "none", padding: 0 }}>
          Mis productos ({productos.length})
        </SectionTitle>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}>+ Nuevo producto</Button>
        )}
      </Row>

      {loading && <Empty>Cargando...</Empty>}

      {!loading && productos.length === 0 && (
        <Empty>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <p>Todavía no hay productos. ¡Agregá el primero!</p>
        </Empty>
      )}

      {productos.map((p) => (
        <ProductoCard key={p.id}>
          <div>
            <ProductoNombre>{p.nombre}</ProductoNombre>
            <ProductoDetalle>
              {p.precio_venta
                ? `$${p.precio_venta}${p.tipo === "pieza" ? "/kg" : " c/u"}`
                : "Sin precio definido"}
              {p.notas ? ` · ${p.notas}` : ""}
            </ProductoDetalle>
          </div>
          <Row>
            <Badge pieza={p.tipo === "pieza"}>
              {p.tipo === "pieza" ? "🍖 Pieza" : "🥖 Sanguche"}
            </Badge>
            <ButtonSecondary
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => setEditando(p)}
            >
              ✏️ Editar
            </ButtonSecondary>
            <ButtonDanger
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={() => eliminarProducto(p.id)}
            >
              Eliminar
            </ButtonDanger>
          </Row>
        </ProductoCard>
      ))}
    </div>
  );
}

export default Productos;
