export default {
  addArrayToArray: function (array, arrayToAdd, index, count) {
    for (let i = 0; i < count; i++) {
        array.push(arrayToAdd[index + i]);
    }

    return count;
  }
}