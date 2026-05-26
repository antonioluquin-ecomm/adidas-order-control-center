// Renderizado de KPIs, chips de acciones, indicador de caché y warnings de fuentes.
var App = window.App || {};

App.renderDashboard = function (meta) {
  var bp = meta.byPriority || {};

  // ── KPIs principales ──────────────────────────────────────────────────────
  document.getElementById('kpi-total').textContent   = meta.total    || 0;
  document.getElementById('kpi-sistema').textContent = meta.totalAll || 0;
  document.getElementById('kpi-alta').textContent    = bp.Alta       || 0;
  document.getElementById('kpi-media').textContent   = bp.Media      || 0;

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

// Chips de acción — clickeables para filtrar la tabla directamente.
App.renderActionChips = function (byAction) {
  var el = document.getElementById('action-chips');
  if (!el) return;

  var html    = '';
  var actions = Object.keys(byAction).filter(function (k) { return k !== 'Sin acción'; });

  actions.forEach(function (action) {
    var safe = action.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    html += '<span class="action-chip" onclick="App.filterByAction(\'' + safe + '\')" title="Filtrar por esta acción">' +
            '<span class="action-chip-label">' + action + '</span>' +
            '<span class="action-chip-count">'  + byAction[action] + '</span>' +
            '</span>';
  });

  el.innerHTML = html || '<span class="action-chip--empty">Sin acciones pendientes ✓</span>';
};

// Filtra la tabla por una acción específica al hacer clic en un chip.
App.filterByAction = function (action) {
  App.state.filters.action = action;
  var el = document.getElementById('filter-action');
  if (el) el.value = action;

  var filtered = App.applyFilters(App.state.orders, App.state.filters);
  App.renderTable(filtered);
  App.updateFilterCount(filtered.length, App.state.orders.length);

  // Scroll a la tabla para que el operador vea los resultados
  var tableContainer = document.getElementById('table-container');
  if (tableContainer) tableContainer.scrollIntoView({ behavior: 'smooth' });
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
