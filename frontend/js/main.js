// Bootstrap de la aplicación.
var App = window.App || {};

App.state = {
  orders:  [],
  filters: {
    search: '', priority: '', responsible: '',
    pim: '', vtex: '', delivered: '', tms: '', action: ''
  }
};

// initFilters se llama una sola vez al arrancar para no duplicar listeners.
// load() puede llamarse N veces (refresh) sin re-registrar eventos.
App.init = function () {
  App.initFilters();
  App.renderGuide();
  App.load(false);
};

App.load = function (forceRefresh) {
  var loading = document.getElementById('loading');
  var btn     = document.getElementById('btn-refresh');

  if (loading) {
    loading.style.display = 'block';
    loading.classList.remove('loading-state--error');
    loading.classList.add('loading-state--spinner');
    loading.textContent = 'Cargando pedidos…';
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Actualizando…'; }

  App.fetchOrders(forceRefresh)
    .then(function (data) {
      App.state.orders = data.orders || [];
      App.renderDashboard(data.meta || {});
      App.populateActionFilter(data.meta ? data.meta.byAction || {} : {});
      var filtered = App.applyFilters(App.state.orders, App.state.filters);
      App.renderTable(filtered);
      App.updateFilterCount(filtered.length, App.state.orders.length);
      if (btn) { btn.disabled = false; btn.textContent = 'Actualizar datos'; }
    })
    .catch(function (err) {
      if (loading) {
        loading.classList.remove('loading-state--spinner');
        loading.classList.add('loading-state--error');
        loading.textContent = '⚠  ' + err.message;
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Reintentar'; }
    });
};

// Puebla el select de acciones con los valores reales del dataset.
App.populateActionFilter = function (byAction) {
  var el = document.getElementById('filter-action');
  if (!el) return;
  var current = el.value;
  el.innerHTML = '<option value="">Acción: todas</option>';
  Object.keys(byAction).sort().forEach(function (action) {
    var opt = document.createElement('option');
    opt.value       = action;
    opt.textContent = action + '  (' + byAction[action] + ')';
    el.appendChild(opt);
  });
  if (current) el.value = current; // mantener selección tras refresh
};

// ── Guía de acciones ────────────────────────────────────────────────────────

var GUIDE_CONTENT = [
  {
    verb: 'ACTUALIZAR',
    color: '#1565c0',
    items: [
      {
        action: 'ACTUALIZAR: PIM → Facturado + Entregado',
        cuando: 'PIM sigue Activo/Despachado pero VTEX y TMS confirman que está entregado y Delivered=Sí.',
        pasos:  ['Abrir PIM → buscar el pedido por Order ID', 'Estado pedido → Facturado', 'Estado logístico → Entregado']
      },
      {
        action: 'ACTUALIZAR: PIM → Facturado + Entregado · VTEX → Entregado',
        cuando: 'PIM sigue Activo pero VTEX facturado y TMS entregado. VTEX aún no marcó Delivered.',
        pasos:  ['En PIM: Estado pedido → Facturado', 'En PIM: Estado logístico → Entregado', 'En VTEX: campo Delivered → True']
      },
      {
        action: 'ACTUALIZAR: PIM → Facturado · VTEX → Entregado',
        cuando: 'PIM en Cola de Facturación, TMS confirma entrega pero VTEX no tiene Delivered.',
        pasos:  ['En PIM: Estado pedido → Facturado', 'En VTEX: campo Delivered → True']
      }
    ]
  },
  {
    verb: 'CERRAR',
    color: '#c62828',
    items: [
      {
        action: 'CERRAR: PIM → Baja',
        cuando: 'El pedido fue cancelado en VTEX. Solo aplica cuando el pedido en PIM está en estado Activo.',
        pasos:  ['Pasar a Equipo PIM para dar de Baja']
      },
      {
        action: 'CERRAR: PIM → Baja + No Entregado',
        cuando: 'El pedido fue despachado en PIM pero TMS confirma que no se pudo entregar.',
        pasos:  ['Pasar a Equipo PIM para actualizar el pedido: Estado pedido → Baja, o Estado pedido → Facturado con Estado logístico → No Entregado']
      },
      {
        action: 'CERRAR: PIM → Baja · VTEX → Cancelado',
        cuando: 'TMS confirma no entrega. Hay que cerrar en ambos sistemas.',
        pasos:  ['En PIM: Estado pedido → Baja', 'En VTEX: cancelar el pedido']
      }
    ]
  },
  {
    verb: 'SOLICITAR',
    color: '#e65100',
    items: [
      {
        action: 'SOLICITAR: Factura + Estado Entregado',
        cuando: 'PIM activo, TMS entregado pero VTEX sin factura ni Delivered. Adidas debe enviar ambos.',
        pasos:  ['Contactar a Adidas (canal habitual)', 'Solicitar: emisión de factura para el pedido', 'Solicitar: actualización de estado a Entregado en VTEX (vía integración)']
      },
      {
        action: 'SOLICITAR: Factura',
        cuando: 'Pedido entregado confirmado, falta la factura de Adidas.',
        pasos:  ['Contactar a Adidas', 'Solicitar que envíen la factura vía integración a nuestro VTEX']
      },
      {
        action: 'SOLICITAR: Estado Entregado',
        cuando: 'VTEX y PIM facturados, TMS entregado, pero VTEX Delivered=No. Adidas debe actualizar.',
        pasos:  ['Contactar a Adidas', 'Solicitar: actualización Delivered → True en VTEX']
      }
    ]
  },
  {
    verb: 'CONSULTAR',
    color: '#6a1b9a',
    items: [
      {
        action: 'CONSULTAR: Estado para cierre del pedido',
        cuando: 'Pago aprobado en VTEX pero TMS en estado desconocido. No se puede cerrar sin información.',
        pasos:  ['Contactar a Adidas', 'Consultar estado actual del pedido en TMS', 'Según respuesta: ejecutar acción SOLICITAR o CERRAR']
      },
      {
        action: 'CONSULTAR: Por qué sigue En Tránsito',
        cuando: 'VTEX y PIM marcan como entregado pero TMS sigue En Tránsito. Posible desincronización.',
        pasos:  ['Contactar a Adidas', 'Consultar por qué TMS muestra En Tránsito si VTEX ya marcó Delivered', 'Solicitar corrección del estado en TMS']
      }
    ]
  },
  {
    verb: 'ALERTA',
    color: '#7d5a00',
    items: [
      {
        action: 'ALERTA: Pedido facturado sin registro en PIM',
        cuando: 'El pedido está Facturado en VTEX pero no tiene fila en el export PIM. Brecha de trazabilidad.',
        pasos:  ['Verificar si el Order ID corresponde a este seller', 'Si corresponde: buscar en PIM manualmente y crear registro si falta', 'Si no corresponde o es error de datos: escalar a soporte técnico']
      },
      {
        action: 'ALERTA: Pedido activo sin registro en PIM',
        cuando: 'Pago aprobado en VTEX pero el pedido no aparece en PIM. El cliente pagó y no hay seguimiento.',
        pasos:  ['URGENTE: verificar si el Order ID corresponde a este seller', 'Si corresponde: crear registro en PIM inmediatamente', 'Si no corresponde: escalar a soporte técnico']
      }
    ]
  }
];

App.renderGuide = function () {
  var body = document.getElementById('guide-body');
  if (!body) return;

  var html = '';
  GUIDE_CONTENT.forEach(function (section) {
    html += '<div class="guide-section">';
    html += '<div class="guide-verb" style="border-color:' + section.color + ';color:' + section.color + '">' + section.verb + '</div>';
    section.items.forEach(function (item) {
      html += '<div class="guide-item">';
      html += '<div class="guide-action-name">' + item.action + '</div>';
      html += '<div class="guide-cuando"><strong>Cuándo:</strong> ' + item.cuando + '</div>';
      html += '<ol class="guide-pasos">';
      item.pasos.forEach(function (paso) {
        html += '<li>' + paso + '</li>';
      });
      html += '</ol>';
      html += '</div>';
    });
    html += '</div>';
  });

  body.innerHTML = html;
};

App.openGuide = function () {
  document.getElementById('guide-overlay').style.display = 'flex';
};

App.closeGuide = function () {
  document.getElementById('guide-overlay').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', App.init);
