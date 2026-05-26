# Roadmap

## Etapa 1 — Backend Apps Script

**Objetivo:** Apps Script funcional que consolide pedidos y exponga una API JSON.

- [ ] Confirmar nombres exactos de columnas en exports PIM, VTEX y TMS (**bloqueante**)
- [ ] Implementar `config.gs`: constantes de hojas y columnas verificadas
- [ ] Implementar `utils.gs`: `arrayToObjectsByHeader` (Sheets 2D → objetos)
- [ ] Implementar `normalizers.gs`: normalización de estados por fuente
- [ ] Implementar `sheets.gs`: `getSheetRows` lee filas por nombre de hoja
- [ ] Implementar `consolidator.gs`: join de pedidos por `orderId`
- [ ] Implementar `rules-engine.gs`: aplicar reglas de `docs/reglas-estados.md`
- [ ] Implementar `api.gs`: `doGet` devuelve JSON consolidado completo
- [ ] Smoke test manual con un export real de cada fuente

**Entregable:** URL de Apps Script que devuelve JSON válido con pedidos consolidados.

---

## Etapa 2 — Frontend Dashboard

**Objetivo:** Interfaz operativa funcional consumiendo la API.

- [ ] `dashboard.js`: renderizar KPIs (total pedidos, conteo por prioridad)
- [ ] `table.js`: tabla con columnas orderId / PIM / VTEX / TMS / Acción / Responsable / Prioridad
- [ ] `filters.js`: filtros por estado, fuente, prioridad; búsqueda por ID de orden
- [ ] `main.css`: layout completo (dashboard fijo superior, tabla compacta, badges de color, filtros sticky)
- [ ] Conectar `App.API_URL` con URL real del Apps Script
- [ ] Smoke test visual con datos reales

**Entregable:** `index.html` operativo en navegador, cargando datos desde Sheets.

---

## Etapa 3 — Exportación y Auditoría

**Objetivo:** Funcionalidades de soporte operativo.

- [ ] Exportar tabla filtrada a CSV desde el frontend
- [ ] Escribir acciones resueltas en hoja `Control_Acciones` desde Apps Script
- [ ] UX avanzada: ordenamiento de columnas, paginación o scroll virtual
- [ ] Refinamiento visual para uso intensivo en pantalla

---

## Etapa 4 — Automatización y APIs

**Objetivo:** Integración directa con sistemas, sin exports manuales.

- [ ] Leer pedidos VTEX vía API directa (sin export manual)
- [ ] Acciones masivas desde la interfaz
- [ ] Historial de cambios por pedido
- [ ] Usuarios y roles básicos

---

## Decisiones pendientes

| Decisión | Estado | Bloquea |
|---|---|---|
| Nombres exactos de columnas en exports PIM, VTEX, TMS | Pendiente | Etapa 1 |
| URL del Apps Script desplegado | Pendiente | Etapa 2 |
| Reglas operativas completas (hoy solo 4 en `docs/reglas-estados.md`) | Pendiente | Etapa 1 |
