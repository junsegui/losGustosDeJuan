import { useState } from "react";
import styled from "styled-components";
import { formatPrecio } from "../lib/calculos";

const FloatingButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(p) => p.theme.colors.primary};
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(232, 114, 28, 0.4);
  transition: all 0.2s;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(232, 114, 28, 0.5);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.lg};
  padding: 28px;
  width: 100%;
  max-width: 500px;
  box-shadow: ${(p) => p.theme.shadows.lg};
  animation: slideUp 0.2s;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalTitle = styled.h3`
  font-family: "DM Serif Display", serif;
  font-size: 22px;
  margin-bottom: 6px;
  color: ${(p) => p.theme.colors.text};
`;

const ModalSubtitle = styled.p`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-bottom: 20px;
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

const ResultBox = styled.div`
  background: ${(p) => p.theme.colors.primaryLight};
  border: 1px solid ${(p) => p.theme.colors.primary}33;
  border-radius: ${(p) => p.theme.radii.md};
  padding: 20px 24px;
  margin: 16px 0;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
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
  font-size: ${(p) => (p.large ? "24px" : "18px")};
  font-weight: 700;
  color: ${(p) => (p.highlight ? p.theme.colors.primary : p.theme.colors.text)};
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

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

function CalculadoraExpress() {
  const [mostrar, setMostrar] = useState(false);
  const [form, setForm] = useState({
    kgComprados: "",
    precioKg: "",
    mermaPorcentaje: "",
    insumosExtra: "",
    margenDeseado: "30",
  });

  const kgComprados = parseFloat(form.kgComprados) || 0;
  const precioKg = parseFloat(form.precioKg) || 0;
  const mermaPorcentaje = parseFloat(form.mermaPorcentaje) || 0;
  const insumosExtra = parseFloat(form.insumosExtra) || 0;
  const margenDeseado = parseFloat(form.margenDeseado) || 0;

  const kgFinales = kgComprados * (1 - mermaPorcentaje / 100);
  const costoTotal = kgComprados * precioKg + insumosExtra;
  const costoPorKg = kgFinales > 0 ? costoTotal / kgFinales : 0;
  const precioSugerido = costoPorKg / (1 - margenDeseado / 100);

  const hayCalculo = kgComprados > 0 && precioKg > 0;

  function limpiar() {
    setForm({
      kgComprados: "",
      precioKg: "",
      mermaPorcentaje: "",
      insumosExtra: "",
      margenDeseado: "30",
    });
  }

  return (
    <>
      <FloatingButton onClick={() => setMostrar(true)}>🧮</FloatingButton>

      {mostrar && (
        <Overlay onClick={() => setMostrar(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Calculadora Express</ModalTitle>
            <ModalSubtitle>
              Calculá el costo real por kg con merma al instante
            </ModalSubtitle>

            <Grid>
              <FormGroup>
                <Label>Kg comprados</Label>
                <Input
                  type="number"
                  placeholder="Ej: 10"
                  value={form.kgComprados}
                  onChange={(e) =>
                    setForm({ ...form, kgComprados: e.target.value })
                  }
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Precio por kg ($)</Label>
                <Input
                  type="number"
                  placeholder="Ej: 6000"
                  value={form.precioKg}
                  onChange={(e) =>
                    setForm({ ...form, precioKg: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup>
                <Label>Merma (%)</Label>
                <Input
                  type="number"
                  placeholder="Ej: 30"
                  value={form.mermaPorcentaje}
                  onChange={(e) =>
                    setForm({ ...form, mermaPorcentaje: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup>
                <Label>Insumos extra ($)</Label>
                <Input
                  type="number"
                  placeholder="Especias, leña..."
                  value={form.insumosExtra}
                  onChange={(e) =>
                    setForm({ ...form, insumosExtra: e.target.value })
                  }
                />
              </FormGroup>
              <FormGroup>
                <Label>Margen deseado (%)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={form.margenDeseado}
                  onChange={(e) =>
                    setForm({ ...form, margenDeseado: e.target.value })
                  }
                />
              </FormGroup>
            </Grid>

            {hayCalculo && (
              <ResultBox>
                <ResultGrid>
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
                    <ResultValue highlight>
                      {formatPrecio(costoPorKg)}
                    </ResultValue>
                  </ResultItem>
                </ResultGrid>
                <div
                  style={{
                    borderTop: "1px solid rgba(232, 114, 28, 0.2)",
                    paddingTop: 16,
                  }}
                >
                  <ResultItem>
                    <ResultLabel>
                      💰 Precio sugerido de venta (con {margenDeseado}% margen)
                    </ResultLabel>
                    <ResultValue large highlight>
                      {formatPrecio(precioSugerido)}/kg
                    </ResultValue>
                  </ResultItem>
                </div>
              </ResultBox>
            )}

            <Row>
              <ButtonSecondary onClick={limpiar}>Limpiar</ButtonSecondary>
              <div style={{ flex: 1 }} />
              <ButtonSecondary onClick={() => setMostrar(false)}>
                Cerrar
              </ButtonSecondary>
            </Row>
          </Modal>
        </Overlay>
      )}
    </>
  );
}

export default CalculadoraExpress;
