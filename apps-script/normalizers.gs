// Normalización de estados desde valores reales de cada fuente a valores canónicos.
// Referencia: docs/normalizacion-estados.md
// Valores verificados contra archivo "Adidas Order Control Center.xlsx" (2026-05-26).

function normalizePimStatus(raw) {
  var map = {
    'Activo':                  'ACTIVO',
    'ACTIVO':                  'ACTIVO',
    'Facturado':               'FACTURADO',
    'FACTURADO':               'FACTURADO',
    'Cola de facturacion':     'COLA_FACTURACION',
    'Cola de facturación':     'COLA_FACTURACION',
    'COLA DE FACTURACION':     'COLA_FACTURACION',
    'COLA DE FACTURACIÓN':     'COLA_FACTURACION',
    'Cola De Facturacion':     'COLA_FACTURACION',
    'Despachado':              'DESPACHADO',
    'DESPACHADO':              'DESPACHADO'
  };
  return map[raw] || String(raw).toUpperCase().replace(/\s+/g, '_');
}

function normalizeVtexStatus(raw) {
  var map = {
    // Valores observados en export real
    'Faturado':  'FACTURADO',
    'Facturado': 'FACTURADO',
    'Cancelado': 'CANCELADO',
    // Valores de la API VTEX (por si se incorpora en Etapa 4)
    'invoiced':          'FACTURADO',
    'canceled':          'CANCELADO',
    'payment-approved':  'PAGAMENTO_APROBADO'
  };
  return map[raw] || String(raw).toUpperCase().replace(/[\s-]+/g, '_');
}

// Normaliza el campo Delivered de VTEX (string 'True'/'false') a booleano.
function normalizeVtexDelivered(raw) {
  return String(raw).toLowerCase() === 'true';
}

function normalizeTmsStatus(raw) {
  var map = {
    'Entregado':                       'ENTREGADO',
    'Entrega realizado (definitivo)':  'ENTREGADO',
    'En Transito':                     'EN_TRANSITO',
    'In Transit':                      'EN_TRANSITO',
    'No Entregado':                    'NO_ENTREGADO',
    'Not Delivered':                   'NO_ENTREGADO'
  };
  return map[raw] || String(raw).toUpperCase().replace(/\s+/g, '_');
}
