// Converts collada format into internal game engine format
// Format description:
// * 2 bytes - length of the JSON utf-8 string that represents the file header
// * length bytes of the JSON file header
// * binary mesh data as described in the JSON header

var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');

var args = process.argv.splice(process.execArgv.length + 2);
var dataFile = args[0];
var data = fs.readFileSync(dataFile, 'utf8');

const MODE_TRIANGLES = 'triangles;'

class ColladaParser {

    constructor (data, opts = {}) {
      // Setup
      this.attributes = ['POSITION', 'NORMAL', 'TEXCOORD0', 'TEXCOORD1'];
      this.attribCount = { 'POSITION': 3, 'NORMAL': 3, 'TEXCOORD0': 2, 'TEXCOORD1': 2 };

      this.includeAttribs = {};
      for (let i = 0; i < this.attributes.length; i++) {
        this.includeAttribs[this.attributes[i]] = true;
      }
      this.includeGeometry = true;
      this.includeAnimation = true;
      this.includeHierarchy = true;

      if (opts.includeGeometry === false) this.includeGeometry = false;
      if (opts.includeAnimation === false) this.includeAnimation = false;
      if (opts.includeHierarchy === false) this.includeHierarchy = false;
      if (opts.includeNormals === false) this.includeAttribs['NORMAL'] = false;
      if (opts.includeUV === false) {
        this.includeAttribs['TEXCOORD0'] = false;
        this.includeAttribs['TEXCOORD1'] = false;
      }

      this.root = data.COLLADA;
      this.materialsData = this.root.library_materials;
      this.geometriesData = this.root.library_geometries;
      this.visualScenesData = this.root.library_visual_scenes;

      // Parsing

      // Object hierarchy
      if (this.includeHierarchy) {
        let scene = this.getCurrentScene();
        this.hierarchy = {};
        this.buildObjectHierarchy(this.hierarchy, scene);
        // console.log(util.inspect(this.hierarchy, false, null))
      }

      // Geometries
      if (this.includeGeometry) {
        this.geometry = this.prepareGeometries();
        this.regenerateGeometries(this.geometry);
        this.geometryOrder = this.getGeometryBinaryObjectOrder(this.geometry);
      }

      // console.log(util.inspect(geometryData, false, null))
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
        // Loop through all geometries
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

    // Appending geometry data from mesh entity
    // - mesh
    // - - source (array of vertex data such as positions, normals, uv)
    // - - vertices (list of attrubute bingings to the source)
    // - - triangles (similar binding list but contains indexes and offset for each source.
    //                May also have reference to the vertices data set)
    getGeometryData (geomData) {
      let result = {};

      let meshData = geomData.mesh[0];
      let meshSource = meshData.source;
      let vertices = meshData.vertices[0];

      if (!meshData.triangles) {
        throw new Error('Only triangles mesh supported');
      }

      let triangles = meshData.triangles[0];
      let stride = triangles.input.length;

      if (meshData.vertices.length > 1) {
        throw new Error('Multiple mesh.vertices not supported');
      }

      let sources = {};

      function appendInputSource (input, defaultOffset = 0) {
        for (let i = 0; i < input.length; i++) {
          let inputData = input[i].$;
          let semantic = inputData.semantic;

          let offset = inputData.offset;
          if (offset === undefined) {
            offset = defaultOffset;
          }

          if (semantic === 'VERTEX') {
            appendInputSource(vertices.input, offset);
            continue;
          };

          let source = inputData.source.slice(1); // skip leading #
          if (inputData.set !== undefined) {
            semantic += inputData.set;
          }

          sources[semantic] = {
            source: source,
            offset: parseInt(offset)
          };
        }
      }

      appendInputSource(triangles.input);

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
      result.stride = stride;
      result.triangleCount = parseInt(triangles.$.count);
      result.renderMode = MODE_TRIANGLES;

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

      let indexCount = meshData.indices.length / meshData.stride;

      let stride = meshData.stride;
      let currentIndex = 0;

      for (let i = 0; i < indexCount; i++) {
        let vertex = {}; // each vertex should be unique instance
        let index = i * stride;

        this.assignVertexAttribs(meshData, meshData.indices, index, vertex);

        // Searching for the vertex with similar attributes
        let vertexIndex = this.findVertexIndex(vertices, vertex);

        if (vertexIndex === -1) { // Not found - create new vertex
          vertexIndex = currentIndex++;
          vertices.push(vertex);
        }

        indices.push(vertexIndex);
      }

      indices = new Uint16Array(indices);

      return {
        vertices,
        indices,
        indexCount: indices.length,
        vertexCount: vertices.length
      };
    }

    findVertexIndex (vertices, vertex) {
      for (let i = 0; i < vertices.length; i++) {
        let currentVertex = vertices[i];

        let found = true;

        for (let attribName in vertex) {
          if (!this.compare(vertex[attribName], currentVertex[attribName])) {
            found = false;
            break;
          }
        }

        if (found) {
          return i;
        }
      }

      return -1;
    }

    compare (arr1, arr2) {
      if (arr1.length !== arr2.length || arr1.length === 0) {
        throw new Error('Compare array length mismatch');
      }

      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }

      return true;
    }

    assignVertexAttribs (meshData, indices, firstIndex, result) {
      for (let i = 0; i < this.attributes.length; i++) {
        let attribName = this.attributes[i];

        if (meshData[attribName]) {
          let data = [];
          let index = indices[firstIndex + meshData[attribName].offset];
          let count = this.attribCount[attribName];

          for (let j = 0; j < count; j++) {
            data.push(meshData[attribName].data[index * count + j]);
          }
          result[attribName] = data;
        }
      }
    }

    //------------------------------------------------------------------------
    // Object data and hierarchy
    //------------------------------------------------------------------------

    buildObjectHierarchy (object, data) {
      object.id = data.$.id;
      object.name = data.$.name;
      object.transform = this.getObjectTransform(data);
      object.geometry = this.getObjectGeometryID(data);

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

    getObjectGeometryID (data) {
      let geometry = data.instance_geometry;
      if (!geometry) {
        return null;
      }

      return geometry[0].$.url.slice(1); // skip first # character
    }

    //------------------------------------------------------------------------
    // Writing data
    //------------------------------------------------------------------------

    writeData (outputFile) {
      let writeStream = fs.createWriteStream('file.txt');

      let jsonData = {};
      let geometryData = [];
      let geomSize = 0;

      if (this.geometry) {
        jsonData.geometry = [];

        for (let i = 0; i < this.geometryOrder.length; i++) {
          let geomID = this.geometryOrder[i];
          let geomName = geomID; // may be changed in future
          let geom = this.geometry[geomID];
          let targetData = geom.targetData;

          jsonData.geometry.push({
            name: geomName,
            indexCount: targetData.indexCount,
            vertexCount: targetData.vertexCount
          });

          let data = {
            indices: targetData.indices,
            vertices: this.getTargetFloatArray(geom)
          };

          geomSize += data.indices.length * 2 + data.vertices.length * 4;

          geometryData.push(data);
        }
      }

      if (this.hierarchy) {
        jsonData.hierarchy = this.hierarchy;
      }

      let jsonString = JSON.stringify(jsonData);
      let jsonLength = Buffer.byteLength(jsonString);
      let bufferSize = 2 + jsonLength + geomSize;

      let buffer = new Buffer(bufferSize);
      let currentOffset = 0;
      buffer.writeUInt16BE(jsonLength, currentOffset);
      currentOffset += 2;

      buffer.write(jsonString, currentOffset, jsonLength);
      currentOffset += jsonLength;

      for (let i = 0; i < geometryData.length; i++) {
        currentOffset += this.writeUIntArray(buffer, currentOffset, geometryData[i].indices);
        currentOffset += this.writeFloatArray(buffer, currentOffset, geometryData[i].vertices);
      }

      writeStream.write(buffer);
      writeStream.end();
    }

    getTargetFloatArray (geom) {
      // Getting stride
      let stride = 0;
      for (let i = 0; i < this.attributes.length; i++) {
        let attrib = this.attributes[i];
        if (this.includeAttribs[attrib] && geom.geomData[attrib]) {
          stride += this.attribCount[attrib];
        }
      }

      let targetData = geom.targetData;
      let vertices = targetData.vertices;
      let result = new Float32Array(vertices.length * stride);

      for (let i = 0; i < vertices.length; i++) {
        let currentStride = 0;
        let vertex = vertices[i];

        for (let j = 0; j < this.attributes.length; j++) {
          let attribName = this.attributes[j];
          if (!this.includeAttribs[attribName] || !vertex[attribName]) continue;

          let count = this.attribCount[attribName];
          let currentIndex = i * stride + currentStride;
          currentStride += count;

          for (let k = 0; k < count; k++) {
            result[currentIndex + k] = vertex[attribName][k];
          }
        }
      }

      return result;
    }

    writeFloatArray(buffer, start, array) {
      for (let i = 0; i < array.length; i++) {
        buffer.writeFloatBE(array[i], start + i * 4);
      }

      return array.length * 4;
    }

    writeUIntArray(buffer, start, array) {
      for (let i = 0; i < array.length; i++) {
        buffer.writeUInt16BE(array[i], start + i * 2);
      }

      return array.length * 2;
    }

  }

let parser = new xml2js.Parser({
  trim: true
});

parser.parseString(data, function (err, result) {
  new ColladaParser(result).writeData();
});

