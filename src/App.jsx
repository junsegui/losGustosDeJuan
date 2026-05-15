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
`;

const Logo = styled.span`
  font-family: "DM Serif Display", serif;
  font-size: 20px;
  color: ${(p) => p.theme.colors.primary};
  margin-right: 24px;
`;

const NavItem = styled(NavLink)`
  text-decoration: none;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: ${(p) => p.theme.radii.sm};
  transition: all 0.15s;

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
`;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Nav>
          <Logo>🥩 Feria Manager</Logo>
          <BusquedaGlobal />
          <NavItem to="/">Resumen</NavItem>
          <NavItem to="/insumos">Insumos</NavItem>{" "}
          <NavItem to="/sub-recetas">Sub-recetas</NavItem>
          <NavItem to="/recetas">Recetas</NavItem>
          <NavItem to="/carta">Carta</NavItem>
          <NavItem to="/ferias">Ferias</NavItem>
          <NavItem to="/gastos">Gastos</NavItem>
          <NavItem to="/reportes">Reportes</NavItem>
          <NavItem to="/analisis-lugar">Análisis por Lugar</NavItem>
        </Nav>
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
