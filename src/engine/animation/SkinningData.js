export default class SkinningData {

  constructor (boneMap, skinData) {
    this.boneMap = boneMap;
    this.bindPoses = skinData.bindPoses;
    this.jointNames = skinData.jointNames;

    this.boneList = [];

    for (let i = 0; i < this.jointNames.length; i++) {
      let name = this.jointNames[i];
      let boneData = this.boneMap[name];
      boneData.index = i;
      boneData.name = name;
      this.boneList.push(boneData); // { index, name, object }
    }
  }

}