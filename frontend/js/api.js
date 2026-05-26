// Comunicación con Google Apps Script Web App.
var App = window.App || {};

App.API_URL = 'https://script.google.com/macros/s/AKfycbzYzx3JoIFt-Lni6RQmWwT7HFaR_EJ9wiKwlmYsN3pP4USDkpzSOZ__8lrOkpbsTo7d/exec';

/**
 * Carga pedidos desde el Apps Script.
 * @param {boolean} forceRefresh - true para invalidar el caché del servidor
 */
App.fetchOrders = function (forceRefresh) {
  var url = App.API_URL + (forceRefresh ? '?refresh=1' : '');
  return fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .catch(function (err) {
      console.error('[OCC] Error al cargar pedidos:', err);
      var el = document.getElementById('loading');
      if (el) {
        el.classList.remove('loading-state--spinner');
        el.textContent = '⚠ Error al cargar los datos. Verificar la URL del Apps Script.';
      }
      return { orders: [], meta: { total: 0, byPriority: {}, timestamp: '' } };
    });
};
