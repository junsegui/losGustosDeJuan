import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import MainLayout from "./components/MainLayout";
import CalculadoraExpress from "./components/CalculadoraExpress";
import Dashboard from "./pages/Dashboard";
import Insumos from "./pages/Insumos";
import Ferias from "./pages/Ferias";
import Gastos from "./pages/Gastos";
import SubRecetas from "./pages/SubRecetas";
import Carta from "./pages/Carta";
import Recetas from "./pages/Recetas";
import Reportes from "./pages/Reportes";
import AnalisisPorLugar from "./pages/AnalisisPorLugar";

function App() {
  const [calcOpen, setCalcOpen] = useState(false);

  return (
    <ToastProvider>
    <BrowserRouter>
      <MainLayout onOpenCalc={() => setCalcOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/sub-recetas" element={<SubRecetas />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/carta" element={<Carta />} />
          <Route path="/ferias" element={<Ferias />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/analisis-lugar" element={<AnalisisPorLugar />} />
        </Routes>
      </MainLayout>
      <CalculadoraExpress
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
      />
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
