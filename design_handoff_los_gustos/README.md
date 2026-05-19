# Handoff: Los Gustos de Juan — Rediseño UI/UX

## Overview

Rediseño completo del manager de feria **Los Gustos de Juan** (`junsegui/losGustosDeJuan`). Conserva 100% del modelo de datos actual (Supabase: `insumos`, `sub_recetas`, `recetas`, `carta`, `ferias`, `gastos`) y simplifica `ferias` a ser solo agenda / notas (sin tablas `ventas_feria` ni `costos_feria`). Cambia el layout, la jerarquía visual y las interacciones.

**Objetivo:** mover la UI de "stack vertical de cards" a una app productiva tipo Linear/Notion, conservando la calidez de cream + naranja + DM Serif Display.

**Cambio de scope importante:** 
- La pantalla de Eventos ahora es solo para **agendar** ferias / puestos en ruta — nombre, tipo, fecha, lugar, notas. **No registra ventas ni costos** del día. Esto simplifica el schema (no necesitás `ventas_feria` ni `costos_feria`) y deja a Gastos como única fuente de costos del negocio.
- **Sin login.** La app es single-user y arranca directo en Resumen. No incluir pantalla de autenticación.
- **Calculadora Express conservada** — mismo componente flotante que ya tenés, más un acceso desde el sidebar ("Calculadora rápida") y desde el top bar (ícono ✨). Misma lógica: kg comprados · precio/kg · merma % · insumos extra · margen deseado → kg finales, costo total, costo por kg, precio sugerido.

---

## About the Design Files

Los archivos en `prototype/` son **referencias de diseño** hechas en HTML + React via Babel CDN — **no son código de producción** para copiar y pegar.

Tu codebase actual ya tiene:
- ✅ React 19 + Vite
- ✅ styled-components (con `theme.js` configurado)
- ✅ React Router DOM v7
- ✅ Supabase
- ✅ Recharts (todavía sin uso intensivo — el prototipo usa charts custom; podés mantenerlos o migrar a Recharts)
- ✅ xlsx para exports
- ✅ DM Serif Display + DM Sans cargadas

La tarea es **reimplementar estos diseños en tu stack existente**, manteniendo styled-components y la conexión a Supabase. No reemplaces el setup.

---

## Fidelity

**High-fidelity (hi-fi).** Los mocks tienen colores exactos, tipografía final, espaciado preciso, estados hover/focus y micro-interacciones. Recreá los layouts con la mayor fidelidad posible usando styled-components.

---

## Cambios estructurales principales

### 1. Sidebar en lugar de top nav
**Antes:** `<Nav>` horizontal con 9 items.
**Ahora:** sidebar fijo de 240px en `desktop` (`@media (min-width: 900px)`), con dos grupos:
- **Operación:** Resumen, Insumos, Sub-recetas, Recetas, Carta, Eventos, Gastos
- **Análisis:** Reportes, Análisis por lugar

El logo "Los Gustos de Juan" arriba (DM Serif Display, partido en 2 líneas), un sidebar-footer abajo con un botón "Calculadora rápida". **No incluir chip de usuario / perfil** (la app es de un solo usuario).

En mobile: ocultar sidebar y mostrar el hamburger actual.

### 2. Top bar minimal con búsqueda global ⌘K
Una barra de 52px arriba del contenido con:
- Breadcrumb: `Manager / <pantalla actual>`
- Input de búsqueda global (reemplaza `BusquedaGlobal` actual, mismo behavior) con tecla `⌘K` mostrada
- Botón de calculadora express a la derecha

### 3. Tarjetas más densas, mejor jerarquía
Los cards de página ahora tienen `card-header` separado del `card-body` con border-bottom suave, título en uppercase y `card-sub` en gris. Esto da estructura visual sin "ruido".

### 4. Estadísticas en serif
Los números grandes (KPIs, totales, ganancias) usan **DM Serif Display** — no DM Sans. Da elegancia de libro contable. Tamaño 24–32px.

### 5. CMV con color *fuerte*
En lugar de sólo `border-left` colorido en las cards de Carta, el chip de CMV también tiene background tintado (rojo/ámbar/verde) y el número del CMV en la card se imprime en ese color. Lectura de un vistazo.

### 6. Eventos como agenda de notas (no como bitácora de ventas)
**Antes:** las ferias guardaban `ventas_feria` y `costos_feria` con desglose por producto.
**Ahora:** la pantalla de Eventos solo guarda **nombre, tipo, fecha, lugar y notas**. Es una agenda de recordatorios — qué ferias vienen, qué llevar, dónde son. El registro de costos vive en la pantalla de **Gastos** (general, sin asociar a feria).

Esto te permite eliminar las tablas `ventas_feria` y `costos_feria` de Supabase y dejar solo `ferias` con los campos básicos.

### 7. "Eventos" como nombre, no "Ferias"
La pantalla maneja `feria` y `puesto_ruta` por igual, así que el título de página y el item de sidebar pasan a "Eventos". La tabla de Supabase sigue siendo `ferias`.

### 8. Sugerencia de precio en vivo (Carta)
En el editor de carta, mostrar abajo del input de markup un link clickeable: `"Sugerido: $X.XXX"` que setea el precio automáticamente. Cálculo: `precio = costo / (1 - markup/100)`.

---

## Pantallas

> **Nota:** no hay pantalla de Login. La app arranca directo en `/` (Resumen).

### Resumen (`/`)
**Propósito:** vista de un vistazo del estado del negocio.

**Layout:**
1. **Header:** título "Hola, Juan 👋" + subtítulo con fecha actual en español. Acciones: "Exportar" + "Nueva feria" (botón naranja).
2. **Alerta (si aplica):** banner rojo claro con count de productos CMV > 70% + botón "Ver carta →".
3. **KPI grid (4 columnas, gap 12px):**
   - Ganancia ferias (prominente, fondo gradient sutil con accent-soft)
   - Ingresos brutos
   - Gastos generales
   - Productos en carta (con sub-label "X con margen bajo" en rojo si los hay)
4. **Grid 2-col:**
   - **Izquierda:** gráfico de barras "Ingresos por evento" (últimas 8 ferias). Barra naranja si ganancia > 0, roja si pérdida. Tooltip al hover.
   - **Derecha:** "Últimas ferias" — lista de 5 con nombre + tipo (pill), fecha, lugar y ganancia coloreada a la derecha.
5. **Grid 2-col:**
   - **Izquierda:** "Productos en carta" — lista con nombre, costo + markup, chip de CMV coloreado, precio en naranja.
   - **Derecha:** "Últimos gastos" — lista con descripción, categoría (pill), fecha, monto en rojo `−$XXX`.

### Insumos (`/insumos`)
**Layout:** header + toolbar (search + filtro de categoría + counter) + tabla.

**Tabla:** Insumo (con notas en gris si las hay) | Categoría (pill) + subcategoría debajo | Presentación | Costo | Costo unitario (en naranja, bold) | acciones (edit / delete).

**Modal de edición:** form con nombre, categoría/subcategoría, presentación + unidad + costo, y un **panel de "Costo unitario" auto-calculado** en bg `accent-soft` con valor grande en naranja. Notas al final.

### Sub-recetas (`/sub-recetas`)
Tabla simple. Mismo patrón que Insumos pero con columnas: Nombre | Categoría | Rinde | Costo total | Costo unitario.

El editor de sub-receta es **idéntico al de Recetas** (sub-recetas = recetas que rinden múltiples unidades y se usan como insumo en otras recetas).

### Recetas (`/recetas`)
**Layout:** header + toolbar + **grid de cards** (`auto-fill, minmax(320px, 1fr)`).

**Card de receta:**
- Header: nombre (DM Serif Display, 18px), categoría + rinde en gris.
- Lista de ingredientes (insumos + sub-recetas con pill `sub` azul para distinguir).
- Footer con fondo `bg-sunk`: Costo total + Costo / unidad (este en naranja).

**Modal editor:** nombre, categoría, rinde + unidad. Lista de ingredientes con tipo (insumo/sub-receta) + select + cantidad + unidad + botón eliminar. Botón "+ Agregar ingrediente". **Caja de resumen en vivo** con costo total / rinde / costo por porción mientras editás.

### Carta (`/carta`)
**Layout:** header + toolbar con leyenda de colores ("verde < 50%, ámbar 50–70%, rojo > 70%") + lista vertical de cards.

**Card de carta:**
- Border-left de 4px con color según CMV (`success` / `warning` / `danger`).
- Header con nombre comercial (serif), receta base + markup.
- Acciones edit/delete.
- Footer con stats en 5 columnas, fondo `bg-sunk`: Costo | Precio (naranja) | Ganancia (verde) | CMV (color según valor) | CTM.

**Modal editor:** receta (select), nombre comercial, precio + markup. **Resultado en vivo en 4 columnas** con border-left coloreado según CMV.

### Eventos (`/ferias`)
**Layout:** header + toolbar (filtro de tipo + lugar + counter) + dos secciones separadas: **Próximos** (ordenados ascendentes) y **Pasados** (descendentes).

**Card de evento** (grid `auto-fill, minmax(380px, 1fr)`):
- Bloque de fecha a la izquierda (60px ancho): mes en uppercase, día en serif grande, día de la semana abajo. Si es próximo, el bloque tiene fondo `accent-soft` y texto naranja; si es pasado, fondo neutro.
- A la derecha: nombre (serif), pill de tipo (verde puesto_ruta, naranja feria), pin + lugar.
- Botones edit / delete arriba a la derecha.
- Notas (si las hay) en bloque `bg-sunk` debajo, con prefijo 📝.

**Modal de creación / edición:** form simple con nombre, tipo (select), fecha, lugar, notas (textarea de 3 filas). Nada más.

> **Sin** ventas ni costos. **Sin** KPIs de ingresos/ganancia. La pantalla es estrictamente agenda.

### Gastos (`/gastos`)
**Layout:** header + grid 2-col (Total filtrado en naranja serif + Por categoría con barras de progreso) + toolbar filtro + tabla.

**Tabla:** Fecha | Descripción | Categoría (pill) | Monto (en rojo, `−$XXX`) | acciones.

### Reportes (`/reportes`)
**Sin datos de ventas**, esta pantalla se centra en **costos** y **salud del menú**.

**Layout:** header con segmented control de período (30d / 90d / Todo) + 4 KPIs + gráfico full-width + grid 2-col + grid 2-col abajo.

**KPIs:** Gastos totales (prominente) | Productos en carta (con count de margen ajustado) | Insumos cargados | Eventos agendados (con split feria/puesto_ruta).

**Gráfico:** gastos agrupados por día, ordenados cronológicamente.

**Bottom grids:**
- **Gastos por categoría** con barras de progreso y % del total.
- **Salud del menú** con 4 buckets (Excelente / Bueno / Ajustado / Crítico) por rango de CMV, cada uno con barra verde/ámbar/roja.
- **Insumos más caros** ranking top 5 por costo unitario.
- **Carta por margen** top 6 productos a revisar primero (CMV más alto arriba).

### Análisis por lugar (`/analisis-lugar`)
**Sin datos de ventas**, esta pantalla muestra **frecuencia** de visitas por lugar — qué tan seguido vas, próxima visita, última visita.

**Card:** posición (01, 02... primer puesto en naranja sólido, resto neutral), nombre del lugar (serif), counts de visitas / ferias / puestos. A la derecha: count grande en serif y naranja. Debajo: próxima visita (si la hay, en naranja) + última visita. Barra de progreso proporcional a la frecuencia de visitas.

## Design Tokens

Reusá tu `theme.js` actual — coincide casi 1:1. Recomendaciones de tweaks:

```js
export const theme = {
  colors: {
    // Fondos (sin cambios)
    background: "#FAF7F2",
    surface: "#FFFFFF",
    surfaceAlt: "#F2EDE4",
    surfaceHover: "#EDE6DA",        // NUEVO — para hover de items de sidebar/tabla

    // Acentos (sin cambios)
    primary: "#E8721C",
    primaryHover: "#CF5E0E",
    primaryLight: "#FDF0E8",

    // Texto (sin cambios)
    text: "#1A1208",
    textMuted: "#8C7B6B",
    textLight: "#B5A899",

    // Estados (sin cambios)
    success: "#2E7D32",
    successLight: "#EDF7EE",
    warning: "#E65100",
    warningLight: "#FFF3E0",
    danger: "#C62828",
    dangerLight: "#FFEBEE",
    info: "#1565C0",                // NUEVO — pills "sub" en recetas
    infoLight: "#E3F2FD",           // NUEVO

    // Bordes (sin cambios)
    border: "#E0D8CE",
    borderStrong: "#C8BDB0",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
  },
  shadows: {
    sm: "0 1px 4px rgba(26, 18, 8, 0.06)",
    md: "0 4px 16px rgba(26, 18, 8, 0.08)",
    lg: "0 12px 36px rgba(26, 18, 8, 0.12)",
  },
  fonts: {                          // NUEVO — centralizar fuentes
    serif: '"DM Serif Display", Georgia, serif',
    sans: '"DM Sans", system-ui, sans-serif',
    mono: '"DM Mono", ui-monospace, monospace',
  },
};
```

### Espaciado
- Sidebar: 240px
- Top bar: 52px
- Content padding: 24px 32px en desktop, 20px 16px en mobile
- Card radius: 10px (md) para cards normales, 16px (lg) para modales/login
- Gap entre cards: 18–20px
- Gap entre filas de tabla: 10–12px

### Tipografía
| Uso | Familia | Tamaño | Peso | Color |
|---|---|---|---|---|
| Page title (H1) | DM Serif Display | 30px | 400 | text |
| Card title | DM Sans | 13.5px | 600 | text |
| Card sub | DM Sans | 12px | 400 | textMuted |
| KPI value | DM Serif Display | 28px | 400 | text (o accent si prominente) |
| Table body | DM Sans | 13px | 400/500 | text |
| Table header | DM Sans | 11.5px uppercase | 500 | textMuted |
| Pill | DM Sans | 11px | 500 | varía |
| Stat label | DM Sans | 11px uppercase | 600 | textMuted |
| Mono / números tabulares | DM Mono | varía | varía | varía |

### Iconografía
El prototipo usa SVGs estilo Lucide inline (`icons.jsx`). Recomendación: instalar **`lucide-react`** para tu codebase real (`npm i lucide-react`). Mapeo de los íconos usados:
- `IHome` → `Home`
- `IBox` → `Package`
- `ISandwich` → `Sandwich`
- `ICart` → `ShoppingCart`
- `IDollar` → `DollarSign`
- `ICalendar` → `Calendar`
- `IChart` → `BarChart3`
- `IPin` → `MapPin`
- `IPlus` → `Plus`
- `IEdit` → `Pencil`
- `ITrash` → `Trash2`
- `ISearch` → `Search`
- `ISparkle` → `Sparkles`
- `IUp` → `TrendingUp`
- `IAlert` → `AlertTriangle`
- `IClose` → `X`
- `ICheck` → `Check`
- `IDownload` → `Download`
- `ITag` → `Tag`
- `IArrowUp` / `IArrowDown` → `ArrowUp` / `ArrowDown`

---

## Interactions & Behavior

### Routing
Mantener `react-router-dom`. Rutas existentes funcionan tal cual:
```
/                  → Resumen
/insumos           → Insumos
/sub-recetas       → Sub-recetas
/recetas           → Recetas
/carta             → Carta
/ferias            → Eventos
/gastos            → Gastos
/reportes          → Reportes
/analisis-lugar    → Análisis por lugar
```

### Modales
- Backdrop: `rgba(0, 0, 0, 0.4)`, full-screen, click cierra.
- Container: `maxWidth: 480px` (640px para editores complejos como Recetas y Eventos), `borderRadius: 16px`, `box-shadow: shadows.lg`.
- Header con título serif + subtítulo en gris + botón X.
- Footer con `background: surfaceAlt` y botones alineados a la derecha.
- Click stop propagation en el contenido.
- Esc cierra (listener en `useEffect`).

### Toasts
Aparecen abajo-centro al confirmar acciones. Background = text color, foreground = bg color, ícono check verde, animación slide-up 200ms.

### Hover states
- Botones secundarios: `background: surfaceAlt → border`.
- Filas de tabla: `background: surfaceHover`.
- Cards clickeables (Eventos): cursor pointer, sin hover visual fuerte para no competir con el contenido.
- Sidebar items: bg cambia a `surfaceHover`, ítem activo tiene bg `surface` + border + shadow-sm.

### Animaciones
- Modal fade-in 150ms.
- Toast slide-up 200ms.
- Hover transitions 100–150ms.
- Bar chart bars: opacity 0.85 default, 1 on hover, `translateY(-2px)`.

### Form patterns
- Labels uppercase 12px, letter-spacing 0.05em, gris medio.
- Inputs: bg `background`, border `border`, `borderRadius: sm`, focus state con `border: primary`.
- Validación inline simple (disabled del botón si faltan required fields).

### Estados vacíos
Para cada lista vacía:
```jsx
<Empty>
  <EmptyIcon>{/* relevant icon, 40px */}</EmptyIcon>
  <EmptyTitle>Todavía no hay <X></EmptyTitle>
  <EmptySub>Empezá cargando el primero →</EmptySub>
  <Button>+ Nuevo <X></Button>
</Empty>
```

### Recalcular automático
Eliminar el botón "🔄 Recalcular costos" de Insumos. Cuando se modifica un costo de insumo, ejecutar `recalcularTodo()` en background y mostrar toast pequeño: `"23 recetas actualizadas"`.

### Comando rápido ⌘K
Reemplazar `BusquedaGlobal` con un command palette modal. Al apretar `⌘K`:
1. Abre modal centrado, input enfocado.
2. Resultados agrupados: Insumos / Recetas / Carta / Ferias / Acciones (nueva feria, nuevo gasto, etc.).
3. Flechas para navegar, Enter ejecuta.

Si te complica, mantené tu `BusquedaGlobal` actual y simplemente agregale el atajo de teclado + estilizalo según los tokens del prototipo.

---

## State Management

Tu app ya usa Supabase para persistencia, no necesitás store global. Patrones recomendados:

1. **Cada pantalla mantiene su propio estado local** (carta, ferias, etc.) con `useState` + `useEffect(fetchTodo, [])` — como ya hacés.
2. **Después de mutaciones** (insert/update/delete), volver a llamar `fetchTodo()` para refrescar.
3. **Cálculos en el cliente:** mantené las funciones en `lib/calculos.js` — coinciden con la lógica del prototipo.
4. **Para CMV real de feria:** sumá `r.costo_por_porcion × v.cantidad` sobre todas las ventas, usando los joins que ya hacés (`ventas_feria(*, carta(*, recetas(costo_por_porcion)))`).

---

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| `>= 900px` | Sidebar visible, top bar con search, KPIs 4 columnas, grids 2-col |
| `< 900px` | Sidebar oculto, hamburger menu, KPIs 2 columnas, grids 1-col |
| `< 640px` | KPIs 1 columna, tablas con scroll horizontal |

El sidebar en mobile reemplaza al `MobileMenu` actual del `App.jsx`.

---

## Files

```
prototype/
├── Los Gustos de Juan.html   ← entry point: tokens CSS + script imports
├── app.jsx                   ← App shell, sidebar, routing, TopBar
├── screens.jsx               ← Login, Resumen, Insumos, Recetas
├── screens2.jsx              ← Sub-recetas, Carta, Eventos, Gastos, Reportes, Análisis
├── data.jsx                  ← Schema mocks + format helpers (referenciá para shape)
├── icons.jsx                 ← SVG inline (usar lucide-react en prod)
└── tweaks-panel.jsx          ← UI de toggle dark mode (no portar; usar tu propio sistema si querés)
```

Abrí `Los Gustos de Juan.html` en un navegador para ver el prototipo corriendo.

---

## Implementation Roadmap (recomendado)

1. **Fase 1 — Foundation (2-3 hs):**
   - Actualizar `theme.js` con los nuevos tokens (surfaceHover, info, fonts).
   - Crear `<Sidebar>`, `<TopBar>`, `<MainLayout>` con styled-components.
   - Reemplazar `<Nav>` por el nuevo layout en `App.jsx`.
   - Instalar `lucide-react`.

2. **Fase 2 — Resumen (1-2 hs):**
   - Rediseñar KPIs con DM Serif Display.
   - Refactor de las cards en grid 2x2.
   - Sumar gráfico de barras (custom o Recharts) de últimos eventos.

3. **Fase 3 — Carta + Eventos (2-3 hs):**
   - Color coding fuerte para CMV.
   - Modal de detalle de feria con CMV real calculado.
   - Sugerencia de precio en editor de carta.

4. **Fase 4 — Resto de pantallas (3-4 hs):**
   - Insumos, Recetas, Sub-recetas, Gastos, Reportes, Análisis por lugar.

5. **Fase 5 — Pulido (1-2 hs):**
   - Estados vacíos con onboarding.
   - Recalculo automático silencioso.
   - ⌘K command palette (opcional, alto valor).
   - Toasts.

Total estimado: **10–14 horas** de desarrollo.

---

## Cosas que NO cambiar

- ✅ Schema de `insumos`, `sub_recetas`, `recetas`, `carta`, `gastos` — quedó intacto.
- ✅ Tabla `ferias` — quedó pero **podés eliminar** `ventas_feria` y `costos_feria` (ya no se usan).
- ✅ Lógica de `lib/calculos.js` y `lib/recalcular.js` — sirve tal cual.
- ✅ `ExportarExcel` component — funciona, conservalo.
- ✅ `CalculadoraExpress` flotante — opcional moverla al sidebar, pero funciona.
- ✅ Nombre de las tablas, columnas, relations restantes — todo igual.

## Preguntas para resolver con el dueño

- ¿Querés que el sidebar sea siempre visible o colapsable a íconos?
- ¿Soporte de exportar reportes a PDF además de Excel?
- ¿Eliminamos `ventas_feria` y `costos_feria` de Supabase o las dejamos por si querés volver a tracking detallado más adelante?
