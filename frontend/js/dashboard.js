// Renderizado de KPIs en el dashboard superior.
var App = window.App || {};

App.renderDashboard = function (meta) {
  var bp = meta.byPriority || {};

  document.getElementById('kpi-total').textContent = meta.total || 0;
  document.getElementById('kpi-alta').textContent  = bp.Alta   || 0;
  document.getElementById('kpi-media').textContent = bp.Media  || 0;

  var ts = meta.timestamp
    ? new Date(meta.timestamp).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
    : '—';
  document.getElementById('kpi-ts').textContent = ts;
};
