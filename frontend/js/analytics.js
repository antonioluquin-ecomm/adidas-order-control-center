// Panel de analítica: tabs + gráficos CSS.
var App = window.App || {};

App._currentTab = 'operativo';

App.showTab = function (tab) {
  App._currentTab = tab;

  var views = {
    operativo:   document.getElementById('view-operativo'),
    analitica:   document.getElementById('view-analitica'),
    instructivo: document.getElementById('view-instructivo')
  };
  var tabs = {
    operativo:   document.getElementById('tab-operativo'),
    analitica:   document.getElementById('tab-analitica'),
    instructivo: document.getElementById('tab-instructivo')
  };

  Object.keys(views).forEach(function (key) {
    if (views[key]) views[key].style.display = key === tab ? (key === 'operativo' ? '' : 'block') : 'none';
    if (tabs[key])  tabs[key].classList.toggle('tab--active', key === tab);
  });

  if (tab === 'analitica') App.renderAnalytics();
};

App.renderAnalytics = function () {
  var el = document.getElementById('view-analitica');
  if (!el) return;
  var orders = App.state.orders;

  if (!orders || orders.length === 0) {
    el.innerHTML = '<div class="analytics-empty">Sin datos cargados — usá "Actualizar datos" primero.</div>';
    return;
  }

  el.innerHTML =
    '<div class="analytics-grid">' +
      App._chartByMonth(orders) +
      '<div class="analytics-row">' +
        App._chartByAction(orders) +
        App._chartByResponsible(orders) +
      '</div>' +
      App._chartByStatus(orders) +
    '</div>';
};

// ─── Pedidos por mes ──────────────────────────────────────────────────────────

App._chartByMonth = function (orders) {
  var MONTH_NAMES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var counts = {};
  orders.forEach(function (o) {
    var ym = App._parseOrderDateYM(o.orderDate);
    if (!ym) { counts['Sin fecha'] = (counts['Sin fecha'] || 0) + 1; return; }
    var key = ym.year + '-' + ('0' + ym.month).slice(-2);
    counts[key] = (counts[key] || 0) + 1;
  });

  var sorted = Object.keys(counts).filter(function (k) { return k !== 'Sin fecha'; }).sort();
  if (counts['Sin fecha']) sorted.push('Sin fecha');
  var max = Math.max.apply(null, sorted.map(function (k) { return counts[k]; })) || 1;

  var bars = sorted.map(function (k) {
    var pct   = Math.round(counts[k] / max * 100);
    var label = k === 'Sin fecha' ? 'Sin fecha' : (function () {
      var p = k.split('-');
      return MONTH_NAMES[parseInt(p[1], 10)] + ' ' + p[0];
    })();
    return '<div class="chart-bar">' +
      '<div class="chart-bar__label">' + label + '</div>' +
      '<div class="chart-bar__track"><div class="chart-bar__fill" style="width:' + pct + '%"></div></div>' +
      '<div class="chart-bar__value">' + counts[k] + '</div>' +
    '</div>';
  }).join('');

  return '<section class="analytics-card analytics-card--wide">' +
    '<h3 class="analytics-title">Pedidos con acción por mes' +
      '<span class="analytics-subtitle"> — fecha en PIM · ' + orders.length + ' pendientes en total</span>' +
    '</h3>' +
    '<div class="chart-bars">' + (bars || '<span class="analytics-note">Sin fechas disponibles en PIM</span>') + '</div>' +
  '</section>';
};

// ─── Por tipo de acción ───────────────────────────────────────────────────────

var _ACTION_COLORS = {
  ACTUALIZAR: '#1565c0',
  CERRAR:     '#c62828',
  SOLICITAR:  '#e65100',
  CONSULTAR:  '#6a1b9a',
  ALERTA:     '#7d5a00'
};

App._chartByAction = function (orders) {
  var counts = {};
  orders.forEach(function (o) {
    if (!o.action) return;
    var verb = o.action.split(':')[0].trim();
    counts[verb] = (counts[verb] || 0) + 1;
  });

  var total = orders.length || 1;
  var keys  = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  var max   = Math.max.apply(null, keys.map(function (k) { return counts[k]; })) || 1;

  var bars = keys.map(function (k) {
    var pct   = Math.round(counts[k] / max * 100);
    var color = _ACTION_COLORS[k] || '#546e7a';
    return '<div class="chart-bar">' +
      '<div class="chart-bar__label">' + k + '</div>' +
      '<div class="chart-bar__track"><div class="chart-bar__fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div class="chart-bar__value">' + counts[k] + '<span class="chart-pct"> ' + Math.round(counts[k] / total * 100) + '%</span></div>' +
    '</div>';
  }).join('');

  return '<section class="analytics-card">' +
    '<h3 class="analytics-title">Por acción</h3>' +
    '<div class="chart-bars">' + bars + '</div>' +
  '</section>';
};

// ─── Por responsable ──────────────────────────────────────────────────────────

App._chartByResponsible = function (orders) {
  var counts = { 'Equipo PIM': 0, 'Ambos equipos': 0, 'Adidas': 0 };
  orders.forEach(function (o) {
    if (o.responsible && counts.hasOwnProperty(o.responsible)) counts[o.responsible]++;
  });

  var total  = orders.length || 1;
  var max    = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; })) || 1;
  var COLORS = { 'Equipo PIM': '#283593', 'Ambos equipos': '#4527a0', 'Adidas': '#212121' };

  var bars = Object.keys(counts).map(function (k) {
    var pct   = Math.round(counts[k] / max * 100);
    var color = COLORS[k] || '#546e7a';
    return '<div class="chart-bar">' +
      '<div class="chart-bar__label">' + k + '</div>' +
      '<div class="chart-bar__track"><div class="chart-bar__fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div class="chart-bar__value">' + counts[k] + '<span class="chart-pct"> ' + Math.round(counts[k] / total * 100) + '%</span></div>' +
    '</div>';
  }).join('');

  return '<section class="analytics-card">' +
    '<h3 class="analytics-title">Por responsable</h3>' +
    '<div class="chart-bars">' + bars + '</div>' +
  '</section>';
};

// ─── Estados por sistema ──────────────────────────────────────────────────────

App._chartByStatus = function (orders) {
  var PIM_COLORS  = { ACTIVO: '#1565c0', FACTURADO: '#6a1b9a', COLA_FACTURACION: '#f57f17', DESPACHADO: '#00695c', 'SIN REG.': '#bdbdbd' };
  var VTEX_COLORS = { FACTURADO: '#6a1b9a', CANCELADO: '#c62828', PAGAMENTO_APROBADO: '#1b5e20', 'SIN REG.': '#bdbdbd' };
  var TMS_COLORS  = { ENTREGADO: '#2e7d32', EN_TRANSITO: '#f57f17', NO_ENTREGADO: '#bf360c', 'SIN REG.': '#bdbdbd' };

  function groupBy(fn) {
    var c = {};
    orders.forEach(function (o) { var k = fn(o); c[k] = (c[k] || 0) + 1; });
    return c;
  }

  function renderBars(counts, colorMap) {
    var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; })) || 1;
    return Object.keys(counts)
      .sort(function (a, b) { return counts[b] - counts[a]; })
      .map(function (k) {
        var pct   = Math.round(counts[k] / max * 100);
        var color = colorMap[k] || '#546e7a';
        return '<div class="chart-bar chart-bar--sm">' +
          '<div class="chart-bar__label">' + k.replace(/_/g, ' ') + '</div>' +
          '<div class="chart-bar__track"><div class="chart-bar__fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
          '<div class="chart-bar__value">' + counts[k] + '</div>' +
        '</div>';
      }).join('');
  }

  return '<div class="analytics-row analytics-row--3">' +
    '<section class="analytics-card"><h3 class="analytics-title">Estados PIM</h3><div class="chart-bars">'  + renderBars(groupBy(function (o) { return o.pim  ? o.pim.status  : 'SIN REG.'; }), PIM_COLORS)  + '</div></section>' +
    '<section class="analytics-card"><h3 class="analytics-title">Estados VTEX</h3><div class="chart-bars">' + renderBars(groupBy(function (o) { return o.vtex ? o.vtex.status : 'SIN REG.'; }), VTEX_COLORS) + '</div></section>' +
    '<section class="analytics-card"><h3 class="analytics-title">Estados TMS</h3><div class="chart-bars">'  + renderBars(groupBy(function (o) { return o.tms  ? o.tms.status  : 'SIN REG.'; }), TMS_COLORS)  + '</div></section>' +
  '</div>';
};
