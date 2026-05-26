// Configuración central: nombres de hojas y columnas por fuente.
// Columnas verificadas contra archivo "Adidas Order Control Center.xlsx" (2026-05-26).

var CONFIG = {
  sheets: {
    pim:     'Export PIM',
    vtex:    'Export Vtex',
    tms:     'Export TMS',
    control: 'Control_Acciones',  // creada por el Apps Script si no existe
    rules:   'Reglas_Estados'
  },
  columns: {
    // Clave de join entre los tres sistemas: mismo formato "XXXXXXXXXXXXXXXXX-01"
    pim: {
      orderId:      'Nro Pedido',    // ej: '1562126737111-01'  ← clave de join
      idInterno:    'ID Pedido',     // ej: '102153722'
      status:       'Estado Actual', // ej: 'Activo', 'Facturado'
      fechaPedido:  'Fecha Pedido',
      fechaFactura: 'Fecha Factura',
      producto:     'Producto',
      cantidad:     'Cantidad',
      precio:       'PrecioWEB'
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
