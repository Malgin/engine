export default class ModelLoader {

  static load (dataView) {

    let offset = 0;
    let len = dataView.getUint16(0);
    console.info('len', len);
    offset += 2;
    let stringArr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      stringArr[i] = dataView.getUint8(offset + i);
    }
    offset += len;
    var encodedString = String.fromCharCode.apply(null, stringArr);
    console.info('JSON:', encodedString);
  }

}