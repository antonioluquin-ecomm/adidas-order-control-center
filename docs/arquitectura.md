# Arquitectura

## Frontend

- HTML + CSS + JavaScript Vanilla
- Sin frameworks ni bundlers
- Namespace global: `window.App` (patrón de módulo simple)
- Servido como archivo estático o desde servidor HTTP básico

## Backend

- Google Apps Script (`.gs`)
- Google Sheets como base de datos operativa
- Desplegado como Web App (`doGet` → JSON)

## Flujo de datos

```
Google Sheets (hojas: Export PIM / Export Vtex / Export TMS)
        ↓
  Apps Script
  sheets.gs       → lee filas por hoja
  consolidator.gs → join por orderId
  normalizers.gs  → normaliza estados
  rules-engine.gs → aplica reglas operativas
        ↓
  api.gs: doGet → JSON
        ↓
  Frontend: App.fetchOrders()
        ↓
  dashboard.js + table.js + filters.js
```

## Contrato de API (Apps Script → Frontend)

`GET {APP_SCRIPT_URL}/exec`

```json
{
  "orders": [
    {
      "orderId":     "string",
      "pim":  { "status": "ACTIVO | FACTURADO | COLA_FACTURACION | DESPACHADO | null" },
      "vtex": { "status": "FACTURADO | CANCELADO | PAGAMENTO_APROBADO | null", "delivered": true },
      "tms":  { "status": "ENTREGADO | EN_TRANSITO | NO_ENTREGADO | null" },
      "action":      "string | null",
      "responsible": "Operaciones | Adidas | null",
      "priority":    "Alta | Media | Baja | null"
    }
  ],
  "meta": {
    "total": 0,
    "byPriority": { "Alta": 0, "Media": 0, "Baja": 0 },
    "timestamp":  "ISO-8601"
  }
}
```

## Restricciones de diseño (MVP)

- Sin dependencias externas (ni frontend ni backend)
- Sin base de datos externa — solo Google Sheets
- Sin autenticación en MVP (Apps Script con acceso público)
- Sin estado persistente en frontend — recalculado en cada carga (ver `docs/persistencia.md`)
- Sin historial ni comentarios en MVP
