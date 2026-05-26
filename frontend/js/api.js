// Comunicación con Google Apps Script Web App.
var App = window.App || {};

App.API_URL = ''; // TODO: reemplazar con la URL del Apps Script desplegado

App.fetchOrders = function () {
  // TODO: implementar fetch con manejo de error
  return Promise.resolve({ orders: [], meta: { total: 0, byPriority: {}, timestamp: '' } });
};
