// Exportación de la tabla filtrada a CSV. (#4)
// Opera sobre el estado actual de filtros — exporta exactamente lo que se ve en pantalla.
var App = window.App || {};

App.exportCSV = function () {
  var orders = App.applyFilters(App.state.orders, App.state.filters);

  if (!orders || orders.length === 0) {
    alert('No hay pedidos para exportar con los filtros actuales.');
    return;
  }

  var headers = ['Order ID', 'PIM', 'VTEX', 'Entregado VTEX', 'TMS', 'Acción', 'Responsable', 'Prioridad'];

  var rows = orders.map(function (o) {
    return [
      o.orderId,
      o.pim  ? o.pim.status        : '',
      o.vtex ? o.vtex.status       : '',
      o.vtex ? (o.vtex.delivered ? 'Si' : 'No') : '',
      o.tms  ? o.tms.status        : '',
      o.action      || '',
      o.responsible || '',
      o.priority    || ''
    ].map(csvCell).join(',');
  });

  var csv  = [headers.join(',')].concat(rows).join('\r\n');
  var date = new Date().toISOString().slice(0, 10);
  var name = 'pedidos-' + date + '-' + orders.length + '.csv';

  // BOM para que Excel abra correctamente con UTF-8
  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function csvCell(value) {
  var str = String(value);
  // Escapar celdas con comas, comillas o saltos de línea
  if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
