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

    // Caché miss (o refresh forzado) — ejecutar pipeline completo
    log('doGet CACHE MISS — ejecutando pipeline');

    var sources = readAllSources();
    var orders  = consolidateOrders(sources.pim, sources.vtex, sources.tms);
    applyRulesToAll(orders);
    var meta    = buildMeta(orders);

    var response = { orders: orders, meta: meta };
    var json     = JSON.stringify(response);

    // Guardar en caché (límite 100 KB; si excede, se salta silenciosamente)
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

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
