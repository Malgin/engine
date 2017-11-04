// Converts collada format into internal game engine format
// Format description
// * 2 byte - length of the JSON string that represents the file header
// * length bytes of the JSON file header
// * binary mesh data

var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');

var args = process.argv.splice(process.execArgv.length + 2);
var dataFile = args[0];
var data = fs.readFileSync(dataFile, 'utf8');

class ColladaParser {

    constructor (data) {
      this.root = data.COLLADA;
      this.materialsData = this.root.library_materials;
      this.geometriesData = this.root.library_geometries;
      this.visualScenesData = this.root.library_visual_scenes;

      this.setupAxis();

      let scene = this.getCurrentScene();
      this.rootObject = {};
      this.buildObjectHierarchy(this.rootObject, scene);
      // console.log(util.inspect(this.rootObject, false, null))

      let geometryData = this.prepareGeometries();
      this.regenerateGeometries(geometryData);
      let binaryObjectOrder = this.getGeometryBinaryObjectOrder(geometryData);

      console.log(util.inspect(geometryData, false, null))
    }

    setupAxis () {
      this.upAxis = this.root.asset[0].up_axis[0];
      console.info('UP: ', this.upAxis);
    }

    getCurrentScene () {
      return this.visualScenesData[0].visual_scene[0];
    }

    //------------------------------------------------------------------------
    // Geometry data
    //------------------------------------------------------------------------

    prepareGeometries () {
      let result = null;

      let geomData = this.geometriesData[0].geometry;
      if (geomData && geomData.length) {
        result = {};
        for (let i = 0; i < geomData.length; i++) {
          let geom = geomData[i];
          let geomID = geom.$.id;
          let geomName = geom.$.name;
          result[geomID] = {
            id: geomID,
            name: geomName,
            geomData: this.getGeometryData(geom)
          };
        }
      }

      return result;
    }

    getGeometryData (geomData) {
      let result = {};

      let meshData = geomData.mesh[0];
      let meshSource = meshData.source;
      let vertices = meshData.vertices[0];
      let triangles = meshData.triangles[0];

      result.triangleCount = triangles.$.count;

      let sources = {};
      sources.POSITION = {
        source: vertices.input[0].$.source.slice(1), // skip leading #
        offset: 0
      };

      for (let i = 0; i < triangles.input.length; i++) {
        let inputData = triangles.input[i].$;

        let semantic = inputData.semantic;

        if (semantic === 'VERTEX') continue; // Skip VERTEX because POSITION is used instead

        let source = inputData.source.slice(1); // skip leading #
        if (semantic === 'TEXCOORD') { // Use TEXCOORD0 / TEXCOORD1 etc
          semantic += inputData.set;
        }

        sources[semantic] = {
          source: source,
          offset: parseInt(inputData.offset)
        };
      }

      for (let semantic in sources)  {
        let source = sources[semantic];
        let arrayID = source.source;
        let offset = source.offset;

        result[semantic] = {
          data: this.getGeometryArray(arrayID, meshSource),
          offset: offset
        }
      }

      let indices = triangles.p[0].split(" ");
      for (let i = 0; i < indices.length; i++) {
        indices[i] = parseInt(indices[i]);
      }

      result.indices = indices;

      return result;
    }

    getGeometryArray (arrayID, meshSource) {
      for (let i = 0; i < meshSource.length; i++) {
        let sourceData = meshSource[i];
        let id = sourceData.$.id;
        if (id !== arrayID) continue;

        let arrayString = sourceData.float_array[0]._;

        // Remove line breaks
        arrayString = arrayString.replace(/\n/g, " ");
        let array = arrayString.split(" ");

        // We need array of float
        for (let j = 0; j < array.length; j++) {
          array[j] = parseFloat(array[j]);
        }
        return array;
      }

      return [];
    }

    getGeometryBinaryObjectOrder (geometryData) {
      let result = [];

      for (let id in geometryData) {
        result.push(id);
      }

      return result;
    }

    regenerateGeometries (geometryData) {
      for (let id in geometryData) {
        let geom = geometryData[id];
        geom.targetData = this.regenerateMesh(geom.geomData);
      }
    }

    // Mesh needs to use a single set of indices for all the vertex data
    regenerateMesh (meshData) {
      let indices = [];
      let vertices = [];
      let normals = [];
      let texcoord0 = [];
      let texcoord1 = [];
    }

    //------------------------------------------------------------------------
    // Object data and hierarchy
    //------------------------------------------------------------------------

    buildObjectHierarchy (object, data) {
      object.id = data.$.id;
      object.name = data.$.name;
      object.transform = this.getObjectTransform(data);
      object.geometry = this.getObjectGeometry(data);

      let dataChildren = data.node;
      if (dataChildren) {
        object.children = [];
        for (let i = 0; i < dataChildren.length; i++) {
          let childData = dataChildren[i];
          let child = {};
          object.children.push(child);
          this.buildObjectHierarchy(child, childData);
        }
      }
    }

    getObjectTransform (data) {
      let matrix = data.matrix;
      if (!matrix) {
        return null;
      }

      return matrix[0]._;
    }

    getObjectGeometry (data) {
      let geometry = data.instance_geometry;
      if (!geometry) {
        return null;
      }

      return geometry[0].$.url.slice(1); // skip first # character
    }

  }

var parser = new xml2js.Parser({
  trim: true
});
parser.parseString(data, function (err, result) {
  new ColladaParser(result);
});

