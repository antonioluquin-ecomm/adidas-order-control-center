// Bootstrap de la aplicación.
var App = window.App || {};

App.state = {
  orders:  [],
  filters: { search: '', priority: '', responsible: '' }
};

App.init = function () {
  App.load(false);
};

App.load = function (forceRefresh) {
  var loading = document.getElementById('loading');
  var btn     = document.getElementById('btn-refresh');

  // Estado visual: cargando
  if (loading) { loading.style.display = 'block'; loading.classList.add('loading-state--spinner'); }
  if (btn)     { btn.disabled = true; btn.textContent = 'Actualizando…'; }

  App.fetchOrders(forceRefresh).then(function (data) {
    App.state.orders = data.orders || [];
    App.renderDashboard(data.meta  || {});
    App.renderTable(App.state.orders);
    App.initFilters();

    // Restaurar botón
    if (btn) { btn.disabled = false; btn.textContent = 'Actualizar datos'; }
  });
};

document.addEventListener('DOMContentLoaded', App.init);
