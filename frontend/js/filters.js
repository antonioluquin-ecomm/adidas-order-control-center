// Lógica de filtros y búsqueda sobre el array de pedidos.
var App = window.App || {};

App.initFilters = function () {
  var searchEl   = document.getElementById('search-input');
  var priorityEl = document.getElementById('filter-priority');
  var respEl     = document.getElementById('filter-responsible');

  function onChange() {
    App.state.filters.search      = searchEl.value.trim().toLowerCase();
    App.state.filters.priority    = priorityEl.value;
    App.state.filters.responsible = respEl.value;

    var filtered = App.applyFilters(App.state.orders, App.state.filters);
    App.renderTable(filtered);
    App.updateFilterCount(filtered.length, App.state.orders.length);
  }

  searchEl.addEventListener('input',  onChange);
  priorityEl.addEventListener('change', onChange);
  respEl.addEventListener('change',     onChange);

  // Inicializar contador
  App.updateFilterCount(App.state.orders.length, App.state.orders.length);
};

App.applyFilters = function (orders, criteria) {
  return orders.filter(function (o) {
    if (criteria.priority    && o.priority    !== criteria.priority)    return false;
    if (criteria.responsible && o.responsible !== criteria.responsible) return false;
    if (criteria.search      && o.orderId.toLowerCase().indexOf(criteria.search) === -1) return false;
    return true;
  });
};

App.updateFilterCount = function (filtered, total) {
  var el = document.getElementById('filter-count');
  if (!el) return;
  el.textContent = filtered === total
    ? total + ' pedidos'
    : filtered + ' de ' + total + ' pedidos';
};
