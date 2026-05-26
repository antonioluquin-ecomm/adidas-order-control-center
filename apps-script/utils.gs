// Funciones utilitarias compartidas entre módulos.

/**
 * Convierte la salida de sheet.getDataRange().getValues() a un array de objetos.
 * La primera fila se trata como headers; cada fila siguiente se convierte en objeto.
 * Las filas completamente vacías son descartadas.
 *
 * @param {Array[][]} data - Array 2D devuelto por getValues()
 * @returns {Object[]} Array de objetos con claves = nombre de columna
 */
function arrayToObjectsByHeader(data) {
  if (!data || data.length < 2) return [];

  var headers = data[0].map(function (h) {
    return String(h).trim();
  });

  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Descartar filas completamente vacías (frecuentes al final del rango)
    var isEmpty = row.every(function (cell) {
      return cell === '' || cell === null || cell === undefined;
    });
    if (isEmpty) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = (row[j] !== undefined && row[j] !== null) ? row[j] : '';
    }
    result.push(obj);
  }

  return result;
}

/**
 * Normaliza un valor a string limpio: convierte a String, aplica trim.
 * Devuelve '' si el valor es null/undefined.
 * Usar para leer valores de columna antes de comparar o indexar.
 * @param {*} val
 * @returns {string}
 */
function trimStr(val) {
  return String(val !== null && val !== undefined ? val : '').trim();
}

/**
 * Logger centralizado. Usar en lugar de Logger.log() directamente.
 * @param {string} message
 */
function log(message) {
  Logger.log('[OCC] ' + message);
}
