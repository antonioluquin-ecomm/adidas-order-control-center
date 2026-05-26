# Reglas Operativas

> Última revisión: 2026-05-26
> El orden de las filas importa: el motor aplica la primera regla que coincide.
> "—" significa "no importa" (cualquier valor, incluido sin registro).

| # | PIM | VTEX | Delivered | TMS | Acción sugerida | Responsable | Prioridad |
|---|---|---|---|---|---|---|---|
| 1 | ACTIVO | FACTURADO | TRUE | ENTREGADO | Pasar a 'Facturado' y 'Entregado' en PIM | Operaciones | Alta |
| 2 | ACTIVO | FACTURADO | FALSE | ENTREGADO | Pasar a 'Entregado' en VTEX + 'Facturado' y 'Entregado' en PIM | Operaciones | Alta |
| 3 | ACTIVO | CANCELADO | — | — | Pasar a Baja en PIM | Operaciones | Alta |
| 4 | ACTIVO | PAGAMENTO_APROBADO | — | ENTREGADO | Solicitar a Adidas factura y estado Entregado | Adidas | Media |
| 5 | ACTIVO | PAGAMENTO_APROBADO | — | NO_ENTREGADO | Baja en PIM + Cancelar pedido en VTEX | Operaciones | Alta |
| 6 | ACTIVO | PAGAMENTO_APROBADO | — | — ¹ | Consultar a Adidas estado para cierre del pedido | Adidas | Media |
| 7 | COLA_FACTURACION | FACTURADO | TRUE | ENTREGADO | Actualizar a Facturado y Entregado en PIM | Operaciones | Alta |
| 8 | COLA_FACTURACION | FACTURADO | FALSE | ENTREGADO | Actualizar a Facturado en PIM + Entregado en VTEX | Operaciones | Alta |
| 9 | DESPACHADO | FACTURADO | TRUE | ENTREGADO | Actualizar a Facturado y Entregado en PIM | Operaciones | Alta |
| 10 | DESPACHADO | FACTURADO | FALSE | ENTREGADO | Adidas debe enviar la factura | Adidas | Media |
| 11 | DESPACHADO | FACTURADO | — | NO_ENTREGADO | Pasar a Baja y No Entregado en PIM | Operaciones | Alta |
| 12 | FACTURADO | FACTURADO | TRUE | EN_TRANSITO | Consultar a Adidas por qué sigue En Tránsito | Adidas | Media |
| 13 | FACTURADO | FACTURADO | FALSE | ENTREGADO | Adidas debe enviar estado Entregado | Adidas | Media |

¹ Regla 6 es catch-all: aplica cuando TMS no es ENTREGADO ni NO_ENTREGADO (cubre EN_TRANSITO, sin registro TMS, u otro estado).
  El orden garantiza que las reglas 4 y 5 se evalúan primero para esa combinación PIM+VTEX.
