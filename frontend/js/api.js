// Comunicación con Google Apps Script Web App.
var App = window.App || {};

App.API_URL = 'https://script.google.com/macros/s/AKfycbzYzx3JoIFt-Lni6RQmWwT7HFaR_EJ9wiKwlmYsN3pP4USDkpzSOZ__8lrOkpbsTo7d/exec';

App.fetchOrders = function () {
  return fetch(App.API_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .catch(function (err) {
      console.error('[OCC] Error al cargar pedidos:', err);
      var el = document.getElementById('loading');
      if (el) el.textContent = 'Error al cargar los datos. Verificar la URL del Apps Script.';
      return { orders: [], meta: { total: 0, byPriority: {}, timestamp: '' } };
    });
};
