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

    var sources   = readAllSources();
    var allOrders = consolidateOrders(sources.pim, sources.vtex, sources.tms);
    applyRulesToAll(allOrders);

    // Solo se devuelven pedidos con acción pendiente — más liviano para caché y frontend
    var actionable = allOrders.filter(function (o) { return o.action !== null; });
    var meta       = buildMeta(allOrders, actionable, sources);

    var response = { orders: actionable, meta: meta };
    var json     = JSON.stringify(response);

    try {
      cache.put(CACHE_KEY, json, CACHE_TTL);
    } catch (cacheErr) {
      log('WARN: respuesta demasiado grande para caché (' + cacheErr.message + ')');
    }

    log('doGet OK — ' + actionable.length + ' con acción de ' + allOrders.length + ' totales');
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
 * Calcula totales para el meta del response.
 * total    → pedidos con acción (lo que ve el operador)
 * totalAll → universo completo del sistema (contexto)
 * sinAccion→ pedidos sin inconsistencia detectada
 *
 * @param {Object[]} allOrders  - todos los pedidos consolidados
 * @param {Object[]} actionable - solo los que tienen acción asignada
 * @param {{ pim: Object[], vtex: Object[], tms: Object[] }} sources
 * @returns {Object}
 */
function buildMeta(allOrders, actionable, sources) {
  var byPriority = { Alta: 0, Media: 0, Baja: 0 };
  var byAction   = {};

  for (var i = 0; i < actionable.length; i++) {
    var p = actionable[i].priority;
    var a = actionable[i].action;
    if (p && byPriority.hasOwnProperty(p)) byPriority[p]++;
    if (a) byAction[a] = (byAction[a] || 0) + 1;
  }

  return {
    total:      actionable.length,
    totalAll:   allOrders.length,
    sinAccion:  allOrders.length - actionable.length,
    byPriority: byPriority,
    byAction:   byAction,
    sources: {
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
