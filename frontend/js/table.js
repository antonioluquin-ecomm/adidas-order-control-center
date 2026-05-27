// Renderizado de la tabla operativa de pedidos.
var App = window.App || {};

App.renderTable = function (orders) {
  var loading = document.getElementById('loading');
  var empty   = document.getElementById('empty');
  var table   = document.getElementById('orders-table');
  var tbody   = document.getElementById('orders-tbody');

  loading.style.display = 'none';

  if (!orders || orders.length === 0) {
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';

  var html = '';
  for (var i = 0; i < orders.length; i++) {
    var o = orders[i];
    html += '<tr>';
    html += '<td class="col-orderid">' + o.orderId + '</td>';
    html += '<td class="col-date">' + (o.orderDate || '<span class="badge badge--null">—</span>') + '</td>';
    html += '<td>' + (o.pim ? App.statusBadge(o.pim.status) : '<span class="badge badge--sin-registro">SIN REG.</span>') + '</td>';
    html += '<td>' + App.statusBadge(o.vtex ? o.vtex.status       : null) + '</td>';
    html += '<td>' + App.deliveredBadge(o.vtex ? o.vtex.delivered : null) + '</td>';
    html += '<td>' + App.statusBadge(o.tms  ? o.tms.status        : null) + '</td>';
    html += '<td class="col-action">' + o.action + '</td>';
    html += '<td>' + App.responsibleBadge(o.responsible) + '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
};

// ─── Badge helpers ───────────────────────────────────────────────────────────

App.statusBadge = function (status) {
  if (!status) return '<span class="badge badge--null">—</span>';
  var cls = 'badge--' + status.toLowerCase().replace(/_/g, '-');
  return '<span class="badge ' + cls + '">' + status + '</span>';
};

App.deliveredBadge = function (delivered) {
  if (delivered === null || delivered === undefined)
    return '<span class="badge badge--null">—</span>';
  return delivered
    ? '<span class="badge badge--entregado">Sí</span>'
    : '<span class="badge badge--cancelado">No</span>';
};

App.responsibleBadge = function (responsible) {
  if (!responsible) return '<span class="badge badge--null">—</span>';
  var cls = {
    'Equipo PIM':    'badge--equipo-pim',
    'Ambos equipos': 'badge--ambos',
    'Adidas':        'badge--adidas'
  }[responsible] || 'badge--null';
  return '<span class="badge ' + cls + '">' + responsible + '</span>';
};

