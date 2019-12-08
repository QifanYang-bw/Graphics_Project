function drawAll() {

  var ModelMatrix = new Matrix4();

  pushMatrix(ModelMatrix);
  drawObjects();

  clearMatrix(0);


  // {
  //   // ==================== Draw Right Viewport (Perspective) ====================

  //   gl.viewport(g_canvas.width/2,0,g_canvas.width/2, g_canvas.height);
  //   var ModelMatrix = new Matrix4();
    
  //   ModelMatrix.ortho(-g_canvas.width/500, g_canvas.width/500, -g_canvas.height/250, g_canvas.height/250, 
  //                          1.0,   // camera z-near distance (always positive; frustum begins at z = -znear)
  //                       1000.0);  // camera z-far distance (always positive; frustum ends at z = -zfar)
    
  //   ModelMatrix.lookAt(eyeX + currentAngle * tempEyeX*0.01,  eyeY,  eyeZ,     // center of projection
  //                     lookAtX + currentAngle * tX * 0.01, lookAtY, lookAtZ,  // look-at point 
  //                     0.0,  1,  0);

  //   pushMatrix(ModelMatrix);

  //   drawObjects();

  //   clearMatrix(0);

  // };
}


function drawObjects() {

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  // drawGroundGrid();
  // drawAxis();

  ModelMatrix.translate(0, 0.8, 0);
  ModelMatrix.scale(.15, .15, .15);

  // QuatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w); // Quaternion-->Matrix
  // ModelMatrix.concat(QuatMatrix); // apply that matrix.

  pushMatrix(ModelMatrix);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  drawDrone();


  // ModelMatrix = popMatrix();

  // ModelMatrix = popMatrix();
  // pushMatrix(ModelMatrix);

  // // Box for Body

  // ModelMatrix.translate(0, -.3, 0);
  // ModelMatrix.scale(.3, .3, .3);

  // pushMatrix(ModelMatrix);

  // // =================================================================
  // // Tip: Depth_Test gl.enable(gl.DEPTH_TEST) is not a good way here
  // // since it penetrates through other drawn objects.
  // // Instead, we temporarily disable gl.CULL_FACE to let gl draw both sides.

  // // Use gl.cullFace(gl.FRONT) would let it draw the other side only.
  // // Use gl.cullFace(gl.FRONT_AND_BACK) would cause the whole shape to disappear
  // // :)


  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.FRONT);
  // drawDog();   // Draw all parts

  // gl.disable(gl.CULL_FACE);
  // drawHuman();

  // // gl.cullFace(gl.BACK);
  // if (g_posAniActivated['cupMove1']) {
  //   drawWineGlass();
  // }

}
