import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import styled from "styled-components";
import Dashboard from "./pages/Dashboard";
import Insumos from "./pages/Insumos";
import Ferias from "./pages/Ferias";
import Gastos from "./pages/Gastos";
import SubRecetas from "./pages/SubRecetas";
import Carta from "./pages/Carta";
import Recetas from "./pages/Recetas";
import CalculadoraExpress from "./components/CalculadoraExpress";
import BusquedaGlobal from "./components/BusquedaGlobal";
import Reportes from "./pages/Reportes";
import AnalisisPorLugar from "./pages/AnalisisPorLugar";

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Nav = styled.nav`
  background: ${(p) => p.theme.colors.surface};
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 60px;
  box-shadow: ${(p) => p.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 900px) {
    padding: 0 16px;
  }
`;

const Logo = styled.span`
  font-family: "DM Serif Display", serif;
  font-size: 20px;
  color: ${(p) => p.theme.colors.primary};
  margin-right: 24px;
  white-space: nowrap;

  @media (max-width: 900px) {
    margin-right: 0;
    font-size: 17px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;

  @media (max-width: 900px) {
    display: none;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  max-width: 320px;
  margin-right: 8px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  text-decoration: none;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13px;
  font-weight: 500;
  padding: 7px 11px;
  border-radius: ${(p) => p.theme.radii.sm};
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => p.theme.colors.surfaceAlt};
  }

  &.active {
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => p.theme.colors.primaryLight};
  }
`;

const HamburgerBtn = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${(p) => p.theme.colors.text};
  font-size: 22px;
  padding: 8px;
  margin-left: auto;
  line-height: 1;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: ${(p) => (p.$open ? "flex" : "none")};
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${(p) => p.theme.colors.surface};
    flex-direction: column;
    padding: 12px 16px 24px;
    z-index: 99;
    overflow-y: auto;
    gap: 4px;
    border-top: 1px solid ${(p) => p.theme.colors.border};
  }
`;

const MobileSearchWrapper = styled.div`
  margin-bottom: 12px;
`;

const MobileNavItem = styled(NavLink)`
  text-decoration: none;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 16px;
  font-weight: 500;
  padding: 14px 16px;
  border-radius: ${(p) => p.theme.radii.sm};
  transition: all 0.15s;
  display: block;

  &:hover {
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => p.theme.colors.surfaceAlt};
  }

  &.active {
    color: ${(p) => p.theme.colors.primary};
    background: ${(p) => p.theme.colors.primaryLight};
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const NAV_ITEMS = [
  { to: "/", label: "Resumen" },
  { to: "/insumos", label: "Insumos" },
  { to: "/sub-recetas", label: "Sub-recetas" },
  { to: "/recetas", label: "Recetas" },
  { to: "/carta", label: "Carta" },
  { to: "/ferias", label: "Ferias" },
  { to: "/gastos", label: "Gastos" },
  { to: "/reportes", label: "Reportes" },
  { to: "/analisis-lugar", label: "Análisis por Lugar" },
];

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <BrowserRouter>
      <Layout>
        <Nav>
          <Logo>Los Gustos de Juan</Logo>
          <SearchWrapper>
            <BusquedaGlobal />
          </SearchWrapper>
          <NavLinks>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} to={item.to}>
                {item.label}
              </NavItem>
            ))}
          </NavLinks>
          <HamburgerBtn
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Menú"
          >
            {menuAbierto ? "✕" : "☰"}
          </HamburgerBtn>
        </Nav>

        <MobileMenu $open={menuAbierto}>
          <MobileSearchWrapper>
            <BusquedaGlobal />
          </MobileSearchWrapper>
          {NAV_ITEMS.map((item) => (
            <MobileNavItem key={item.to} to={item.to} onClick={cerrarMenu}>
              {item.label}
            </MobileNavItem>
          ))}
        </MobileMenu>

        <Content>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sub-recetas" element={<SubRecetas />} />
            <Route path="/analisis-lugar" element={<AnalisisPorLugar />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/ferias" element={<Ferias />} />
            <Route path="/carta" element={<Carta />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/recetas" element={<Recetas />} />
            <Route path="/reportes" element={<Reportes />} />
          </Routes>
        </Content>
        <CalculadoraExpress />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
