import { useState } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const AppShell = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Content = styled.main`
  flex: 1;
  padding: 24px 32px;
  background: ${(p) => p.theme.colors.background};

  @media (max-width: 900px) {
    padding: 20px 16px;
  }
`;

function MainLayout({ children, onOpenCalc }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppShell>
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenCalc={onOpenCalc}
      />
      <MainCol>
        <TopBar
          onOpenMenu={() => setMobileOpen(true)}
          onOpenCalc={onOpenCalc}
        />
        <Content>{children}</Content>
      </MainCol>
    </AppShell>
  );
}

export default MainLayout;
