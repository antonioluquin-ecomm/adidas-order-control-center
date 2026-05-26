# Normalización de Estados

> Valores verificados contra archivo "Adidas Order Control Center.xlsx" (2026-05-26).

## VTEX

| Original en export | Canónico | Notas |
|---|---|---|
| `Faturado` | `FACTURADO` | Valor observado en columna `Status` |
| `Facturado` | `FACTURADO` | Valor observado en `Status raw value (temporary)` |
| `Cancelado` | `CANCELADO` | Observado en ambas columnas |
| `invoiced` | `FACTURADO` | Valor raw de API VTEX (Etapa 4) |
| `canceled` | `CANCELADO` | Valor raw de API VTEX (Etapa 4) |
| `payment-approved` | `PAGAMENTO_APROBADO` | Valor raw de API VTEX (Etapa 4) |

> ⚠️ El campo `Delivered` viene como string con capitalización mixta (`True`/`false`).
> Se normaliza a booleano: `'True'` → `true`, cualquier otro valor → `false`.

## PIM

| Original en export | Canónico | Notas |
|---|---|---|
| `Activo` | `ACTIVO` | Observado en `Estado Actual` |
| `Facturado` | `FACTURADO` | Observado en `Estado Actual` |
| `Cola de facturación` | `COLA_FACTURACION` | No observado aún, según docs previos |
| `Despachado` | `DESPACHADO` | No observado aún, según docs previos |

## TMS

| Original en export | Canónico | Notas |
|---|---|---|
| `Entregado` | `ENTREGADO` | Observado en `Estado TMS` |
| `Entrega realizado (definitivo)` | `ENTREGADO` | Observado en `Estado Carrier` |
| `En Transito` | `EN_TRANSITO` | No observado aún, según docs previos |
| `In Transit` | `EN_TRANSITO` | Variante posible API TMS |
| `No Entregado` | `NO_ENTREGADO` | No observado aún, según docs previos |
| `Not Delivered` | `NO_ENTREGADO` | Variante posible API TMS |
