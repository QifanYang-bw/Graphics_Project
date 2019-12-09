var defaultMaterialID = MATL_RED_PLASTIC;

var applyColorOnBody = true;

function drawAll() {

  var ModelMatrix = new Matrix4();

  updateUseColor(1);
  updateMaterial(vertexPool['Sphere'][2]);

  pushMatrix(ModelMatrix);
  drawObjects();

  clearMatrix(0);

}


function drawObjects() {

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  // drawGroundGrid();
  // drawAxis();

  // --------------- Drone ---------------
  ModelMatrix.translate(0, 0, 1.0);
  ModelMatrix.scale(.15, .15, .15);

  // QuatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
  // ModelMatrix.concat(QuatMatrix); // apply that matrix.

  pushMatrix(ModelMatrix);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  drawDrone();

  ModelMatrix = popMatrix();


  // --------------- Sphere ---------------
  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.translate(-2.0, 0, 1.2);
  ModelMatrix.scale(.3, .3, .3);

  pushMatrix(ModelMatrix);

  updateUseColor(0);
  updateMaterial(vertexPool['Sphere'][2]);
  drawSphere();

  ModelMatrix = popMatrix();


  if (applyColorOnBody) {
    updateUseColor(1);
  } else {
    updateUseColor(0);
  }


  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.translate(0, 0, .4);
  ModelMatrix.scale(.3, .3, .3);
  ModelMatrix.rotate(90, 1, 0, 0);

  pushMatrix(ModelMatrix);

  // =================================================================
  // Tip: Depth_Test gl.enable(gl.DEPTH_TEST) is not a good way here
  // since it penetrates through other drawn objects.
  // Instead, we temporarily disable gl.CULL_FACE to let gl draw both sides.

  // Use gl.cullFace(gl.FRONT) would let it draw the other side only.
  // Use gl.cullFace(gl.FRONT_AND_BACK) would cause the whole shape to disappear
  // :)

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);

  updateMaterial(MATL_JADE);
  drawDog();   // Draw all parts


  gl.disable(gl.CULL_FACE);
  updateMaterial(MATL_PEARL);
  drawHuman();

  // gl.cullFace(gl.BACK);
  if (g_posAniActivated['cupMove1']) {
    drawWineGlass();
  }

}
