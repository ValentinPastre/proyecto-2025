export function blobToFile(theBlob, fileName){
  return new File([theBlob], fileName, { type: theBlob.type });
}