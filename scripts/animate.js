// Matrix and Qs for Quaternion-based drag rotation

var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1); // 'current' orientation (made from qNew)
var QuatMatrix = new Matrix4();       // rotation matrix, made from latest qTot

// Structure of ?Ani dictionary:
// [Angle, Angular Verlocity, Direction, Lower Bound, Upper Bound].
// Maybe I should make a class for this

var propellerShiftAngle = 0;
var propellerShiftSpeed = 1.3;

var sphereShiftAngle = 0;
var sphereShiftSpeed = 0.02;

var g_angleAni = {
  humanMove1: [0, 75.0, 1.0, -45.0, 45.0],
  dogMove1: [0, 160.0, 1.0, -24.0, 24.0],
  dogTailMove1: [0, 300.0, 1.0, -40.0, 40.0],

  cupSize1: [0, 1.17, 1.0, 0.75, 1.25]
};

var g_posAni = {
  cupMove1: [0.0,   4.0, 1.0,   -5.0, 5.0],
  humanJump1: [0.0, 1.5, 1.0,   0.0, 0.5],
  humanJump2: [0.0, 1.5, -1.0,  0.5, 0.0],
  dogJump1: [0.0,   3.0, 1.0,   0.0, 1.5],
  dogJump2: [0.0,   3.0, -1.0,  1.5, 0.0]
};

var g_posAniActivated = {
  cupMove1: false,
  humanJump1: false,
  humanJump2: false,
  dogJump1: false,
  dogJump2: false,
};

var avgFrameSec = 30;
var resumeFirstFrame = false;

function animate() {
//==============================================================================
  if (g_rateBoostingFactor == 0) {
    return;
  }

  // Calculate the elapsed time
  var now = Date.now();

  avgFrameSec = (avgFrameSec + now - g_last) * .5;

  if (resumeFirstFrame) {
    // console.log('hi');
    g_last = now - avgFrameSec;
    resumeFirstFrame = false;
  }

  var elapsed = (now - g_last) * g_rateBoostingFactor;
  g_last = now;

  propellerShiftAngle = (propellerShiftAngle + propellerShiftSpeed * elapsed) % 360;

  sphereShiftAngle = (sphereShiftAngle + sphereShiftSpeed * elapsed) % 360;

  // Angle, Angular Verlocity, Direction, Lower Bound, Upper Bound

  var predictValue, valueAni;

  for (var keyAni in g_angleAni) {

    valueAni = g_angleAni[keyAni];

    predictValue = valueAni[0] + valueAni[1] * valueAni[2] * elapsed / 1000.0;

    if (predictValue < valueAni[3] || predictValue > valueAni[4]) {
      valueAni[2] = -valueAni[2];
      predictValue = valueAni[0] + valueAni[1] * valueAni[2] * elapsed / 1000.0;
    };

    if (predictValue < valueAni[3]){
      predictValue = valueAni[3];
    } 
    if (predictValue > valueAni[4]) {
      predictValue = valueAni[4];
    }

    valueAni[0] = predictValue;

  }

  //cupMove1: [-0.0, 2.0, 0.0, -3.0, 3.0, false],
  
  if (jumpSignal) {
    jumpSignal = false;

    if (!g_posAniActivated['cupMove1']) {
      g_posAniActivated['cupMove1'] = true;
      // console.log('jumping!');

      g_posAni['cupMove1'][0] = g_posAni['cupMove1'][3];
    }
  }

  if (g_posAniActivated['cupMove1']) {
    if (!g_posAniActivated['humanJump1']) {
      if (g_posAni['cupMove1'][0] >= -2.5 && g_posAni['cupMove1'][0] <= -2) {

        g_posAniActivated['humanJump1'] = true;
        g_posAni['humanJump1'][0] = g_posAni['humanJump1'][3];

      }
    }

    if (!g_posAniActivated['dogJump1']) {
      if (g_posAni['cupMove1'][0] >= -.5 && g_posAni['cupMove1'][0] <= 0) {

        g_posAniActivated['dogJump1'] = true;
        g_posAni['dogJump1'][0] = g_posAni['dogJump1'][3];
        
      }
    }

  }


  for (var keyAni in g_posAni) {

    if (g_posAniActivated[keyAni]) {

      valueAni = g_posAni[keyAni];

      // console.log('hey!', valueAni);

      predictValue = valueAni[0] + valueAni[1] * valueAni[2] * elapsed / 1000.0;

      if (valueAni[2] > 0 && predictValue > valueAni[4] ||
          valueAni[2] < 0 && predictValue < valueAni[4]) {

        // console.log(keyAni, valueAni);
        valueAni[0] = valueAni[4];
        g_posAniActivated[keyAni] = false;

      }
      else {
        valueAni[0] = predictValue;
      }

    }

  }

  if (g_posAniActivated['cupMove1']) {
    if (!g_posAniActivated['humanJump2']) {
      if (!g_posAniActivated['humanJump1'] && g_posAni['humanJump1'][0] == g_posAni['humanJump1'][4]) {

          g_posAni['humanJump1'][0] = 0;
          g_posAniActivated['humanJump2'] = true;
          g_posAni['humanJump2'][0] = g_posAni['humanJump2'][3];
          
      }
    }

    if (!g_posAniActivated['dogJump2']) {
      if (!g_posAniActivated['dogJump1'] && g_posAni['dogJump1'][0] == g_posAni['dogJump1'][4]) {

          g_posAni['dogJump1'][0] = 0;

          // console.log('2 activated!');
          g_posAniActivated['dogJump2'] = true;
          g_posAni['dogJump2'][0] = g_posAni['dogJump2'][3];
          
      }
    }

  }

}


//================== Quaternion Drag Function ======================
// From ControlQuaternion.js, 2019.10.25 Quaternions
function dragQuat(xdrag, ydrag) {
  //==============================================================================
  // Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
  // We find a rotation axis perpendicular to the drag direction, and convert the 
  // drag distance to an angular rotation amount, and use both to set the value of 
  // the quaternion qNew.  We then combine this new rotation with the current 
  // rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
  // 'draw()' function converts this current 'qTot' quaternion to a rotation 
  // matrix for drawing. 
  var res = 5;
  var qTmp = new Quaternion();
  
  var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
  // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
  qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
  // (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
              // why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
              // -- to rotate around +x axis, drag mouse in -y direction.
              // -- to rotate around +y axis, drag mouse in +x direction.
              
  qTmp.multiply(qNew,qTot);     // apply new rotation to current rotation. 
  //--------------------------
  // IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
  // ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
  // If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
  // first by qTot, and then by qNew--we would apply mouse-dragging rotations
  // to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
  // rotations FIRST, before we apply rotations from all the previous dragging.
  //------------------------
  // IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
  // them with finite precision. While the product of two (EXACTLY) unit-length
  // quaternions will always be another unit-length quaternion, the qTmp length
  // may drift away from 1.0 if we repeat this quaternion multiply many times.
  // A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
  // Matrix4.prototype.setFromQuat().
//  qTmp.normalize();           // normalize to ensure we stay at length==1.0.
  qTot.copy(qTmp);
  // show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
  document.getElementById('QuatValue').innerHTML= 
                             '\t X=' +qTot.x.toFixed(res)+
                            'i\t Y=' +qTot.y.toFixed(res)+
                            'j\t Z=' +qTot.z.toFixed(res)+
                            'k\t W=' +qTot.w.toFixed(res)+
                            '<br>length='+qTot.length().toFixed(res);
};


function jumpTrigger() {
    jumpSignal = true;
}

//==================HTML Button Callbacks======================

function angleSubmit() {
// Called when user presses 'Submit' button on our webpage
//    HOW? Look in HTML file (e.g. ControlMulti.html) to find
//  the HTML 'input' element with id='usrAngle'.  Within that
//  element you'll find a 'button' element that calls this fcn.

// Read HTML edit-box contents:
  var UsrTxt = document.getElementById('usrAngle').value; 
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':
  document.getElementById('EditBoxOut');
  console.log('angleSubmit: UsrTxt:', UsrTxt); // print in console, and
  g_angle01 = parseFloat(UsrTxt);     // convert string to float number 
};

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
  g_xMdragTot = 0.0;
  g_yMdragTot = 0.0;
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.
  if (g_rateBoostingFactor < 8 && g_rateBoostingFactor > 1e-3) {
    g_rateBoostingFactor += .2; 
  }
}

function spinDown() {
  // Called when user presses the 'Spin <<' button
  if (g_rateBoostingFactor > .3) {
    g_rateBoostingFactor -= .2; 
  }
}
function runStop() {
// Called when user presses the 'Run/Stop' button
  if(g_rateBoostingFactor > 1e-3) {  // if nonzero rate,
    myTmp = g_rateBoostingFactor;  // store the current rate,
    g_rateBoostingFactor = 0.0;      // and set to zero.
  }
  else {    // but if rate is zero,
    g_rateBoostingFactor = myTmp;  // use the stored rate.
    resumeFirstFrame = true;
  }
}

