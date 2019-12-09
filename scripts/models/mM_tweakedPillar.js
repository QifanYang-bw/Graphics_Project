
function maketweakedPillar() {
  //==============================================================================
  // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
  // 'stepped spiral' design (Method 2) described in the class lecture notes.
  // Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
  //

  // var topColr = new Float32Array([0.8, 0.8, 0.0]); // light yellow top,
  // var walColr = new Float32Array([0.2, 0.6, 0.2]); // dark green walls,
  // var botColr = new Float32Array([0.2, 0.3, 0.7]); // light blue bottom,
  // var ctrColr = new Float32Array([0.1, 0.1, 0.1]); // near black end-cap centers

  var nArr = 5;

  var posArr = new Float32Array([0.0, 0.05, 0.3, 0.5496, 1.0]);
  var radArr = new Float32Array([1.0, 1.0, 0.9, 0.47, 0.3]);

  var colorArr =  [[0.25, 0.25, 0.25],
                  [0.25, 0.25, 0.25],
                  [0.35, 0.35, 0.35],
                  [0.5, 0.5, 0.5], 
                  [0.7, 0.7, 0.7]];


  var basePoints = [[-1.0, 1.0, 0.0],
                    [-1.0, -1.0, 0.0],
                    [1.0, -1.0, 0.0],
                    [1.0, 1.0, 0.0]];

  var ringDivs = 48;
  var quatRingDivs = Math.floor(ringDivs * 0.25);

  var basePosAryX = new Float32Array(ringDivs);
  var basePosAryY = new Float32Array(ringDivs);
  var counter = 0;

  var thetaStep = 2 * Math.PI / ringDivs;  // theta angle between each tube ring

  for (i = 0; i < 4; i++) {

    for (k = 0; k < quatRingDivs; k++,counter++)
    {
      if (i == 1 || i == 3) {
        var multiplier = quatRingDivs - k;
      } 
      else
      {
        var multiplier = k;
      }

      // console.log(basePoints[i][0] - basePoints[i][0] * Math.cos(multiplier * thetaStep));

      basePosAryX[counter] = basePoints[i][0] - basePoints[i][0] * Math.cos(multiplier * thetaStep);
      basePosAryY[counter] = basePoints[i][1] - basePoints[i][1] * Math.sin(multiplier * thetaStep);
    }
  }

  // console.log(basePosAryX, basePosAryY);




  var capVerts = ringDivs; // # of vertices around the topmost 'cap' of the shape

  // Create two arrays to hold all of this cylinder's vertices;

  var curSize = ((4 * capVerts) + 2 + (nArr - 1) * (2 * capVerts + 2)) * g_floatsPerVertex;

  var g_cylAry = new Float32Array( curSize );



  counter = 0;

  for(v=0,j=0;   v<(2*ringDivs)+1;   v++,j+=g_floatsPerVertex) {  
    // START at vertex v = 0; on x-axis on end-cap's outer edge, at xyz = 1,0,-1.
    // END at the vertex 2*(capVerts-1), the last outer-edge vertex before 
    // we reach the starting vertex at 1,0,-1. 
    if(v%2 ==0)
    {       // put even# vertices around bottom cap's outer edge,starting at v=0.
            // visit each outer-edge location only once; don't return to 
            // to the location of the v=0 vertex (at 1,0,-1).
            // x,y,z,w == cos(theta),sin(theta),-1.0, 1.0, 
            //    where theta = 2*PI*((v/2)/capVerts) = PI*v/capVerts
      g_cylAry[j  ] = basePosAryX[counter] * radArr[0];     // x
      g_cylAry[j+1] = basePosAryY[counter] * radArr[0];     // y
      //  (Why not 2*PI? because 0 < =v < 2*capVerts,
      //   so we can simplify cos(2*PI * (v/(2*capVerts))
      g_cylAry[j+2] = posArr[0];  // z
      g_cylAry[j+3] = 1.0;  // w.
      // r,g,b = botColr[] 
      g_cylAry[j+4] = colorArr[0][0]; 
      g_cylAry[j+5] = colorArr[0][1]; 
      g_cylAry[j+6] = colorArr[0][2];
      g_cylAry[j+7] = 1.0;

      counter += 1;
      if (counter >= ringDivs) counter = 0;
    }
    else {  // put odd# vertices at center of cylinder's bottom cap:
      g_cylAry[j  ] = 0.0;      // x,y,z,w == 0,0,-1,1; centered on z axis at -1.
      g_cylAry[j+1] = 0.0;  
      g_cylAry[j+2] = posArr[0]; 
      g_cylAry[j+3] = 1.0;      // r,g,b = ctrColr[]
      g_cylAry[j+4] = colorArr[0][0]; 
      g_cylAry[j+5] = colorArr[0][1]; 
      g_cylAry[j+6] = colorArr[0][2];
      g_cylAry[j+7] = 1.0;
    }
  }

  // console.log(j, curSize);


  for (var i = 0; i < nArr - 1; i++) {
    // Create the cylinder side walls, made of 2*capVerts vertices.
    // v counts vertices within the wall; j continues to count array elements
    // START with the vertex at 1,0,-1 (completes the cylinder's bottom cap;
    // completes the 'transition edge' drawn in blue in lecture notes).
    counter = 0;

    for(v=0; v< 2*capVerts + 2;   v++, j+=g_floatsPerVertex) {
      if(v%2==0)  // count verts from zero again, 
                  // and put all even# verts along outer edge of bottom cap:
      {   
          g_cylAry[j  ] = basePosAryX[counter] * radArr[i];     // x
          g_cylAry[j+1] = basePosAryY[counter] * radArr[i];     // y
          g_cylAry[j+2] = posArr[i];  // ==z  BOTTOM cap,
          g_cylAry[j+3] = 1.0;  // w.
          // r,g,b = walColr[]        
          g_cylAry[j+4] = colorArr[i][0]; 
          g_cylAry[j+5] = colorArr[i][1]; 
          g_cylAry[j+6] = colorArr[i][2];     
          g_cylAry[j+7] = 1.0;

      }
      else    // position all odd# vertices along the top cap (not yet created)
      {
          g_cylAry[j  ] = basePosAryX[counter] * radArr[i + 1];     // x
          g_cylAry[j+1] = basePosAryY[counter] * radArr[i + 1];     // y
          g_cylAry[j+2] = posArr[i + 1];  // == z TOP cap,
          g_cylAry[j+3] = 1.0;  // w.
          // r,g,b = walColr;
          g_cylAry[j+4] = colorArr[i + 1][0];  
          g_cylAry[j+5] = colorArr[i + 1][1];  
          g_cylAry[j+6] = colorArr[i + 1][2];     
          g_cylAry[j+7] = 1.0;

          counter += 1;
          if (counter >= ringDivs) counter = 0;
      }
    }
  }

  counter = 0;

  // Complete the cylinder with its top cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements.
  for(v=0; v < (2*capVerts +1); v++, j+= g_floatsPerVertex) {
    // count vertices from zero again, and
    if(v%2==0) {  // position even #'d vertices around top cap's outer edge.
      g_cylAry[j  ] = basePosAryX[counter] * radArr[nArr - 1];     // x
      g_cylAry[j+1] = basePosAryY[counter] * radArr[nArr - 1];     // y
      g_cylAry[j+2] = posArr[nArr - 1];  // z
      g_cylAry[j+3] = 1.0;  // w.
      // r,g,b = topColr[]
      g_cylAry[j+4] = colorArr[nArr - 1][0];  
      g_cylAry[j+5] = colorArr[nArr - 1][1];  
      g_cylAry[j+6] = colorArr[nArr - 1][2];  
      g_cylAry[j+7] = 1.0;

      counter += 1;
      if (counter >= ringDivs) counter = 0;
    }
    else {        // position odd#'d vertices at center of the top cap:
      g_cylAry[j  ] = 0.0;      // x,y,z,w == 0,0,-1,1
      g_cylAry[j+1] = 0.0;  
      g_cylAry[j+2] = posArr[nArr - 1]; 
      g_cylAry[j+3] = 1.0;      
      // r,g,b = topColr[]
      g_cylAry[j+4] = colorArr[nArr - 1][0];  
      g_cylAry[j+5] = colorArr[nArr - 1][1];  
      g_cylAry[j+6] = colorArr[nArr - 1][2];  
      g_cylAry[j+7] = 1.0;
    }
  }

  appendObject('Pillar1', g_cylAry, MATL_OBSIDIAN);
}