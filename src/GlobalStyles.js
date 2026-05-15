import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* Ajustes mobile */
  @media (max-width: 768px) {
    /* Reducir padding general */
    main {
      padding: 20px 16px !important;
    }

    /* Hacer grids de 2 columnas en mobile */
    .grid-2, .grid-3 {
      grid-template-columns: 1fr !important;
    }

    /* Stats en mobile - 2 columnas */
    .stat-grid-4 {
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
    }

    /* Tablas responsive */
    .table-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* Botones más grandes en mobile */
    button {
      min-height: 44px;
    }

    /* Nav en mobile - scroll horizontal */
    nav {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding: 0 16px !important;
    }

    /* Logo más pequeño en mobile */
    nav span {
      font-size: 16px !important;
    }

    /* NavItems más compactos */
    nav a {
      white-space: nowrap;
      font-size: 13px !important;
    }

    /* Calculadora en mobile */
    .calculadora-floating {
      bottom: 16px !important;
      right: 16px !important;
      width: 50px !important;
      height: 50px !important;
    }

    /* Modales en mobile */
    .modal-overlay {
      padding: 16px;
    }

    .modal {
      max-width: 100% !important;
      margin: 0 !important;
    }

    /* Búsqueda en mobile */
    .search-container {
      max-width: 100% !important;
      order: 3;
      width: 100%;
      margin-top: 8px;
    }

    /* Gráficos más chicos en mobile */
    .recharts-wrapper {
      font-size: 10px !important;
    }
  }

  /* Mejorar scroll en mobile */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* Inputs más grandes en mobile */
  @media (max-width: 768px) {
    input, select, textarea {
      font-size: 16px !important; /* Evita zoom en iOS */
    }
  }
`;

export default GlobalStyles;
