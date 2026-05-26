// Renderizado de KPIs, chips de acciones, indicador de caché y warnings de fuentes.
var App = window.App || {};

App.renderDashboard = function (meta) {
  var bp = meta.byPriority || {};

  // ── KPIs principales ──────────────────────────────────────────────────────
  document.getElementById('kpi-total').textContent = meta.total || 0;
  document.getElementById('kpi-alta').textContent  = bp.Alta   || 0;
  document.getElementById('kpi-media').textContent = bp.Media  || 0;

  // #9 — Indicador de frescura de datos
  var tsEl = document.getElementById('kpi-ts');
  if (tsEl) {
    if (meta.timestamp) {
      var ageSec = Math.round((Date.now() - new Date(meta.timestamp).getTime()) / 1000);
      tsEl.textContent = ageSec < 60
        ? 'Datos en vivo'
        : 'Hace ' + Math.round(ageSec / 60) + ' min';
      tsEl.title = 'Calculado: ' + new Date(meta.timestamp).toLocaleString('es-AR');
    } else {
      tsEl.textContent = '—';
    }
  }

  // #2 — Chips por tipo de acción
  App.renderActionChips(meta.byAction || {});

  // #6 — Warnings de fuentes vacías
  App.renderSourceWarnings(meta.sources);
};

// #2 — Desglose de acciones en la segunda barra del dashboard
App.renderActionChips = function (byAction) {
  var el = document.getElementById('action-chips');
  if (!el) return;

  var html    = '';
  var actions = Object.keys(byAction).filter(function (k) { return k !== 'Sin acción'; });

  actions.forEach(function (action) {
    html += '<span class="action-chip">' +
            '<span class="action-chip-label">' + action + '</span>' +
            '<span class="action-chip-count">'  + byAction[action] + '</span>' +
            '</span>';
  });

  if (byAction['Sin acción']) {
    html += '<span class="action-chip action-chip--muted">' +
            '<span class="action-chip-label">Sin acción</span>' +
            '<span class="action-chip-count">' + byAction['Sin acción'] + '</span>' +
            '</span>';
  }

  el.innerHTML = html || '<span class="action-chip--empty">Sin acciones pendientes ✓</span>';
};

// #6 — Warning si alguna fuente tiene 0 filas
App.renderSourceWarnings = function (sources) {
  var el = document.getElementById('source-warnings');
  if (!el || !sources) return;

  var warnings = [];
  if (sources.pim  === 0) warnings.push('Export PIM vacío');
  if (sources.vtex === 0) warnings.push('Export Vtex vacío');
  if (sources.tms  === 0) warnings.push('Export TMS vacío');

  if (warnings.length === 0) { el.style.display = 'none'; return; }

  el.style.display = 'block';
  el.textContent   = '⚠  ' + warnings.join('  ·  ') +
                     '  —  verificar que las hojas tengan datos pegados antes de actualizar.';
};
