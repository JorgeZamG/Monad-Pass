# Inicio de diseño de página — Web3 Ticketing Platform

Este documento aterriza los specs funcionales en un diseño visual inicial para arrancar el frontend.

## 1) Objetivo de la primera iteración

Construir una **Home usable** que permita:

1. Conectar wallet.
2. Ver eventos activos en tarjetas.
3. Navegar a detalle de evento.
4. Entender claramente los dos roles (Organizador / Asistente).

> Alcance de esta fase: UI y estructura; sin cerrar aún detalles finos de estado vacío, loading y errores.

---

## 2) Arquitectura de experiencia (MVP)

### Rutas iniciales a diseñar primero

- `/` → Home (listado de eventos).
- `/event/[address]` → Vista pública del evento.
- `/my-tickets` → Mis tickets.
- `/create` → Crear evento.

### Flujo rápido por rol

- **Asistente**: Home → Event Detail → Buy Ticket → My Tickets (QR).
- **Organizador**: Home → Create Event / Manage Event (ventas + check-in).

---

## 3) Layout base (desktop-first, responsive)

## Header

- Izquierda: logo + nombre del proyecto.
- Centro: navegación (`Eventos`, `Mis tickets`, `Crear evento`).
- Derecha: `ConnectButton` de RainbowKit.

## Main (Home)

1. **Hero corto**
   - Título: propuesta de valor.
   - Subtítulo: compra de tickets NFT y check-in on-chain.
   - CTA principal: “Explorar eventos”.
   - CTA secundaria: “Crear evento”.

2. **Bloque de filtros (fase 1 visual)**
   - Search input por nombre.
   - Chips: `Todos`, `Próximos`, `Agotados`.

3. **Grid de eventos**
   - 3 columnas en desktop.
   - 2 en tablet.
   - 1 en mobile.

4. **Footer simple**
   - Enlaces: docs, contrato factory, explorer Monad.

---

## 4) Diseño de componentes (v1)

## `EventCard`

Campos visibles:

- Banner (placeholder inicial).
- Nombre del evento.
- Fecha formateada (`date-fns`).
- Ubicación.
- Precio (MON).
- Supply vendido / total.
- Badge estado (`Activo`, `Agotado`, `Finalizado`).
- Botón “Ver evento”.

Estados del componente:

- Default.
- Hover (elevación + borde destacado).
- Disabled (si evento no activo).

## `TicketCard`

- Nombre del evento.
- Token ID.
- Estado check-in.
- Botón “Ver QR”.

## `CreateEventForm`

Secciones visuales:

1. Información general (nombre, descripción).
2. Logística (fecha, ubicación).
3. Economía (precio, supply).
4. Media/metadata (upload a Pinata).
5. Confirmación + submit.

---

## 5) Guía visual (design tokens iniciales)

## Colores

- Fondo app: `#0B1020`.
- Surface card: `#121A2F`.
- Primario: `#6D5EF4`.
- Secundario: `#22D3EE`.
- Éxito: `#10B981`.
- Error: `#EF4444`.
- Texto principal: `#E5E7EB`.
- Texto tenue: `#94A3B8`.

## Tipografía

- Headings: `Inter` semibold/bold.
- Body: `Inter` regular/medium.
- Escala: 12 / 14 / 16 / 20 / 24 / 32.

## Espaciado y bordes

- Sistema de spacing: múltiplos de 4 (`4, 8, 12, 16, 24, 32`).
- Radio: `12px` en cards y botones, `16px` en modales.
- Sombras suaves en hover.

---

## 6) Wireframe textual de Home

```txt
┌─────────────────────────────────────────────────────────────────────┐
│ Logo            Eventos   Mis tickets   Crear evento    [Connect]  │
├─────────────────────────────────────────────────────────────────────┤
│  Descubre eventos tokenizados en Monad                              │
│  Compra tickets NFT, valida acceso con QR y gestiona check-in       │
│  [Explorar eventos] [Crear evento]                                  │
├─────────────────────────────────────────────────────────────────────┤
│ [Buscar evento...]   [Todos] [Próximos] [Agotados]                  │
├─────────────────────────────────────────────────────────────────────┤
│ [Card] [Card] [Card]                                                 │
│ [Card] [Card] [Card]                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Footer: docs · factory · explorer                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7) Plan de implementación recomendado (siguiente paso)

1. Inicializar app Next.js con Tailwind + providers Web3.
2. Implementar layout global (`src/app/layout.tsx`) con header/footer base.
3. Crear `EventCard` estático con mock data.
4. Maquetar `src/app/page.tsx` consumiendo ese mock.
5. Agregar estados empty/loading/skeleton.
6. Conectar lectura real a `TicketFactory`.

---

## 8) Checklist de entrega de la fase de diseño

- [x] Layout base definido.
- [x] Componentes principales definidos.
- [x] Paleta y tokens iniciales definidos.
- [x] Wireframe textual de Home.
- [ ] Mock de alta fidelidad (Figma).
- [ ] Implementación del Home en Next.js.

- Prototipo visual inicial disponible en `docs/frontend/prototypes/home.html` y `docs/frontend/prototypes/home.css`.
