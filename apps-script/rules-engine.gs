// Motor de reglas operativas.
// Las reglas están definidas en docs/reglas-estados.md — NO modificar aquí sin
// actualizar ese documento primero.
//
// Convención de valores en RULES:
//   null  →  "no importa" — equivale al "—" de la tabla de reglas
//   valor →  debe coincidir exactamente con el estado canónico normalizado
//
// IMPORTANTE: el orden del array importa — se aplica la primera regla que coincide.
// Las reglas catch-all (tms: null) deben ir DESPUÉS de las específicas
// para la misma combinación PIM+VTEX.

var RULES = [

  // ── PIM: ACTIVO ────────────────────────────────────────────────────────────

  // #1
  {
    pim: 'ACTIVO', vtex: 'FACTURADO', delivered: true, tms: 'ENTREGADO',
    action:      "Pasar a 'Facturado' y 'Entregado' en PIM",
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  // #2
  {
    pim: 'ACTIVO', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      "Pasar a 'Entregado' en VTEX + 'Facturado' y 'Entregado' en PIM",
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  // #3
  {
    pim: 'ACTIVO', vtex: 'CANCELADO', delivered: null, tms: null,
    action:      'Pasar a Baja en PIM',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  // #4 — debe ir antes que #6 (catch-all de la misma combinación PIM+VTEX)
  {
    pim: 'ACTIVO', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: 'ENTREGADO',
    action:      'Solicitar a Adidas factura y estado Entregado',
    responsible: 'Adidas',
    priority:    'Media'
  },
  // #5 — debe ir antes que #6
  {
    pim: 'ACTIVO', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: 'NO_ENTREGADO',
    action:      'Baja en PIM + Cancelar pedido en VTEX',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  // #6 — catch-all: aplica cuando TMS no es ENTREGADO ni NO_ENTREGADO (EN_TRANSITO, sin TMS, etc.)
  {
    pim: 'ACTIVO', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: null,
    action:      'Consultar a Adidas estado para cierre del pedido',
    responsible: 'Adidas',
    priority:    'Media'
  },

  // ── PIM: COLA_FACTURACION ──────────────────────────────────────────────────

  // #7
  {
    pim: 'COLA_FACTURACION', vtex: 'FACTURADO', delivered: true, tms: 'ENTREGADO',
    action:      'Actualizar a Facturado y Entregado en PIM',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  // #8
  {
    pim: 'COLA_FACTURACION', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'Actualizar a Facturado en PIM + Entregado en VTEX',
    responsible: 'Operaciones',
    priority:    'Alta'
  },

  // ── PIM: DESPACHADO ────────────────────────────────────────────────────────

  // #9
  {
    pim: 'DESPACHADO', vtex: 'FACTURADO', delivered: true, tms: 'ENTREGADO',
    action:      'Actualizar a Facturado y Entregado en PIM',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  // #10
  {
    pim: 'DESPACHADO', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'Adidas debe enviar la factura',
    responsible: 'Adidas',
    priority:    'Media'
  },
  // #11
  {
    pim: 'DESPACHADO', vtex: 'FACTURADO', delivered: null, tms: 'NO_ENTREGADO',
    action:      'Pasar a Baja y No Entregado en PIM',
    responsible: 'Operaciones',
    priority:    'Alta'
  },

  // ── PIM: FACTURADO ─────────────────────────────────────────────────────────

  // #12
  {
    pim: 'FACTURADO', vtex: 'FACTURADO', delivered: true, tms: 'EN_TRANSITO',
    action:      'Consultar a Adidas por qué sigue En Tránsito',
    responsible: 'Adidas',
    priority:    'Media'
  },
  // #13
  {
    pim: 'FACTURADO', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'Adidas debe enviar estado Entregado',
    responsible: 'Adidas',
    priority:    'Media'
  }

];

/**
 * Evalúa un pedido consolidado contra todas las reglas y retorna
 * la primera que coincide, o nulls si ninguna aplica.
 *
 * @param {Object} order - Pedido consolidado de consolidator.gs
 * @returns {{ action: string|null, responsible: string|null, priority: string|null }}
 */
function applyRules(order) {
  var pimStatus  = order.pim  ? order.pim.status     : null;
  var vtexStatus = order.vtex ? order.vtex.status    : null;
  var delivered  = order.vtex ? order.vtex.delivered : null;
  var tmsStatus  = order.tms  ? order.tms.status     : null;

  for (var i = 0; i < RULES.length; i++) {
    var r = RULES[i];

    var match =
      (r.pim       === null || r.pim       === pimStatus)  &&
      (r.vtex      === null || r.vtex      === vtexStatus) &&
      (r.delivered === null || r.delivered === delivered)  &&
      (r.tms       === null || r.tms       === tmsStatus);

    if (match) {
      return { action: r.action, responsible: r.responsible, priority: r.priority };
    }
  }

  return { action: null, responsible: null, priority: null };
}

/**
 * Aplica las reglas a todos los pedidos consolidados (modifica el array in-place).
 * Loguea el conteo por prioridad para smoke test rápido.
 *
 * @param {Object[]} orders - Array de consolidator.gs
 * @returns {Object[]} El mismo array con action/responsible/priority rellenos
 */
function applyRulesToAll(orders) {
  var counts = { Alta: 0, Media: 0, Baja: 0, sin_accion: 0 };

  for (var i = 0; i < orders.length; i++) {
    var result = applyRules(orders[i]);
    orders[i].action      = result.action;
    orders[i].responsible = result.responsible;
    orders[i].priority    = result.priority;

    if      (result.priority === 'Alta')  counts.Alta++;
    else if (result.priority === 'Media') counts.Media++;
    else if (result.priority === 'Baja')  counts.Baja++;
    else                                  counts.sin_accion++;
  }

  log('Reglas aplicadas — Alta: ' + counts.Alta +
      ', Media: ' + counts.Media +
      ', Baja: '  + counts.Baja  +
      ', sin accion: ' + counts.sin_accion);

  return orders;
}
