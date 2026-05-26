// Handler de la Web App. Orquesta el pipeline completo y responde JSON al frontend.
//
// Deploy: Ejecutar como "Yo" — Acceso: "Cualquier usuario"
// URL resultante → pegar en frontend/js/api.js (App.API_URL)

/**
 * Punto de entrada HTTP GET.
 * Pipeline: leer hojas → consolidar → aplicar reglas → responder JSON
 */
function doGet(e) {
  try {
    // 1. Leer las tres fuentes desde Google Sheets
    var sources = readAllSources();

    // 2. Consolidar pedidos por orderId (VTEX como fuente primaria)
    var orders = consolidateOrders(sources.pim, sources.vtex, sources.tms);

    // 3. Aplicar reglas operativas
    applyRulesToAll(orders);

    // 4. Calcular meta
    var meta = buildMeta(orders);

    log('doGet OK — ' + orders.length + ' pedidos devueltos');

    return jsonResponse({ orders: orders, meta: meta });

  } catch (err) {
    log('ERROR en doGet: ' + err.message);
    return jsonResponse({
      error:     true,
      message:   err.message || String(err),
      timestamp: new Date().toISOString()
    });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Calcula los totales de meta a partir del array de pedidos consolidados.
 * @param {Object[]} orders
 * @returns {Object}
 */
function buildMeta(orders) {
  var byPriority = { Alta: 0, Media: 0, Baja: 0 };

  for (var i = 0; i < orders.length; i++) {
    var p = orders[i].priority;
    if (p && byPriority.hasOwnProperty(p)) byPriority[p]++;
  }

  return {
    total:      orders.length,
    byPriority: byPriority,
    timestamp:  new Date().toISOString()
  };
}

/**
 * Serializa un objeto a JSON y lo devuelve como respuesta ContentService.
 * @param {Object} data
 * @returns {ContentService.TextOutput}
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
