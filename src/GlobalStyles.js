import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* Mejorar scroll en mobile */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* Inputs más grandes en mobile para evitar zoom en iOS */
  @media (max-width: 768px) {
    input, select, textarea {
      font-size: 16px !important;
    }

    /* Botones más fáciles de tocar */
    button {
      min-height: 44px;
    }

    /* Modales full-width en mobile */
    .modal-overlay {
      padding: 12px;
      align-items: flex-end;
    }
  }
`;

export default GlobalStyles;
