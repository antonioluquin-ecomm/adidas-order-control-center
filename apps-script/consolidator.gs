// Consolida pedidos de PIM, VTEX y TMS en un array unificado.
// VTEX es la fuente primaria: se itera sobre sus filas y se buscan
// las contrapartes en PIM y TMS por orderId.
// Si un pedido no tiene registro en PIM o TMS, esa fuente queda como null.

/**
 * Punto de entrada principal.
 * @param {Object[]} pimRows  - Filas de Export PIM (de sheets.gs)
 * @param {Object[]} vtexRows - Filas de Export Vtex (de sheets.gs)
 * @param {Object[]} tmsRows  - Filas de Export TMS (de sheets.gs)
 * @returns {Object[]} Array de pedidos consolidados con estados normalizados
 */
function consolidateOrders(pimRows, vtexRows, tmsRows) {
  var pimIndex = buildIndex(pimRows,  CONFIG.columns.pim.orderId);
  var tmsIndex = buildIndex(tmsRows,  CONFIG.columns.tms.orderId);

  var result = [];

  for (var i = 0; i < vtexRows.length; i++) {
    var vtexRow = vtexRows[i];
    var orderId  = String(vtexRow[CONFIG.columns.vtex.orderId] || '').trim();

    if (!orderId) continue;

    var pimRow = pimIndex[orderId] || null;
    var tmsRow = tmsIndex[orderId] || null;

    result.push({
      orderId: orderId,

      pim: pimRow ? {
        status: normalizePimStatus(String(pimRow[CONFIG.columns.pim.status] || ''))
      } : null,

      vtex: {
        status:    normalizeVtexStatus(String(vtexRow[CONFIG.columns.vtex.status] || '')),
        delivered: normalizeVtexDelivered(vtexRow[CONFIG.columns.vtex.delivered])
      },

      tms: tmsRow ? {
        status: normalizeTmsStatus(String(tmsRow[CONFIG.columns.tms.status] || ''))
      } : null,

      // Rellenados por rules-engine.gs en el paso siguiente
      action:      null,
      responsible: null,
      priority:    null
    });
  }

  log('Consolidados: ' + result.length + ' pedidos (' +
      'sin PIM: '  + result.filter(function(o) { return !o.pim; }).length  + ', ' +
      'sin TMS: '  + result.filter(function(o) { return !o.tms; }).length  + ')');

  return result;
}

/**
 * Construye un índice { orderId → fila } a partir de un array de filas.
 * Si hay orderIds duplicados, conserva la primera aparición y loguea el conflicto.
 * (Caso posible en PIM cuando un pedido tiene múltiples SKUs.)
 *
 * @param {Object[]} rows      - Array de objetos fila
 * @param {string}   keyColumn - Nombre de la columna que actúa como clave
 * @returns {Object} Índice plano { key: row }
 */
function buildIndex(rows, keyColumn) {
  var index = {};
  for (var i = 0; i < rows.length; i++) {
    var key = String(rows[i][keyColumn] || '').trim();
    if (!key) continue;
    if (index[key]) {
      log('WARN: orderId duplicado en columna "' + keyColumn + '": ' + key + ' — se conserva la primera aparición');
      continue;
    }
    index[key] = rows[i];
  }
  return index;
}
