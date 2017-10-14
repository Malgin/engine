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
        indices.push(j * parallelCount + (i + 1) % meridianCount);
        indices.push(((j + 1) % parallelCount) * parallelCount + i);
        indices.push(((j + 1) % parallelCount) * parallelCount + (i + 1) % meridianCount);
      }
    }

    mesh.setVertices(vertices);
    mesh.setIndices(indices);
  }

}

export default utils;