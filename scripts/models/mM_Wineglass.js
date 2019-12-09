function makeWineGlass() {
//==============================================================================
// Make a sphere from one TRIANGLE_STRIP drawing primitive,  using the
// 'stepped spiral' design (Method 2) described in the class lecture notes.   
// Sphere radius==1.0, centered at the origin, with 'south' pole at 
// (x,y,z) = (0,0,-1) and 'north' pole at (0,0,+1).  The tri-strip starts at the
// south-pole end-cap spiraling upwards (in +z direction) in CCW direction as  
// viewed from the origin looking down (from inside the sphere). 
// Between the south end-cap and the north, it creates ring-like 'slices' that 
// defined by parallel planes of constant z.  Each slice of the tri-strip 
// makes up an equal-lattitude portion of the sphere, and the stepped-spiral
// slices follow the same design used to the makeCylinder2() function.
//
// (NOTE: you'll get better-looking results if you create a 'makeSphere3() 
// function that uses the 'degenerate stepped spiral' design (Method 3 in 
// lecture notes).
//

  var slices = 18;   // # of slices of the sphere along the z axis, including 
                    // the south-pole and north pole end caps. ( >=2 req'd)
  var sliceVerts  = 21; // # of vertices around the top edge of the slice
                    // (same number of vertices on bottom of slice, too)
                    // (HINT: odd# or prime#s help avoid accidental symmetry)
  // var topColr = new Float32Array([0.3, 0.3, 0.3]);  // South Pole: dark-gray
  // var botColr = new Float32Array([0.8, 0.8, 0.8]);  // North Pole: light-gray.
  // var errColr = new Float32Array([1.0, 0.2, 0.2]);  // Bright-red trouble colr
  var sliceAngle = Math.PI/slices;  // One slice spans this fraction of the 
  // 180 degree (Pi radian) lattitude angle between south pole and north pole.

  // Create a (global) array to hold this sphere's vertices:
  var g_glsAry = new Float32Array(  ((slices*2*sliceVerts) -2) * g_floatsPerVertex);

                    // # of vertices * # of elements needed to store them. 
                    // Each end-cap slice requires (2*sliceVerts -1) vertices 
                    // and each slice between them requires (2*sliceVerts).
  // Create the entire sphere as one single tri-strip array. This first for() 
  //loop steps through each 'slice', and the for() loop it contains steps 
  //through each vertex in the current slice.
  // INITIALIZE:
  var cosBot = 0.0;         // cosine and sine of the lattitude angle for
  var sinBot = 0.0;         //  the current slice's BOTTOM (southward) edge. 
  // (NOTE: Lattitude = 0 @equator; -90deg @south pole; +90deg at north pole)
  var cosTop = 0.0;         // "  " " for current slice's TOP (northward) edge
  var sinTop = 0.0;
  // for() loop's s var counts slices; 
  //          its v var counts vertices; 
  //          its j var counts Float32Array elements 
  //          (vertices * elements per vertex)  
  var j = 0;              // initialize our array index
  var isFirstSlice = 1;   // ==1 ONLY while making south-pole slice; 0 otherwise
  var isLastSlice = 0;    // ==1 ONLY while making north-pole slice; 0 otherwise

  var LastTri; // Set special for the first edge slice

  var gradient = [[0, .376, 0, .027, 1.0],
                  [1, .49, .027, .32, 1.0],
                  [4, .494, .462, .612, 1.0],
                  [11, .72, .84, .98, 1.0],
                  [17, .762, .754, .756, 1.0]];

  // var gradient = [[0, 0.9, 0.0, 0.0], [7, 0.0, 0.9, 0.0], [10, 0.0, 0.0, 0.8], [11, 0.9, 0.9, 0.9]];

  var colorTracker = 0;
  var currentColor;
  var x;

  for(s=0; s<slices; s++) { // for each slice of the sphere,---------------------
    // For current slice's top & bottom edges, find lattitude angle sin,cos:
    if(s==0) {
      isFirstSlice = 1;   // true ONLY when we're creating the south-pole slice
      cosBot =  0.0;      // initialize: first slice's lower edge is south pole.
      sinBot = -0.5;      // (cos(lat) sets slice diameter; sin(lat) sets z )
    }
    else {          // otherwise, set new bottom edge == old top edge
      isFirstSlice = 0; 
      cosBot = cosTop;
      sinBot = sinTop;
    }               // then compute sine,cosine of lattitude of new top edge.
    cosTop = Math.cos((-Math.PI/2) +(s+1)*sliceAngle + Math.PI/3); 
    sinTop = Math.sin((-Math.PI/2) +(s+1)*sliceAngle + Math.PI/12);

    if(s==slices-1) isLastSlice=1;// (flag: skip last vertex of the last slice).

    // Edit currentColor based on colorTracker
    currentColor = [0, 0, 0, 0];
    for (x = 1; x <= 4; x++) {
      currentColor[x - 1] = gradient[colorTracker][x] + 
        (gradient[colorTracker + 1][x] - gradient[colorTracker][x]) * 
        (s - gradient[colorTracker][0]) /
        (gradient[colorTracker + 1][0] - gradient[colorTracker][0]);
    }
    // console.log(s, currentColor, gradient[colorTracker]);
    if (s < slices - 1) {
      if (s == gradient[colorTracker + 1][0]) {colorTracker += 1;};
    };

    for(v=isFirstSlice;    v< 2*sliceVerts-isLastSlice;   v++,j+=g_floatsPerVertex)
    {

      LastTri = s == 1 && v == 0;
                // for each vertex of this slice,
      if(v%2 ==0) { // put vertices with even-numbered v at slice's bottom edge;
                    // by circling CCW along longitude (east-west) angle 'theta':
                    // (0 <= theta < 360deg, increases 'eastward' on sphere).
                    // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                    // where      theta = 2*PI*(v/2)/capVerts = PI*v/capVerts
        g_glsAry[j  ] = cosBot * Math.cos(Math.PI * v/sliceVerts);  // x
        g_glsAry[j+1] = cosBot * Math.sin(Math.PI * v/sliceVerts);  // y
        g_glsAry[j+2] = sinBot;                                     // z
        g_glsAry[j+3] = 1.0;                                        // w.       
      }
      else {  // put vertices with odd-numbered v at the the slice's top edge
              // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
              // and thus we can simplify cos(2*PI* ((v-1)/2)*sliceVerts)
              // (why (v-1)? because we want longitude angle 0 for vertex 1).  
        g_glsAry[j  ] = cosTop * Math.cos(Math.PI * (v-1)/sliceVerts);  // x
        g_glsAry[j+1] = cosTop * Math.sin(Math.PI * (v-1)/sliceVerts);  // y
        g_glsAry[j+2] = sinTop;   // z
        g_glsAry[j+3] = 1.0;  
      }


      // console.log(currentColor);
      for (x = 0; x <= 3; x++) {
        g_glsAry[j + x + 4] = currentColor[x]; 
      }
      // console.log(g_glsAry);
    }
  }

  appendObject('WineGlass', g_glsAry);
}