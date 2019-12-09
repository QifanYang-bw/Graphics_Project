
function makeSphere() {
  //=================s=============================================================
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

  // Based on the original code, this one patches the 'erroreous' fragment on 
  // each layer.

  var slices = 12;   // # of slices of the sphere along the z axis, including 
                    // the south-pole and north pole end caps. ( >=2 req'd)
  var sliceVerts  = 21; // # of vertices around the top edge of the slice
                    // (same number of vertices on bottom of slice, too)
                    // (HINT: odd# or prime#s help avoid accidental symmetry)

  var sliceAngle = Math.PI/slices;  // One slice spans this fraction of the 
  // 180 degree (Pi radian) lattitude angle between south pole and north pole.

  // rray to hold this sphere's vertices:
  var sphVertsCount = (slices*2*(sliceVerts+1)) -2;

  var sphVerts = new Float32Array( sphVertsCount * g_floatsPerVertex);
                    // # of vertices * # of elements needed to store them. 
                    // Each end-cap slice requires (2*sliceVerts -1) vertices 
                    // and each slice between them requires (2*sliceVerts).

  // Create the entire sphere as one single tri-strip array. This first for() loop steps through each 'slice', and the for() loop it contains steps through each vertex in the current slice.
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


  var color = new Float32Array([0.6, 0.0, 0.0, 1.0]);  // South Pole: dark-gray

  var j = 0;              // initialize our array index
  var isFirstSlice = 1;   // ==1 ONLY while making south-pole slice; 0 otherwise
  var isLastSlice = 0;    // ==1 ONLY while making north-pole slice; 0 otherwise

  for(s=0; s<slices; s++) { // for each slice of the sphere,---------------------
    // For current slice's top & bottom edges, find lattitude angle sin,cos:
    if(s==0) {
      isFirstSlice = 1;   // true ONLY when we're creating the south-pole slice
      cosBot =  0.0;      // initialize: first slice's lower edge is south pole.
      sinBot = -1.0;      // (cos(lat) sets slice diameter; sin(lat) sets z )
    }
    else {          // otherwise, set new bottom edge == old top edge
      isFirstSlice = 0; 
      cosBot = cosTop;
      sinBot = sinTop;
    }               // then compute sine,cosine of lattitude of new top edge.
    cosTop = Math.cos((-Math.PI/2) +(s+1)*sliceAngle); 
    sinTop = Math.sin((-Math.PI/2) +(s+1)*sliceAngle);
    // (NOTE: Lattitude = 0 @equator; -90deg @south pole; +90deg at north pole)
    // (       use cos(lat) to set slice radius, sin(lat) to set slice z coord)
    // Go around entire slice; start at x axis, proceed in CCW direction 
    // (as seen from origin inside the sphere), generating TRIANGLE_STRIP verts.
    // The vertex-counter 'v' starts at 0 at the start of each slice, but:
    // --the first slice (the South-pole end-cap) begins with v=1, because
    //    its first vertex is on the TOP (northwards) side of the tri-strip
    //    to ensure correct winding order (tri-strip's first triangle is CCW
    //    when seen from the outside of the sphere).
    // --the last slice (the North-pole end-cap) ends early (by one vertex)
    //    because its last vertex is on the BOTTOM (southwards) side of slice.
    //
    if (s == slices-1) isLastSlice=1;// (flag: skip last vertex of the last slice).
    for (v = isFirstSlice; v < 2 * (sliceVerts + 1) - isLastSlice; v++, j+=g_floatsPerVertex)
    {           // for each vertex of this slice,
      if(v%2 ==0) { // put vertices with even-numbered v at slice's bottom edge;
                    // by circling CCW along longitude (east-west) angle 'theta':
                    // (0 <= theta < 360deg, increases 'eastward' on sphere).
                    // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                    // where      theta = 2*PI*(v/2)/capVerts = PI*v/capVerts
        sphVerts[j  ] = cosBot * Math.cos(Math.PI * v/sliceVerts);  // x
        sphVerts[j+1] = cosBot * Math.sin(Math.PI * v/sliceVerts);  // y
        sphVerts[j+2] = sinBot;                                     // z
        sphVerts[j+3] = 1.0;                                        // w.       
      }
      else {  // put vertices with odd-numbered v at the the slice's top edge
              // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
              // and thus we can simplify cos(2*PI* ((v-1)/2)*sliceVerts)
              // (why (v-1)? because we want longitude angle 0 for vertex 1).  
        sphVerts[j  ] = cosTop * Math.cos(Math.PI * (v-1)/sliceVerts);  // x
        sphVerts[j+1] = cosTop * Math.sin(Math.PI * (v-1)/sliceVerts);  // y
        sphVerts[j+2] = sinTop;   // z
        sphVerts[j+3] = 1.0;  
      }

      sphVerts[j+4]=color[0]; 
      sphVerts[j+5]=color[1]; 
      sphVerts[j+6]=color[2]; 
      sphVerts[j+7]=color[3]; 

    }
  }

  appendObject('Sphere', sphVerts);
}