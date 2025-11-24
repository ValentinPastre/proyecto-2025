/**
* Convierte un Blob en un objeto File compatible con FormData.
* @param {Blob} theBlob - Blob obtenido (ej. canvas.toBlob).
* @param {string} fileName - Nombre que se le asignará al File resultante.
* @returns {File} Instancia de File lista para enviarse por FormData.
*/
export function blobToFile(theBlob, fileName){
  return new File([theBlob], fileName, { type: theBlob.type });
}