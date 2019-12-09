function makeDroneMisc() {

  // Box for Body

  posArr = [
    [ 0,  0,  0, 1], // a
    [ 0,  0,  1, 1], // b
    [ 1,  0,  1, 1], // c
    [ 1,  0,  0, 1], // d
    [ 0,  1,  0, 1], // e
    [ 0,  1,  1, 1], // f
    [ 1,  1,  1, 1], // g
    [ 1,  1,  0, 1], // h
  ];
  
  colorArr = [
    [.65, .65, .65, 1.0],
    [.3, .3, .3, 1.0],
    [.3, .3, .3, 1.0],
    [.65, .65, .65, 1.0],
    [.65, .65, .65, 1.0],
    [.3, .3, .3, 1.0],
    [.3, .3, .3, 1.0],
    [.65, .65, .65, 1.0],
  ];

  appendCube('dronConn1', posArr, colorArr, MATL_PEWTER);

  // console.log(vertexPool['dronConn1'][0]);

}