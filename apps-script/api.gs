// Handler de la Web App. Orquesta el pipeline completo y responde JSON al frontend.
//
// Deploy: Ejecutar como "Yo" — Acceso: "Cualquier usuario"
// URL resultante → pegar en frontend/js/api.js (App.API_URL)

var CACHE_KEY = 'occ_orders_v1';
var CACHE_TTL = 300; // segundos — 5 minutos

/**
 * Punto de entrada HTTP GET.
 * Parámetros opcionales:
 *   ?refresh=1  →  invalida el caché y recalcula (usar después de pegar exports nuevos)
 *
 * Pipeline: caché → leer hojas → consolidar → aplicar reglas → responder JSON
 */
function doGet(e) {
  try {
    var forceRefresh = e && e.parameter && e.parameter.refresh === '1';
    var cache        = CacheService.getScriptCache();

    // Intentar servir desde caché
    if (!forceRefresh) {
      var cached = cache.get(CACHE_KEY);
      if (cached) {
        log('doGet CACHE HIT');
        return jsonResponse(JSON.parse(cached));
      }
    }

    // Caché miss — ejecutar pipeline completo
    log('doGet CACHE MISS — ejecutando pipeline');

    var sources = readAllSources();                                    // #6 fuentes disponibles
    var orders  = consolidateOrders(sources.pim, sources.vtex, sources.tms);
    applyRulesToAll(orders);
    var meta    = buildMeta(orders, sources);                          // #2 #6 byAction + sources

    var response = { orders: orders, meta: meta };
    var json     = JSON.stringify(response);

    try {
      cache.put(CACHE_KEY, json, CACHE_TTL);
    } catch (cacheErr) {
      log('WARN: respuesta demasiado grande para caché (' + cacheErr.message + ')');
    }

    log('doGet OK — ' + orders.length + ' pedidos devueltos');
    return jsonResponse(response);

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
 * Calcula totales y desgloses para el meta del response.
 * #2 — agrega byAction para KPIs por tipo de acción
 * #6 — agrega sources para validación de fuentes vacías en el frontend
 *
 * @param {Object[]} orders
 * @param {{ pim: Object[], vtex: Object[], tms: Object[] }} sources
 * @returns {Object}
 */
function buildMeta(orders, sources) {
  var byPriority = { Alta: 0, Media: 0, Baja: 0 };
  var byAction   = {};

  for (var i = 0; i < orders.length; i++) {
    var p = orders[i].priority;
    var a = orders[i].action || 'Sin acción';
    if (p && byPriority.hasOwnProperty(p)) byPriority[p]++;
    byAction[a] = (byAction[a] || 0) + 1;
  }

  return {
    total:      orders.length,
    byPriority: byPriority,
    byAction:   byAction,                                              // #2
    sources: {                                                         // #6
      pim:  sources ? sources.pim.length  : null,
      vtex: sources ? sources.vtex.length : null,
      tms:  sources ? sources.tms.length  : null
    },
    timestamp:  new Date().toISOString()
  };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
