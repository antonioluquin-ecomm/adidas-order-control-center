# Estructura Google Sheets

> Columnas verificadas contra archivo "Adidas Order Control Center.xlsx" (2026-05-26).

## Hojas requeridas

### Export PIM

Base descargada desde PIM. **26 columnas.**

| Columna | Descripción | Ejemplo |
|---|---|---|
| `ID Pedido` | ID interno PIM | `102153722` |
| **`Nro Pedido`** | **Clave de join** — orderId | `1562126737111-01` |
| `Canal` | Canal de venta | `VT` |
| `Tienda` | Nombre de tienda | `Adidas Producteca` |
| `Fecha Pedido` | Fecha/hora del pedido | `2025-09-16 16:31:00` |
| `Fecha` | Días (numérico) | `9` |
| `Fecha Alta` | Fecha de alta | `2025-09-18 09:55:00` |
| `Depósito` | Código/nombre de depósito | `199. ARADIDAS` |
| `Región` | Provincia | `Provincia de Buenos Aires` |
| `Localidad` | Ciudad | `Martinez` |
| `Sku` | SKU del producto | `HS2069_205` |
| `Rubro` | Rubro | `VARIOS` |
| `Disciplina` | Disciplina | — |
| `Tipo` | Tipo | — |
| `Valor` | Valor | — |
| `Seccion` | Sección | — |
| `Proveedor` | Proveedor | — |
| `Producto` | Descripción del producto | `Shorts adidas Adicolor...` |
| `Cantidad` | Unidades | `1` |
| `PrecioPIM` | Precio en PIM | — |
| `PrecioWEB` | Precio web | `79999` |
| **`Estado Actual`** | **Estado operativo** | `Facturado`, `Activo` |
| `Fecha Resuelto` | Fecha de resolución | — |
| `Horas` | Tiempo en horas | `194` |
| `Pasos` | Cantidad de pasos | `5` |
| `Fecha Factura` | Fecha de facturación | `2025-09-26 12:43:00` |

### Export Vtex

Base descargada desde VTEX. **5 columnas.**

| Columna | Descripción | Ejemplo |
|---|---|---|
| **`Order`** | **Clave de join** — orderId | `1543406522858-01` |
| **`Status`** | **Estado VTEX** (display) | `Faturado`, `Cancelado` |
| **`Delivered`** | **Entregado** (string) | `True`, `false` |
| `Invoice Numbers` | Número de factura | `VTX_LQ_AAR1357451-1` |
| `Status raw value (temporary)` | Estado en español (temporal) | `Facturado`, `Cancelado` |

> ⚠️ `Delivered` viene como string con capitalización mixta (`True`/`false`). Se normaliza a booleano en `normalizers.gs`.
> ⚠️ `Status raw value (temporary)` es una columna temporal — puede desaparecer en futuros exports.

### Export TMS

Base descargada desde TMS Adidas. **24 columnas.**

| Columna | Descripción | Ejemplo |
|---|---|---|
| `Operacion` | Tipo de operación | `B2C` |
| `DN` | Delivery Note | `294709150` |
| `Purchase Order` | PO de VTEX | `VTX_LQ_AAR1331842` |
| `Invoice Number` | Número de factura | — |
| `Fecha Creacion` | Fecha de creación | `15/01/2025` |
| `Fecha Invoicing` | Fecha de facturación | `17/01/2025` |
| `Fecha Despacho` | Fecha de despacho | `17/01/2025` |
| `Fecha Salida de Cuenta` | — | — |
| `Fecha Estimada Entrega` | Entrega estimada | `26/01/2025` |
| `SoldTo Name` | Nombre del cliente | — |
| `CustAddress` | Dirección | `Huergo - 3156 - ...` |
| `Zona` | Ciudad | `COMODORO RIVADAVIA` |
| `Zip Code` | Código postal | `9000` |
| `Fecha Estado` | Fecha del último estado | `28/01/2025` |
| **`Estado TMS`** | **Estado logístico** | `Entregado` |
| `Carrier` | Transportista | `Urbano Express Argentina` |
| `Service Type` | Tipo de servicio | `Standard` |
| `Estado Carrier` | Estado detallado del carrier | `Entrega realizado (definitivo)` |
| `Guia` | Número de guía | `UR9002328087` |
| `Unidades` | Cantidad de unidades | `3` |
| `Peso` | Peso | `1` |
| `Promesa Lead Time` | Lead time prometido (días) | `8` |
| `Actual Lead Time` | Lead time real | `7,00` |
| **`Customer PO Number`** | **Clave de join** — orderId | `1503546042337-01` |

### Control_Acciones

Hoja generada automáticamente por el Apps Script con el resultado del análisis.
Debe crearse manualmente si no existe, o el Apps Script puede crearla en Etapa 1.

### Reglas_Estados

Configuración editable de reglas operativas. Ver `docs/reglas-estados.md`.
