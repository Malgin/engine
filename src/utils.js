const { PI, sin, cos } = Math;

let utils = {

  generateSphere (mesh, parallelCount, meridianCount, radius = 1) {
    let vertices = [];
    let indices = [];
    let currentIndex = 0;

    for (let j = 0; j < parallelCount; j++) {
      let parallel = 2 * PI * (j+1) / parallelCount;

      for (let i = 0; i < meridianCount; i++) {
        let meridian = 2.0 * PI * i / meridianCount;
        vertices.push(
          radius * sin(parallel) * cos(meridian),
          radius * sin(parallel) * sin(meridian),
          radius * cos(parallel)
        );

        indices.push(j * parallelCount + i);
        indices.push(((j + 1) % parallelCount) * parallelCount + i);
        indices.push(((j + 1) % parallelCount) * parallelCount + (i + 1) % meridianCount);
        indices.push(((j + 1) % parallelCount) * parallelCount + (i + 1) % meridianCount);
        indices.push(((j + 1) % parallelCount) * parallelCount + i);
        indices.push(j * parallelCount + (i + 1) % meridianCount);
      }
    }

    mesh.setVertices(vertices);
    mesh.setIndices(indices);
  },

  generateBox (mesh, sizeX, sizeY, sizeZ) {
    let halfX = sizeX * 0.5;
    let halfY = sizeY * 0.5;
    let halfZ = sizeZ * 0.5;

    let srcVertices = [
      -halfX, -halfY, -halfZ,
      halfX, -halfY, -halfZ,
      halfX, -halfY, halfZ,
      -halfX, -halfY, halfZ,
      -halfX, halfY, -halfZ,
      halfX, halfY, -halfZ,
      halfX, halfY, halfZ,
      -halfX, halfY, halfZ,
    ];
    let srcIndices = [
      3, 0, 2, 0, 1, 2, // +y
      4, 7, 6, 4, 6, 5, // -y
      7, 4, 0, 7, 0, 3, // -x
      5, 2, 1, 5, 6, 2, // +x
      4, 5, 1, 4, 1, 0, // -z
      7, 3, 6, 6, 3, 2  // +z
    ];

    let vertices = [];

    // duplicate vertices
    for (let i = 0; i < srcIndices.length; i++) {
      vertices.push(srcVertices[srcIndices[i] * 3]);
      vertices.push(srcVertices[srcIndices[i] * 3 + 1]);
      vertices.push(srcVertices[srcIndices[i] * 3 + 2]);
    }

    mesh.setVertices(vertices);
  }

}

export default utils;