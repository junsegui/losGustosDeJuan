import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Package,
  Tag,
  Sandwich,
  DollarSign,
  Calendar,
  ShoppingCart,
  BarChart3,
  MapPin,
  Sparkles,
} from "lucide-react";

const NAV_OPERACION = [
  { to: "/", label: "Resumen", icon: Home, exact: true },
  { to: "/insumos", label: "Insumos", icon: Package },
  { to: "/sub-recetas", label: "Sub-recetas", icon: Tag },
  { to: "/recetas", label: "Recetas", icon: Sandwich },
  { to: "/carta", label: "Carta", icon: DollarSign },
  { to: "/ferias", label: "Eventos", icon: Calendar },
  { to: "/gastos", label: "Gastos", icon: ShoppingCart },
];

const NAV_ANALISIS = [
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/analisis-lugar", label: "Análisis por lugar", icon: MapPin },
];

const SidebarWrap = styled.aside`
  width: 240px;
  background: ${(p) => p.theme.colors.surfaceAlt};
  border-right: 1px solid ${(p) => p.theme.colors.border};
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 900px) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    transform: ${(p) => (p.$open ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.22s ease;
    box-shadow: ${(p) => (p.$open ? p.theme.shadows.lg : "none")};
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 14px 8px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  margin-bottom: 12px;
`;

const BrandMark = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: ${(p) => p.theme.colors.primary};
  color: white;
  display: grid;
  place-items: center;
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 13px;
  flex-shrink: 0;
`;

const BrandText = styled.div``;

const BrandName = styled.div`
  font-family: ${(p) => p.theme.fonts.serif};
  font-size: 15px;
  color: ${(p) => p.theme.colors.text};
  line-height: 1.2;
`;

const BrandSub = styled.div`
  font-size: 10.5px;
  color: ${(p) => p.theme.colors.textMuted};
  margin-top: 1px;
`;

const NavLabel = styled.div`
  font-size: 10.5px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 10px 10px 4px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: ${(p) => p.theme.radii.sm};
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textMuted};
  transition: background 0.12s, color 0.12s;
  border: 1px solid transparent;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  &:hover {
    background: ${(p) => p.theme.colors.surfaceHover};
    color: ${(p) => p.theme.colors.text};
    svg { opacity: 1; }
  }

  &.active {
    background: ${(p) => p.theme.colors.surface};
    color: ${(p) => p.theme.colors.primary};
    border-color: ${(p) => p.theme.colors.border};
    box-shadow: ${(p) => p.theme.shadows.sm};
    font-weight: 600;
    svg { opacity: 1; }
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const SidebarFooter = styled.div`
  border-top: 1px solid ${(p) => p.theme.colors.border};
  padding-top: 8px;
  margin-top: 4px;
`;

const CalcBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border-radius: ${(p) => p.theme.radii.sm};
  border: 1px solid transparent;
  background: none;
  font-size: 13.5px;
  font-weight: 500;
  color: ${(p) => p.theme.colors.textMuted};
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  &:hover {
    background: ${(p) => p.theme.colors.surfaceHover};
    color: ${(p) => p.theme.colors.text};
    svg { opacity: 1; }
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: ${(p) => (p.$open ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 199;
  }
`;

function Sidebar({ open, onClose, onOpenCalc }) {
  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <SidebarWrap $open={open}>
        <Brand>
          <BrandMark>LG</BrandMark>
          <BrandText>
            <BrandName>Los Gustos<br />de Juan</BrandName>
            <BrandSub>Manager de feria</BrandSub>
          </BrandText>
        </Brand>

        <NavLabel>Operación</NavLabel>
        {NAV_OPERACION.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onClose}
            >
              <Icon />
              {item.label}
            </NavItem>
          );
        })}

        <NavLabel>Análisis</NavLabel>
        {NAV_ANALISIS.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem key={item.to} to={item.to} onClick={onClose}>
              <Icon />
              {item.label}
            </NavItem>
          );
        })}

        <Spacer />

        <SidebarFooter>
          <CalcBtn onClick={onOpenCalc}>
            <Sparkles />
            Calculadora rápida
          </CalcBtn>
        </SidebarFooter>
      </SidebarWrap>
    </>
  );
}

export default Sidebar;
