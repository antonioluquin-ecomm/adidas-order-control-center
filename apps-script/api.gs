// Handler de la Web App. Orquesta el pipeline completo y responde JSON al frontend.
//
// Deploy: Ejecutar como "Yo" — Acceso: "Cualquier usuario"
// URL resultante → pegar en frontend/js/api.js (App.API_URL)

var CACHE_KEY       = 'occ_orders_v3'; // bumpeado al agregar caché en chunks
var CACHE_TTL       = 300;             // segundos — 5 minutos
var CACHE_CHUNK_MAX = 90000;           // bytes — bajo el límite de 100 KB de CacheService

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

    // Intentar servir desde caché (soporta respuestas > 100 KB via chunks)
    if (!forceRefresh) {
      var cached = cacheGet(cache, CACHE_KEY);
      if (cached) {
        log('doGet CACHE HIT');
        return jsonResponse(cached);
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

    cachePut(cache, CACHE_KEY, response);

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

// ─── Caché en chunks ─────────────────────────────────────────────────────────
// CacheService limita a 100 KB por key. Dividimos el JSON en trozos de
// CACHE_CHUNK_MAX bytes y los guardamos bajo keys numeradas.

function cachePut(cache, key, data) {
  try {
    var json   = JSON.stringify(data);
    var chunks = [];
    for (var i = 0; i < json.length; i += CACHE_CHUNK_MAX) {
      chunks.push(json.substring(i, i + CACHE_CHUNK_MAX));
    }
    for (var j = 0; j < chunks.length; j++) {
      cache.put(key + '_' + j, chunks[j], CACHE_TTL);
    }
    cache.put(key + '_n', String(chunks.length), CACHE_TTL);
    log('Cache guardado en ' + chunks.length + ' chunk(s) (' + json.length + ' bytes)');
  } catch (e) {
    log('WARN: no se pudo guardar en caché — ' + e.message);
  }
}

function cacheGet(cache, key) {
  try {
    var nStr = cache.get(key + '_n');
    if (!nStr) return null;
    var n     = parseInt(nStr, 10);
    var parts = [];
    for (var i = 0; i < n; i++) {
      var part = cache.get(key + '_' + i);
      if (!part) return null; // algún chunk expiró — recalcular
      parts.push(part);
    }
    return JSON.parse(parts.join(''));
  } catch (e) {
    log('WARN: error leyendo caché — ' + e.message);
    return null;
  }
}
