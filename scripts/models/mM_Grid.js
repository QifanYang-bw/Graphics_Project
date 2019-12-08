
function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

  var xcount = 100;     // # of lines to draw in x,y to make the grid.
  var ycount = 100;   
  var xymax = 50.0;     // grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([1.0, 1.0, 0.3, 1]);  // bright yellow
  var yColr = new Float32Array([1.0, 1.0, 0.3, 1]);  // bright green.
  
  // Create an (global) array to hold this ground-plane's vertices:
  gndPosArr = new Float32Array(g_floatsPerPos*2*(xcount+ycount));
  gndColorArr = new Float32Array(g_floatsPerColor*2*(xcount+ycount));

            // draw a grid made of xcount+ycount lines; 2 vertices per line.
            
  var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
  var ygap = xymax/(ycount-1);    // (why half? because v==(0line number/2))
  
  // First, step thru x values as we make vertical lines of constant-x:
  for(v=0, j=0; v<2*xcount; v++, j+= g_floatsPerPos) {
    if(v%2==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
      gndPosArr[j  ] = -xymax + (v  )*xgap;  // x
      gndPosArr[j+2] = -xymax;               // y
      gndPosArr[j+1] = 0.0;                  // z
      gndPosArr[j+3] = 1.0;                  // w.
    }
    else {        // put odd-numbered vertices at (xnow, +xymax, 0).
      gndPosArr[j  ] = -xymax + (v-1)*xgap;  // x
      gndPosArr[j+2] = xymax;                // y
      gndPosArr[j+1] = 0.0;                  // z
      gndPosArr[j+3] = 1.0;                  // w.
    }
  }

  for(v=0, j=0; v<2*xcount; v++, j+= g_floatsPerColor) {
    gndColorArr[j] = xColr[0];     // red
    gndColorArr[j+1] = xColr[1];     // grn
    gndColorArr[j+2] = xColr[2];     // blu
    gndColorArr[j+3] = xColr[3];     
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for(v=0; v<2*ycount; v++, j+= g_floatsPerPos) {
    if(v%2==0) {    // put even-numbered vertices at (-xymax, ynow, 0)
      gndPosArr[j  ] = -xymax;               // x
      gndPosArr[j+2] = -xymax + (v  )*ygap;  // y
      gndPosArr[j+1] = 0.0;                  // z
      gndPosArr[j+3] = 1.0;                  // w.
    }
    else {          // put odd-numbered vertices at (+xymax, ynow, 0).
      gndPosArr[j  ] = xymax;                // x
      gndPosArr[j+2] = -xymax + (v-1)*ygap;  // y
      gndPosArr[j+1] = 0.0;                  // z
      gndPosArr[j+3] = 1.0;                  // w.
    }
  }
  for(v=0; v<2*ycount; v++, j+= g_floatsPerColor) {
    gndColorArr[j] = yColr[0];     // red
    gndColorArr[j+1] = yColr[1];     // grn
    gndColorArr[j+2] = yColr[2];     // blu
    gndColorArr[j+3] = yColr[3];
  }
  // console.log(gndPosArr);
  // console.log(gndColorArr);
  appendObject('GroundGrid', gndPosArr, gndColorArr);
}