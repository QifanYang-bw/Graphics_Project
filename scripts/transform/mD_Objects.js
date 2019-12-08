function drawGroundGrid(){
  var originalMatrixDepth = getMatrixDepth();

  var ModelMatrix = new Matrix4();

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.translate( 0, -0.7, 0.0); 
  ModelMatrix.scale(0.2, 0.2, 0.2);
  updateModelMatrix(ModelMatrix);

    // Drawing:
  gl.drawArrays(gl.LINES, 
                vertexPool['GroundGrid'][0], 
                vertexPool['GroundGrid'][1]); // draw this many vertices.
  clearMatrix(originalMatrixDepth);
}

// function drawTorus() {

//   var originalMatrixDepth = getMatrixDepth();

//   var ModelMatrix = new Matrix4();

//   // Box for Body

//   ModelMatrix = popMatrix();
//   pushMatrix(ModelMatrix);

//   ModelMatrix.scale(0.4, 0.4, 0.4);
//   ModelMatrix.rotate(90.0, 1.0, 0.0, 0.0);

//   updateModelMatrix(ModelMatrix);

//   gl.drawArrays(gl.TRIANGLE_STRIP, 
//                 vertexPool['Torus'][0],
//                 vertexPool['Torus'][1]);

//   clearMatrix(originalMatrixDepth);

// }



function drawDrone()
{
  var originalMatrixDepth = getMatrixDepth();

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  // ModelMatrix.scale(1.5, 1.5, 1.5);
  // pushMatrix(ModelMatrix);

  // drawAxis();

  // ModelMatrix = popMatrix();
  // pushMatrix(ModelMatrix);

  // ModelMatrix.rotate(270, 1, 0, 0);
  ModelMatrix.translate(0, 0, 2);
  pushMatrix(ModelMatrix);

  var angle = 45;
  var curPropAngle = 0;

  for (var i = -2; i <= 2; i+=4) {
    for (var j = -2; j <= 2; j+=4) {

      switch ((i + 2) * 2 + j + 2) {
        case 0:
          curPropAngle = propellerShiftAngle;
          break;
        case 4:
          curPropAngle = (360 - propellerShiftAngle) % 360;
          break;
        case 8:
          curPropAngle = (450 - propellerShiftAngle) % 360;
          break;
        case 12:
          curPropAngle = (propellerShiftAngle + 90) % 360;
          break;
      }

      ModelMatrix = popMatrix();
      pushMatrix(ModelMatrix);

      ModelMatrix.translate(i, j, 0);
      pushMatrix(ModelMatrix);

      drawPropeller(curPropAngle);

      ModelMatrix = popMatrix();

      ModelMatrix = popMatrix();
      pushMatrix(ModelMatrix);

      ModelMatrix.translate(0, 0, -1.2);
      // // ModelMatrix.rotate(261.5789419, -0.3574067, 0.8628562, 0.3574067);
      ModelMatrix.rotate(270, 0, 1, 0);
      ModelMatrix.rotate(angle, 1, 0, 0);
      ModelMatrix.translate(0, 0, .3);
      ModelMatrix.scale(.32, .2, 2.4);

      angle = (angle + 90) % 360;

      updateModelMatrix(ModelMatrix);

      gl.cullFace(gl.FRONT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 
                    vertexPool['dronConn1'][0],
                    vertexPool['dronConn1'][1]);

    }


  }


  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.scale(2, 2, 1.5);
  ModelMatrix.rotate(180, 1, 0, 0);

  updateModelMatrix(ModelMatrix);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.drawArrays(gl.TRIANGLE_STRIP, 
                vertexPool['Pillar1'][0],
                vertexPool['Pillar1'][1]);

  ModelMatrix = popMatrix();

  clearMatrix(originalMatrixDepth);
}


function drawPropeller(angle) {
  var originalMatrixDepth = getMatrixDepth();

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.scale(2, 2, 0.4);
  updateModelMatrix(ModelMatrix);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 
                vertexPool['Ring'][0],
                vertexPool['Ring'][1]);

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.translate(0, 0, .25);
  ModelMatrix.scale(.4, .4, 1.6);
  ModelMatrix.rotate(180, 0, 1, 0);

  updateModelMatrix(ModelMatrix);

  gl.cullFace(gl.BACK);

  gl.drawArrays(gl.TRIANGLE_STRIP, 
                vertexPool['Barrel1'][0],
                vertexPool['Barrel1'][1]);

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.rotate(angle, 0, 0, 1);

  ModelMatrix.translate(0, 0, .2);
  ModelMatrix.scale(.1, .1, .1);

  pushMatrix(ModelMatrix);

  ModelMatrix.rotate(15.8068665, 0.948351, 0.314509, 0.0414059);
  // This equals to
  // ModelMatrix.rotate(5, 0, 1, 0);
  // ModelMatrix.rotate(15, 1, 0, 0);

  ModelMatrix.translate(-17, -5, -1.639);
  updateModelMatrix(ModelMatrix);

  gl.disable(gl.CULL_FACE);

  gl.drawArrays(gl.TRIANGLE_STRIP, 
                vertexPool['DroneWing'][0],
                vertexPool['DroneWing'][1]);

  ModelMatrix = popMatrix();

  ModelMatrix.rotate(180.6524274,  -0.0432469, 0.1304041, 0.9905173 );
  // This equals to
  // ModelMatrix.rotate(180, 0, 0, 1);
  // ModelMatrix.rotate(5, 0, 1, 0);
  // ModelMatrix.rotate(15, 1, 0, 0);
  ModelMatrix.translate(-17, -5, -1.639);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, 
                vertexPool['DroneWing'][0],
                vertexPool['DroneWing'][1]);

  clearMatrix(originalMatrixDepth);
}


function drawAxis(){
  var originalMatrixDepth = getMatrixDepth();

  var ModelMatrix = new Matrix4();

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.scale(0.75, 0.75, 0.75);
  updateModelMatrix(ModelMatrix);

    // Drawing:
  gl.drawArrays(gl.LINES, 
                vertexPool['Axis'][0], 
                vertexPool['Axis'][1]); // draw this many vertices.
  clearMatrix(originalMatrixDepth);
}



function drawWineGlass() {

  var originalMatrixDepth = getMatrixDepth();

  var ModelMatrix = new Matrix4();

  // Box for Body

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);


  ModelMatrix.translate(g_posAni['cupMove1'][0], -0.9, 0.25); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  ModelMatrix.scale(0.4, 0.4, 0.4);
  ModelMatrix.scale(1, g_angleAni['cupSize1'][0], 1);
  ModelMatrix.translate(0, g_angleAni['cupSize1'][0] - 1, 0);
  // ModelMatrix.rotate(g_angleAni['humanMove1'][0], 1, 0, 1);
  ModelMatrix.rotate(90.0, 1, 0, 0);
  updateModelMatrix(ModelMatrix);

  // console.log(vertexPool['WineGlass']);

  gl.drawArrays(gl.TRIANGLE_STRIP, 
                vertexPool['WineGlass'][0],
                vertexPool['WineGlass'][1]);

  clearMatrix(originalMatrixDepth);

}


function drawDog() {

  var originalMatrixDepth = getMatrixDepth();

  var ModelMatrix = new Matrix4();

  // Box for Body

  var bodyYShift = -Math.sin(Math.abs(g_angleAni['dogMove1'][0] * Math.PI / 180)) / 12.0;
  var jumpYShift = g_posAni['dogJump1'][0] * g_posAniActivated['dogJump1'] + 
                   g_posAni['dogJump2'][0] * g_posAniActivated['dogJump2'];

  // console.log(jumpYShift);

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  ModelMatrix.translate(1, -0.6 + bodyYShift + jumpYShift, -0.25);

  updateModelMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dBody'][0], vertexPool['dBody'][1]);

  // Box for head

  ModelMatrix.translate(-0.6667, 0.0, -0.0833);
  ModelMatrix.scale(0.6667, 0.6667, 0.6667);
  updateModelMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dHead'][0], vertexPool['dHead'][1]);

  // Box for nose


  ModelMatrix.translate(-0.5, 0.0, 0.25);
  ModelMatrix.scale(0.5, 0.5, 0.5);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dHead'][0], vertexPool['dHead'][1]);

  // One ear
   
  ModelMatrix = popMatrix(); // head
  pushMatrix(ModelMatrix);

  ModelMatrix.translate(0.125, 1, 0);
  ModelMatrix.scale(0.5, 0.5, 0.5);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dEar'][0], vertexPool['dEar'][1]);

  // Another ear

  ModelMatrix = popMatrix(); // head

  ModelMatrix.translate(0.125, 1, 0.6667);
  ModelMatrix.scale(0.5, 0.5, 0.5);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dEar'][0], vertexPool['dEar'][1]);

  // Leg

  ModelMatrix = popMatrix(); // body
  pushMatrix(ModelMatrix);

  // console.log(g_angleAni['dogMove1'][0]);

  ModelMatrix.translate(0.1833, 0, 0);
  ModelMatrix.rotate(g_angleAni['dogMove1'][0], 0, 0, 1)
  ModelMatrix.translate(-0.0833,0,0)
  ModelMatrix.scale(0.6667, 0.6667, 0.6667);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dLeg'][0], vertexPool['dLeg'][1]);


  ModelMatrix = popMatrix(); // body
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0.1833, 0, 0);
  ModelMatrix.rotate(-g_angleAni['dogMove1'][0], 0, 0, 1)
  ModelMatrix.translate(-0.0833, 0, 0.3333);
  ModelMatrix.scale(0.6667, 0.6667, 0.6667);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dLeg'][0], vertexPool['dLeg'][1]);

  ModelMatrix = popMatrix(); // body
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0.7833, 0, 0);
  ModelMatrix.rotate(-g_angleAni['dogMove1'][0], 0, 0, 1)
  ModelMatrix.translate(-0.0833, 0, 0);
  ModelMatrix.scale(0.6667, 0.6667, 0.6667);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dLeg'][0], vertexPool['dLeg'][1]);


  ModelMatrix = popMatrix(); // body
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0.7833, 0, 0);
  ModelMatrix.rotate(g_angleAni['dogMove1'][0], 0, 0, 1)
  ModelMatrix.translate(-0.0833, 0, 0.3333);
  ModelMatrix.scale(0.6667, 0.6667, 0.6667);
  updateModelMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dLeg'][0], vertexPool['dLeg'][1]);


  // tail

  ModelMatrix = popMatrix(); // body
  pushMatrix(ModelMatrix);

  ModelMatrix.translate(1, 0.25, 0.25);
  ModelMatrix.rotate(g_angleAni['dogTailMove1'][0], 1, 0, 0);
  ModelMatrix.scale(0.6667, 0.6667, 0.6667);
  ModelMatrix.rotate(-45, 0, 0, 1);
  ModelMatrix.translate(-0.125, 0, -0.125);
  updateModelMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dTail1'][0], vertexPool['dTail1'][1]);

  ModelMatrix = popMatrix(ModelMatrix);
  ModelMatrix.translate(0.1,0.25,0.025);
  ModelMatrix.rotate(g_angleAni['dogTailMove1'][0]*0.95, 1,0,0);
  ModelMatrix.translate(-0.075,0,0);
  ModelMatrix.scale(0.8,1,0.8);
  ModelMatrix.rotate(20,0,0,1);
  updateModelMatrix(ModelMatrix);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dTail1'][0], vertexPool['dTail1'][1]);

  ModelMatrix.translate(0.1,0.25,0.02);
  ModelMatrix.rotate(g_angleAni['dogTailMove1'][0]*0.9, 1,0,0);
  ModelMatrix.translate(-0.075,0,0);
  ModelMatrix.scale(0.8,1,0.8);
  ModelMatrix.rotate(20,0,0,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dTail1'][0], vertexPool['dTail1'][1]);

  ModelMatrix.translate(0.125,0.25,0);
  ModelMatrix.rotate(g_angleAni['dogTailMove1'][0]*0.85,1,0,0);
  ModelMatrix.translate(-0.125,0,0);
  ModelMatrix.rotate(20,0,0,1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['dTail2'][0], vertexPool['dTail2'][1]);

  pushMatrix(ModelMatrix);
  drawAxis();

  clearMatrix(originalMatrixDepth);

}


function drawHuman(){

  var originalMatrixDepth = getMatrixDepth();

  var ModelMatrix = new Matrix4();

  ModelMatrix = popMatrix();
  pushMatrix(ModelMatrix);

  // Box for body

  var bodyYShift = -Math.sin(Math.abs(g_angleAni['humanMove1'][0] * Math.PI / 180)) / 12.0;
  var jumpYShift = g_posAni['humanJump1'][0] * g_posAniActivated['humanJump1'] + 
                   g_posAni['humanJump2'][0] * g_posAniActivated['humanJump2'];

  // ModelMatrix.translate(-.075,-.2,-.15)
  ModelMatrix.scale(3, 3, 3);
  ModelMatrix.translate(-0.35, bodyYShift + jumpYShift, 0)
  ModelMatrix.rotate(-90, 0, 1, 0)

  updateModelMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);


  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hBody'][0], vertexPool['hBody'][1]);

  // Box for Head


  ModelMatrix.translate(0.025, 0.4, -0.05);
  ModelMatrix.scale(0.25, 0.2, 0.25);
  updateModelMatrix(ModelMatrix);
  //pushMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hHead'][0], vertexPool['hHead'][1]);

  // Box for Hair

  ModelMatrix.translate(0, 1, 0);
  ModelMatrix.scale(1, 0.25, 1);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hHair'][0], vertexPool['hHair'][1]);

  // Box for left shoulder

  ModelMatrix = popMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(-0.1001, 0.4, 0.075);
  ModelMatrix.rotate(g_angleAni['humanMove1'][0], 1, 0, 0);
  ModelMatrix.translate(0, 0, -0.075)
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hShoulder1'][0], vertexPool['hShoulder1'][1]);

  // Box for left arm

  angleArm = g_angleAni['humanMove1'][0]*0.8;
  if(angleArm>0){angleArm = 0};
  ModelMatrix.translate(0.005, -.25, 0.075);
  ModelMatrix.rotate(angleArm, 1,0 ,0);
  ModelMatrix.translate(0,0,-.075);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hArm1'][0], vertexPool['hArm1'][1]);
  
  // Box for right shoulder

  ModelMatrix = popMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(.3001, 0.4, 0.075);
  ModelMatrix.rotate(-g_angleAni['humanMove1'][0], 1, 0, 0);
  ModelMatrix.translate(0, 0, -0.075)
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hShoulder2'][0], vertexPool['hShoulder2'][1]);

  // Box for right arm
  angleArm = -g_angleAni['humanMove1'][0]*0.8;
  if(angleArm>0){angleArm = 0};
  ModelMatrix.translate(0.005, -.25, 0.075);
  ModelMatrix.rotate(angleArm,1,0,0)
  ModelMatrix.translate(0,0,-.075);
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hArm2'][0], vertexPool['hArm2'][1]);

  // Box for left leg

  ModelMatrix = popMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0, 0, 0.075);
  ModelMatrix.rotate(-g_angleAni['humanMove1'][0], 1, 0, 0);
  ModelMatrix.translate(0, 0, -0.075)
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hLeg'][0], vertexPool['hLeg'][1]);

  // Box for left foot

  ModelMatrix.translate(0, -.35, 0)
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hFoot'][0], vertexPool['hFoot'][1]);

  // Box for right leg

  ModelMatrix = popMatrix(ModelMatrix);
  pushMatrix(ModelMatrix);
  ModelMatrix.translate(0, 0, 0.075);
  ModelMatrix.rotate(g_angleAni['humanMove1'][0], 1, 0, 0);
  ModelMatrix.translate(0.15, 0, -0.075)
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hLeg'][0], vertexPool['hLeg'][1]);

  // Box for right foot

  ModelMatrix.translate(0, -.35, 0)
  updateModelMatrix(ModelMatrix);
  gl.drawArrays(gl.TRIANGLE_STRIP, vertexPool['hFoot'][0], vertexPool['hFoot'][1]);

  clearMatrix(originalMatrixDepth);
}