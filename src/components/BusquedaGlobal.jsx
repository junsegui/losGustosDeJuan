import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { supabase } from "../lib/supabase";
import { formatPrecio } from "../lib/calculos";
import { useNavigate } from "react-router-dom";

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.sm};
  color: ${(p) => p.theme.colors.text};
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
  padding: 8px 14px 8px 36px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${(p) => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${(p) => p.theme.colors.textLight};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 16px;
  pointer-events: none;
`;

const Results = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => p.theme.shadows.lg};
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const ResultSection = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 8px 16px 4px;
`;

const ResultItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${(p) => p.theme.colors.surfaceAlt};
  }
`;

const ResultName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 2px;
`;

const ResultDetail = styled.div`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textMuted};
`;

const ResultValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.primary};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${(p) => p.theme.colors.textMuted};
  font-size: 13px;
`;

function BusquedaGlobal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    insumos: [],
    subRecetas: [],
    recetas: [],
    carta: [],
  });
  const [mostrar, setMostrar] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ insumos: [], subRecetas: [], recetas: [], carta: [] });
      setMostrar(false);
      return;
    }

    buscar(query);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMostrar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function buscar(q) {
    const searchTerm = `%${q}%`;

    const [
      { data: insumos },
      { data: subRecetas },
      { data: recetas },
      { data: carta },
    ] = await Promise.all([
      supabase.from("insumos").select("*").ilike("nombre", searchTerm).limit(5),
      supabase
        .from("sub_recetas")
        .select("*")
        .ilike("nombre", searchTerm)
        .limit(5),
      supabase.from("recetas").select("*").ilike("nombre", searchTerm).limit(5),
      supabase
        .from("carta")
        .select("*, recetas(*)")
        .ilike("nombre_comercial", searchTerm)
        .limit(5),
    ]);

    setResults({
      insumos: insumos || [],
      subRecetas: subRecetas || [],
      recetas: recetas || [],
      carta: carta || [],
    });
    setMostrar(true);
  }

  function irA(tipo) {
    const rutas = {
      insumo: "/insumos",
      subReceta: "/sub-recetas",
      receta: "/recetas",
      carta: "/carta",
    };
    navigate(rutas[tipo]);
    setQuery("");
    setMostrar(false);
  }

  const hayResultados =
    results.insumos.length > 0 ||
    results.subRecetas.length > 0 ||
    results.recetas.length > 0 ||
    results.carta.length > 0;

  return (
    <SearchContainer ref={containerRef}>
      <SearchIcon>🔍</SearchIcon>
      <SearchInput
        placeholder="Buscar en todo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setMostrar(true)}
      />

      {mostrar && query.trim().length >= 2 && (
        <Results>
          {!hayResultados && (
            <EmptyState>No se encontraron resultados para "{query}"</EmptyState>
          )}

          {results.insumos.length > 0 && (
            <ResultSection>
              <SectionTitle>🛒 Insumos</SectionTitle>
              {results.insumos.map((i) => (
                <ResultItem key={i.id} onClick={() => irA("insumo")}>
                  <div>
                    <ResultName>{i.nombre}</ResultName>
                    <ResultDetail>{i.categoria}</ResultDetail>
                  </div>
                  <ResultValue>
                    {formatPrecio(i.costo_unitario)}/{i.unidad_medida}
                  </ResultValue>
                </ResultItem>
              ))}
            </ResultSection>
          )}

          {results.subRecetas.length > 0 && (
            <ResultSection>
              <SectionTitle>🍖 Sub-recetas</SectionTitle>
              {results.subRecetas.map((sr) => (
                <ResultItem key={sr.id} onClick={() => irA("subReceta")}>
                  <div>
                    <ResultName>{sr.nombre}</ResultName>
                    <ResultDetail>
                      Rinde: {sr.rinde} {sr.unidad_rinde}
                    </ResultDetail>
                  </div>
                  <ResultValue>
                    {formatPrecio(sr.costo_unitario)}/{sr.unidad_rinde}
                  </ResultValue>
                </ResultItem>
              ))}
            </ResultSection>
          )}

          {results.recetas.length > 0 && (
            <ResultSection>
              <SectionTitle>🥖 Recetas</SectionTitle>
              {results.recetas.map((r) => (
                <ResultItem key={r.id} onClick={() => irA("receta")}>
                  <div>
                    <ResultName>{r.nombre}</ResultName>
                    <ResultDetail>
                      Rinde: {r.rinde} {r.unidad_rinde}
                    </ResultDetail>
                  </div>
                  <ResultValue>{formatPrecio(r.costo_por_porcion)}</ResultValue>
                </ResultItem>
              ))}
            </ResultSection>
          )}

          {results.carta.length > 0 && (
            <ResultSection>
              <SectionTitle>📋 Carta</SectionTitle>
              {results.carta.map((c) => (
                <ResultItem key={c.id} onClick={() => irA("carta")}>
                  <div>
                    <ResultName>{c.nombre_comercial}</ResultName>
                    <ResultDetail>CMV: {c.cmv?.toFixed(1)}%</ResultDetail>
                  </div>
                  <ResultValue>{formatPrecio(c.precio_venta)}</ResultValue>
                </ResultItem>
              ))}
            </ResultSection>
          )}
        </Results>
      )}
    </SearchContainer>
  );
}

export default BusquedaGlobal;
