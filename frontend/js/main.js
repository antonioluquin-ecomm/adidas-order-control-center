// Bootstrap de la aplicación.
var App = window.App || {};

App.init = function () {
  App.fetchOrders().then(function (data) {
    App.renderDashboard(data.meta);
    App.renderTable(data.orders);
  });
};

document.addEventListener('DOMContentLoaded', App.init);
