// Operaciones de lectura sobre Google Sheets.
// Todas las funciones leen del spreadsheet activo donde está desplegado el script.

/**
 * Lee todas las filas de una hoja y las devuelve como array de objetos.
 * Usa arrayToObjectsByHeader() de utils.gs.
 *
 * @param {string} sheetName - Nombre exacto de la pestaña (ver CONFIG.sheets)
 * @returns {Object[]} Array de objetos; vacío si la hoja no existe o no tiene datos
 */
function getSheetRows(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    log('ERROR: Hoja no encontrada: "' + sheetName + '"');
    return [];
  }

  var data = sheet.getDataRange().getValues();
  var rows = arrayToObjectsByHeader(data);

  log('Hoja "' + sheetName + '": ' + rows.length + ' filas leídas');
  return rows;
}

/**
 * Lee las tres hojas de fuente y devuelve sus filas.
 * Punto de entrada único para el consolidador.
 *
 * @returns {{ pim: Object[], vtex: Object[], tms: Object[] }}
 */
function readAllSources() {
  return {
    pim:  getSheetRows(CONFIG.sheets.pim),
    vtex: getSheetRows(CONFIG.sheets.vtex),
    tms:  getSheetRows(CONFIG.sheets.tms)
  };
}
