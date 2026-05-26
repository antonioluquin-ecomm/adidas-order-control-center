# Reglas Operativas

> Última revisión: 2026-05-26
> El orden de las filas importa: el motor aplica la primera regla que coincide.
> "—" significa "no importa" (cualquier valor, incluido sin registro).

## Actores

| Responsable | Quién es | Qué sistemas toca |
|---|---|---|
| **Equipo PIM** | Agente interno de PIM | Estado de pedido + Estado logístico en PIM |
| **Ambos equipos** | Equipo PIM + Equipo VTEX coordinan | PIM y VTEX en paralelo |
| **Adidas** | Equipo externo Adidas | Carga en sus sistemas → llega vía integración a VTEX |

> En VTEX se actualizan: estado de pedido + factura + estado Entregado (Delivered).
> En PIM se actualizan: estado de pedido + estado logístico.

---

## Tabla de reglas

| # | PIM | VTEX | Delivered | TMS | Acción | Responsable | Prioridad |
|---|---|---|---|---|---|---|---|
| 1 | ACTIVO | FACTURADO | TRUE | ENTREGADO | `ACTUALIZAR: PIM → Facturado + Entregado` | Equipo PIM | Alta |
| 2 | ACTIVO | FACTURADO | FALSE | ENTREGADO | `ACTUALIZAR: PIM → Facturado + Entregado · VTEX → Entregado` | Ambos equipos | Alta |
| 3 | ACTIVO | CANCELADO | — | — | `CERRAR: PIM → Baja` | Equipo PIM | Alta |
| 4 | ACTIVO | PAGAMENTO_APROBADO | — | ENTREGADO | `SOLICITAR: Factura + Estado Entregado` | Adidas | Media |
| 5 | ACTIVO | PAGAMENTO_APROBADO | — | NO_ENTREGADO | `CERRAR: PIM → Baja · VTEX → Cancelado` | Ambos equipos | Alta |
| 6 | ACTIVO | PAGAMENTO_APROBADO | — | — ¹ | `CONSULTAR: Estado para cierre del pedido` | Adidas | Media |
| 7 | COLA_FACTURACION | FACTURADO | TRUE | ENTREGADO | `ACTUALIZAR: PIM → Facturado + Entregado` | Equipo PIM | Alta |
| 8 | COLA_FACTURACION | FACTURADO | FALSE | ENTREGADO | `ACTUALIZAR: PIM → Facturado · VTEX → Entregado` | Ambos equipos | Alta |
| 9 | DESPACHADO | FACTURADO | TRUE | ENTREGADO | `ACTUALIZAR: PIM → Facturado + Entregado` | Equipo PIM | Alta |
| 10 | DESPACHADO | FACTURADO | FALSE | ENTREGADO | `SOLICITAR: Factura` | Adidas | Media |
| 11 | DESPACHADO | FACTURADO | — | NO_ENTREGADO | `CERRAR: PIM → Baja + No Entregado` | Equipo PIM | Alta |
| 12 | FACTURADO | FACTURADO | TRUE | EN_TRANSITO | `CONSULTAR: Por qué sigue En Tránsito` | Adidas | Media |
| 13 | FACTURADO | FACTURADO | FALSE | ENTREGADO | `SOLICITAR: Estado Entregado` | Adidas | Media |

¹ Regla 6 es catch-all: aplica cuando TMS no es ENTREGADO ni NO_ENTREGADO (cubre EN_TRANSITO, sin registro TMS, etc.)
