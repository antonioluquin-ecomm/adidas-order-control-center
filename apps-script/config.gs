// Configuración central: nombres de hojas y columnas por fuente.
// Columnas PIM verificadas contra Google Sheet (2026-05-26, encabezados definitivos).

var CONFIG = {
  sheets: {
    pim:     'Export PIM',
    vtex:    'Export Vtex',
    tms:     'Export TMS',
    control: 'Control_Acciones',
    rules:   'Reglas_Estados'
  },
  columns: {
    // Clave de join entre los tres sistemas: mismo formato "XXXXXXXXXXXXXXXXX-01"
    pim: {
      // ── Identificadores ──────────────────────────────────────────────────
      orderId:       'Nro Pedido',      // ej: '1562126737111-01' ← clave de join
      idInterno:     'ID Pedido',       // ej: '102153722'

      // ── Canal y tienda ───────────────────────────────────────────────────
      canal:         'Canal',
      tienda:        'Tienda',

      // ── Fechas ───────────────────────────────────────────────────────────
      fechaPedido:   'Fecha Pedido',
      fechaAlta:     'Fecha Alta',
      fechaFactura:  'Fecha Factura',
      fechaResuelto: 'Fecha Resuelto',

      // ── Logística ────────────────────────────────────────────────────────
      deposito:      'Depósito',
      region:        'Región',
      localidad:     'Localidad',

      // ── Producto ─────────────────────────────────────────────────────────
      sku:           'Sku',
      rubro:         'Rubro',
      disciplina:    'Disciplina',
      tipo:          'Tipo',
      seccion:       'Seccion',
      proveedor:     'Proveedor',
      producto:      'Producto',
      cantidad:      'Cantidad',
      valor:         'Valor',
      precioPim:     'PrecioPIM',
      precioWeb:     'PrecioWEB',

      // ── Estado operativo ─────────────────────────────────────────────────
      status:        'Estado Actual',   // ej: 'Activo', 'Facturado' ← usado en reglas
      horas:         'Horas',
      pasos:         'Pasos'
    },
    vtex: {
      orderId:      'Order',         // ej: '1543406522858-01'  ← clave de join
      status:       'Status',        // ej: 'Faturado', 'Cancelado'
      delivered:    'Delivered',     // string: 'True' | 'false'
      invoiceNum:   'Invoice Numbers'
    },
    tms: {
      orderId:       'Customer PO Number', // ej: '1503546042337-01'  ← clave de join
      dn:            'DN',
      purchaseOrder: 'Purchase Order',     // ej: 'VTX_LQ_AAR1331842'
      status:        'Estado TMS',         // ej: 'Entregado'
      statusCarrier: 'Estado Carrier',
      carrier:       'Carrier',
      fechaEstado:   'Fecha Estado',
      guia:          'Guia'
    }
  }
};
