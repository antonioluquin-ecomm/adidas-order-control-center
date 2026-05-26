// Motor de reglas operativas.
// Las reglas están definidas en docs/reglas-estados.md — NO modificar aquí sin
// actualizar ese documento primero.
//
// Convención de valores en RULES:
//   null  →  "no importa" — equivale al "—" de la tabla de reglas
//   valor →  debe coincidir exactamente con el estado canónico normalizado
//
// Responsables:
//   'Equipo PIM'    → solo acciones en PIM (agente PIM cambia estado de pedido + estado logístico)
//   'Ambos equipos' → acciones en PIM y VTEX (ambos equipos deben coordinar)
//   'Adidas'        → Adidas carga en sus sistemas; llega vía integración a VTEX
//
// IMPORTANTE: el orden del array importa — se aplica la primera regla que coincide.

var RULES = [

  // ── PIM: ACTIVO ────────────────────────────────────────────────────────────

  // #1 — Solo PIM actualiza
  {
    pim: 'ACTIVO', vtex: 'FACTURADO', delivered: true, tms: 'ENTREGADO',
    action:      'ACTUALIZAR: PIM → Facturado + Entregado',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },
  // #2 — PIM actualiza + equipo VTEX actualiza Delivered
  {
    pim: 'ACTIVO', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'ACTUALIZAR: PIM → Facturado + Entregado · VTEX → Entregado',
    responsible: 'Ambos equipos',
    priority:    'Alta'
  },
  // #3 — Solo PIM da de baja
  {
    pim: 'ACTIVO', vtex: 'CANCELADO', delivered: null, tms: null,
    action:      'CERRAR: PIM → Baja',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },
  // #4 — Adidas debe enviarnos factura + estado entregado (impacta en VTEX vía integración)
  {
    pim: 'ACTIVO', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: 'ENTREGADO',
    action:      'SOLICITAR: Factura + Estado Entregado',
    responsible: 'Adidas',
    priority:    'Media'
  },
  // #5 — PIM da de baja + equipo VTEX cancela
  {
    pim: 'ACTIVO', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: 'NO_ENTREGADO',
    action:      'CERRAR: PIM → Baja · VTEX → Cancelado',
    responsible: 'Ambos equipos',
    priority:    'Alta'
  },
  // #6 — catch-all: TMS no es ENTREGADO ni NO_ENTREGADO (EN_TRANSITO, sin TMS, etc.)
  {
    pim: 'ACTIVO', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: null,
    action:      'CONSULTAR: Estado para cierre del pedido',
    responsible: 'Adidas',
    priority:    'Media'
  },

  // ── PIM: COLA_FACTURACION ──────────────────────────────────────────────────

  // #7 — Solo PIM actualiza
  {
    pim: 'COLA_FACTURACION', vtex: 'FACTURADO', delivered: true, tms: 'ENTREGADO',
    action:      'ACTUALIZAR: PIM → Facturado + Entregado',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },
  // #8 — PIM actualiza + equipo VTEX actualiza Delivered
  {
    pim: 'COLA_FACTURACION', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'ACTUALIZAR: PIM → Facturado · VTEX → Entregado',
    responsible: 'Ambos equipos',
    priority:    'Alta'
  },

  // ── PIM: DESPACHADO ────────────────────────────────────────────────────────

  // #9 — Solo PIM actualiza
  {
    pim: 'DESPACHADO', vtex: 'FACTURADO', delivered: true, tms: 'ENTREGADO',
    action:      'ACTUALIZAR: PIM → Facturado + Entregado',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },
  // #10 — Adidas debe enviarnos factura (pega en VTEX vía integración)
  {
    pim: 'DESPACHADO', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'SOLICITAR: Factura',
    responsible: 'Adidas',
    priority:    'Media'
  },
  // #11 — Solo PIM cierra con Baja + No Entregado (estado pedido + estado logístico)
  {
    pim: 'DESPACHADO', vtex: 'FACTURADO', delivered: null, tms: 'NO_ENTREGADO',
    action:      'CERRAR: PIM → Baja + No Entregado',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },

  // ── PIM: FACTURADO ─────────────────────────────────────────────────────────

  // #12 — Adidas debe investigar por qué sigue en tránsito
  {
    pim: 'FACTURADO', vtex: 'FACTURADO', delivered: true, tms: 'EN_TRANSITO',
    action:      'CONSULTAR: Por qué sigue En Tránsito',
    responsible: 'Adidas',
    priority:    'Media'
  },
  // #13 — Adidas debe enviar estado entregado (impacta en VTEX Delivered vía integración)
  {
    pim: 'FACTURADO', vtex: 'FACTURADO', delivered: false, tms: 'ENTREGADO',
    action:      'SOLICITAR: Estado Entregado',
    responsible: 'Adidas',
    priority:    'Media'
  },

  // ── COLA_FACTURACION: complemento ─────────────────────────────────────────

  // #14 — Espejo de regla #3: VTEX canceló mientras PIM estaba en cola
  {
    pim: 'COLA_FACTURACION', vtex: 'CANCELADO', delivered: null, tms: null,
    action:      'CERRAR: PIM → Baja',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },

  // ── PIM AUSENTE: pedidos en VTEX sin registro en PIM ──────────────────────
  // 'AUSENTE' es el valor que toma pimStatus cuando order.pim === null.
  // Las reglas anteriores usan pim: 'ACTIVO' etc. — nunca null — así que
  // estas reglas no colisionan con ninguna existente.

  // #15 — Facturado en VTEX sin tracking en PIM → brecha de trazabilidad
  {
    pim: 'AUSENTE', vtex: 'FACTURADO', delivered: null, tms: null,
    action:      'ALERTA: Pedido facturado sin registro en PIM',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  },
  // #16 — Pago aprobado en VTEX sin registro en PIM → orden activa sin seguimiento
  {
    pim: 'AUSENTE', vtex: 'PAGAMENTO_APROBADO', delivered: null, tms: null,
    action:      'ALERTA: Pedido activo sin registro en PIM',
    responsible: 'Equipo PIM',
    priority:    'Alta'
  }

];

/**
 * Evalúa un pedido consolidado contra todas las reglas y retorna
 * la primera que coincide, o nulls si ninguna aplica.
 */
function applyRules(order) {
  // 'AUSENTE' permite escribir reglas que matchean específicamente cuando
  // una fuente no tiene registro. null en la regla sigue siendo "no importa".
  var pimStatus  = order.pim  ? order.pim.status     : 'AUSENTE';
  var vtexStatus = order.vtex ? order.vtex.status    : 'AUSENTE';
  var delivered  = order.vtex ? order.vtex.delivered : null;
  var tmsStatus  = order.tms  ? order.tms.status     : 'AUSENTE';

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
