// Comunicación con Google Apps Script Web App.
var App = window.App || {};

App.API_URL     = 'https://script.google.com/macros/s/AKfycbzYzx3JoIFt-Lni6RQmWwT7HFaR_EJ9wiKwlmYsN3pP4USDkpzSOZ__8lrOkpbsTo7d/exec';
App.FETCH_TIMEOUT = 30000; // ms — Apps Script puede tardar en cold start

/**
 * Carga pedidos desde el Apps Script.
 * Lanza un Error en cualquier falla (red, timeout, error del servidor).
 * El caller (App.load) es responsable de mostrar el error al usuario.
 *
 * @param {boolean} forceRefresh - true para invalidar el caché del servidor
 * @returns {Promise<{orders: Object[], meta: Object}>}
 */
App.fetchOrders = function (forceRefresh) {
  var url        = App.API_URL + (forceRefresh ? '?refresh=1' : '');
  var controller = new AbortController();
  var timeoutId  = setTimeout(function () { controller.abort(); }, App.FETCH_TIMEOUT);

  return fetch(url, { signal: controller.signal })
    .then(function (res) {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      // Apps Script devuelve { error: true, message: '...' } cuando falla internamente
      if (data && data.error) throw new Error(data.message || 'Error en el servidor');
      return data;
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado (' + (App.FETCH_TIMEOUT / 1000) + ' s). Verificar que el Apps Script esté activo.');
      }
      throw err;
    });
};
