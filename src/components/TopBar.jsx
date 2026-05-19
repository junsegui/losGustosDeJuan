import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { Sparkles, Menu } from "lucide-react";
import BusquedaGlobal from "./BusquedaGlobal";

const ROUTE_LABELS = {
  "/": "Resumen",
  "/insumos": "Insumos",
  "/sub-recetas": "Sub-recetas",
  "/recetas": "Recetas",
  "/carta": "Carta",
  "/ferias": "Eventos",
  "/gastos": "Gastos",
  "/reportes": "Reportes",
  "/analisis-lugar": "Análisis por lugar",
};

const Bar = styled.header`
  height: 52px;
  background: ${(p) => p.theme.colors.surface};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
`;

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${(p) => p.theme.colors.textMuted};
  padding: 6px;
  border-radius: ${(p) => p.theme.radii.sm};
  line-height: 0;

  &:hover {
    background: ${(p) => p.theme.colors.surfaceHover};
    color: ${(p) => p.theme.colors.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Crumb = styled.span`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const CrumbCurrent = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
`;

const SearchWrap = styled.div`
  flex: 1;
  max-width: 340px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Spacer = styled.div`
  flex: 1;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid ${(p) => p.theme.colors.border};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.textMuted};
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: ${(p) => p.theme.colors.surfaceHover};
    color: ${(p) => p.theme.colors.text};
  }
`;

function TopBar({ onOpenMenu, onOpenCalc }) {
  const { pathname } = useLocation();
  const label = ROUTE_LABELS[pathname] ?? "Manager";

  return (
    <Bar>
      <HamburgerBtn onClick={onOpenMenu} aria-label="Abrir menú">
        <Menu />
      </HamburgerBtn>

      <Breadcrumb>
        <Crumb>Manager</Crumb>
        <Crumb>/</Crumb>
        <CrumbCurrent>{label}</CrumbCurrent>
      </Breadcrumb>

      <Spacer />

      <SearchWrap>
        <BusquedaGlobal />
      </SearchWrap>

      <Actions>
        <IconBtn title="Calculadora express" onClick={onOpenCalc}>
          <Sparkles />
        </IconBtn>
      </Actions>
    </Bar>
  );
}

export default TopBar;
