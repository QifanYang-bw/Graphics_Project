// New Structure

// Every new shape constructor function consists of the following params:
// position, normal, indice



var floatsPerVertex = 7;  // # of Float32Array elements used for each vertex
var floatsPerPosition = 4;

var gndVerts, gndVertsCount = 0;

function makeGroundGrid() {
  //==============================================================================
  // Create a list of vertices that create a large grid of lines in the x,y plane
  // centered at the origin.  Draw this shape using the GL_LINES primitive.

  if (gndVertsCount > 0) return;

  var xcount = 100;     // # of lines to draw in x,y to make the grid.
  var ycount = 100;   
  var xymax = 50.0;     // grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([1.0, 1.0, 0.3]);  // bright yellow
  var yColr = new Float32Array([0.5, 1.0, 0.5]);  // bright green.
  
  gndVertsCount = 2*(xcount+ycount);
  // Create an (global) array to hold this ground-plane's vertices:
  gndVerts = new Float32Array(floatsPerVertex*gndVertsCount);
            // draw a grid made of xcount+ycount lines; 2 vertices per line.
            
  var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
  var ygap = xymax/(ycount-1);    // (why half? because v==(0line number/2))
  
  // First, step thru x values as we make vertical lines of constant-x:
  for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
    if(v%2==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
      gndVerts[j  ] = -xymax + (v  )*xgap;  // x
      gndVerts[j+1] = -xymax;               // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    else {        // put odd-numbered vertices at (xnow, +xymax, 0).
      gndVerts[j  ] = -xymax + (v-1)*xgap;  // x
      gndVerts[j+1] = xymax;                // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    gndVerts[j+4] = xColr[0];     // red
    gndVerts[j+5] = xColr[1];     // grn
    gndVerts[j+6] = xColr[2];     // blu
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
    if(v%2==0) {    // put even-numbered vertices at (-xymax, ynow, 0)
      gndVerts[j  ] = -xymax;               // x
      gndVerts[j+1] = -xymax + (v  )*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    else {          // put odd-numbered vertices at (+xymax, ynow, 0).
      gndVerts[j  ] = xymax;                // x
      gndVerts[j+1] = -xymax + (v-1)*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    gndVerts[j+4] = yColr[0];     // red
    gndVerts[j+5] = yColr[1];     // grn
    gndVerts[j+6] = yColr[2];     // blu
  }
}

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

  var sphVertsCount;

  var slices = 12;   // # of slices of the sphere along the z axis, including 
                    // the south-pole and north pole end caps. ( >=2 req'd)
  var sliceVerts  = 21; // # of vertices around the top edge of the slice
                    // (same number of vertices on bottom of slice, too)
                    // (HINT: odd# or prime#s help avoid accidental symmetry)

  var sliceAngle = Math.PI/slices;  // One slice spans this fraction of the 
  // 180 degree (Pi radian) lattitude angle between south pole and north pole.

  // rray to hold this sphere's vertices:
  var sphVertsCount = (slices*2*(sliceVerts+1)) -2;

  var sphVerts = new Float32Array( sphVertsCount * floatsPerPosition);
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
    for (v = isFirstSlice; v < 2 * (sliceVerts + 1) - isLastSlice; v++, j+=floatsPerPosition)
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
    }
  }

  console.log(sphVertsCount);
  return sphVerts;
}


function initArrayBuffer(gl, buffer, data) {
//-------------------------------------------------------------------------------

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  return;
}

function enableArrayBuffer(gl, buffer, attribute, type, num) {
//-------------------------------------------------------------------------------
  
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}
