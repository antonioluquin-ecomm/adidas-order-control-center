// Lógica de filtros, búsqueda y conteo.
var App = window.App || {};

// initFilters se llama una sola vez al arrancar para no duplicar listeners.
App.initFilters = function () {
  var searchEl    = document.getElementById('search-input');
  var priorityEl  = document.getElementById('filter-priority');
  var respEl      = document.getElementById('filter-responsible');
  var pimEl       = document.getElementById('filter-pim');
  var vtexEl      = document.getElementById('filter-vtex');
  var deliveredEl = document.getElementById('filter-delivered');
  var tmsEl       = document.getElementById('filter-tms');
  var actionEl    = document.getElementById('filter-action');

  function onChange() {
    App.state.filters.search      = searchEl    ? searchEl.value.trim().toLowerCase() : '';
    App.state.filters.priority    = priorityEl  ? priorityEl.value  : '';
    App.state.filters.responsible = respEl      ? respEl.value      : '';
    App.state.filters.pim         = pimEl       ? pimEl.value       : '';
    App.state.filters.vtex        = vtexEl      ? vtexEl.value      : '';
    App.state.filters.delivered   = deliveredEl ? deliveredEl.value : '';
    App.state.filters.tms         = tmsEl       ? tmsEl.value       : '';
    App.state.filters.action      = actionEl    ? actionEl.value    : '';

    var filtered = App.applyFilters(App.state.orders, App.state.filters);
    App.renderTable(filtered);
    App.updateFilterCount(filtered.length, App.state.orders.length);
    App.updateResetButton();
    // Re-render chips para reflejar si la acción activa cambió desde el select
    if (App._lastMeta && App._lastMeta.byAction) App.renderActionChips(App._lastMeta.byAction);
  }

  // Expuesto para que los chips del dashboard puedan triggear el filtro
  App._onFilterChange = onChange;

  if (searchEl)    searchEl.addEventListener('input',    onChange);
  if (priorityEl)  priorityEl.addEventListener('change', onChange);
  if (respEl)      respEl.addEventListener('change',     onChange);
  if (pimEl)       pimEl.addEventListener('change',      onChange);
  if (vtexEl)      vtexEl.addEventListener('change',     onChange);
  if (deliveredEl) deliveredEl.addEventListener('change', onChange);
  if (tmsEl)       tmsEl.addEventListener('change',      onChange);
  if (actionEl)    actionEl.addEventListener('change',   onChange);
};

App.applyFilters = function (orders, criteria) {
  return orders.filter(function (o) {
    if (criteria.priority    && o.priority    !== criteria.priority)    return false;
    if (criteria.responsible && o.responsible !== criteria.responsible) return false;
    if (criteria.search      && o.orderId.toLowerCase().indexOf(criteria.search) === -1) return false;
    if (criteria.pim  && (o.pim  ? o.pim.status  : '') !== criteria.pim)  return false;
    if (criteria.vtex && (o.vtex ? o.vtex.status : '') !== criteria.vtex) return false;
    if (criteria.tms  && (o.tms  ? o.tms.status  : '') !== criteria.tms)  return false;
    if (criteria.delivered !== '' && criteria.delivered !== undefined) {
      if ((o.vtex ? String(o.vtex.delivered) : '') !== criteria.delivered) return false;
    }
    if (criteria.action && o.action !== criteria.action) return false;
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
