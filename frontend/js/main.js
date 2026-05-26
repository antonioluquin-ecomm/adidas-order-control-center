// Bootstrap de la aplicación.
var App = window.App || {};

App.state = {
  orders:  [],
  filters: { search: '', priority: '', responsible: '' }
};

App.init = function () {
  App.fetchOrders().then(function (data) {
    App.state.orders = data.orders || [];
    App.renderDashboard(data.meta  || {});
    App.renderTable(App.state.orders);
    App.initFilters();
  });
};

document.addEventListener('DOMContentLoaded', App.init);
