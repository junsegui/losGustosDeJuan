import { useState, useCallback, createContext, useContext } from "react";
import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from { transform: translateX(110%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: ${(p) => p.theme.radii.sm};
  font-family: ${(p) => p.theme.fonts.sans};
  font-size: 14px;
  font-weight: 500;
  box-shadow: ${(p) => p.theme.shadows.lg};
  animation: ${slideIn} 0.2s ease;
  background: ${(p) => p.$type === "error"
    ? p.theme.colors.danger
    : p.$type === "warn"
    ? p.theme.colors.warning
    : "#1A1208"};
  color: white;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => p.$type === "error" ? "#ffaaaa" : "#aaffcc"};
  flex-shrink: 0;
`;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer>
        {toasts.map((t) => (
          <ToastItem key={t.id} $type={t.type}>
            <Dot $type={t.type} />
            {t.msg}
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
