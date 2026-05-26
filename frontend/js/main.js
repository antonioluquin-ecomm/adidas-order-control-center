// Bootstrap de la aplicación.
var App = window.App || {};

App.state = {
  orders:  [],
  filters: { search: '', priority: '', responsible: '' }
};

// initFilters se llama una sola vez al arrancar para no duplicar listeners.
// load() puede llamarse N veces (refresh) sin re-registrar eventos.
App.init = function () {
  App.initFilters();
  App.load(false);
};

App.load = function (forceRefresh) {
  var loading = document.getElementById('loading');
  var btn     = document.getElementById('btn-refresh');

  if (loading) { loading.style.display = 'block'; loading.classList.add('loading-state--spinner'); }
  if (btn)     { btn.disabled = true; btn.textContent = 'Actualizando…'; }

  App.fetchOrders(forceRefresh).then(function (data) {
    App.state.orders = data.orders || [];
    App.renderDashboard(data.meta || {});

    var filtered = App.applyFilters(App.state.orders, App.state.filters);
    App.renderTable(filtered);
    App.updateFilterCount(filtered.length, App.state.orders.length);

    if (btn) { btn.disabled = false; btn.textContent = 'Actualizar datos'; }
  });
};

document.addEventListener('DOMContentLoaded', App.init);
