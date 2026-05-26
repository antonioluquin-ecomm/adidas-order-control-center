// Handler de la Web App. Responde JSON consolidado al frontend.
// Desplegar como: Ejecutar como 'Yo', Acceso: 'Cualquier usuario'.

function doGet(e) {
  // TODO: implementar consolidación completa
  // 1. Leer hojas via sheets.gs
  // 2. Consolidar via consolidator.gs
  // 3. Aplicar reglas via rules-engine.gs
  // 4. Devolver JSON

  var response = {
    orders: [],
    meta: {
      total: 0,
      byPriority: { Alta: 0, Media: 0, Baja: 0 },
      timestamp: new Date().toISOString()
    }
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
