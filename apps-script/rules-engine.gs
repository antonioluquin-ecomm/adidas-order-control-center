// Motor de reglas operativas.
// Las reglas están definidas en docs/reglas-estados.md — NO modificar aquí sin
// actualizar ese documento primero.
//
// Convención de valores en RULES:
//   null  →  "no importa" (equivale al guión "-" de la tabla de reglas)
//   valor →  debe coincidir exactamente con el estado canónico normalizado

var RULES = [
  {
    pim:         'ACTIVO',
    vtex:        'FACTURADO',
    delivered:   true,
    tms:         'ENTREGADO',
    action:      'Actualizar PIM',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  {
    pim:         'ACTIVO',
    vtex:        'CANCELADO',
    delivered:   null,           // no importa
    tms:         null,           // no importa
    action:      'Baja en PIM',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  {
    pim:         'ACTIVO',
    vtex:        'PAGAMENTO_APROBADO',
    delivered:   false,
    tms:         'NO_ENTREGADO',
    action:      'Baja PIM + Cancelar VTEX',
    responsible: 'Operaciones',
    priority:    'Alta'
  },
  {
    pim:         'FACTURADO',
    vtex:        'FACTURADO',
    delivered:   false,
    tms:         'ENTREGADO',
    action:      'Adidas debe enviar estado entregado',
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
  var pimStatus  = order.pim  ? order.pim.status        : null;
  var vtexStatus = order.vtex ? order.vtex.status       : null;
  var delivered  = order.vtex ? order.vtex.delivered    : null;
  var tmsStatus  = order.tms  ? order.tms.status        : null;

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

    if (result.priority === 'Alta')       counts.Alta++;
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
