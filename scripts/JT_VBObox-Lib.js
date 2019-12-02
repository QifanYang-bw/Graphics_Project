//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)

// Tabs set to 2

/*=====================
  VBObox-Lib.js library: 
  ===================== 
Note that you don't really need 'VBObox' objects for any simple, 
    beginner-level WebGL/OpenGL programs: if all vertices contain exactly 
		the same attributes (e.g. position, color, surface normal), and use 
		the same shader program (e.g. same Vertex Shader and Fragment Shader), 
		then our textbook's simple 'example code' will suffice.
		  
***BUT*** that's rare -- most genuinely useful WebGL/OpenGL programs need 
		different sets of vertices with  different sets of attributes rendered 
		by different shader programs.  THUS a customized VBObox object for each 
		VBO/shader-program pair will help you remember and correctly implement ALL 
		the WebGL/GLSL steps required for a working multi-shader, multi-VBO program.
		
One 'VBObox' object contains all we need for WebGL/OpenGL to render on-screen a 
		set of shapes made from vertices stored in one Vertex Buffer Object (VBO), 
		as drawn by calls to one 'shader program' that runs on your computer's 
		Graphical Processing Unit(GPU), along with changes to values of that shader 
		program's one set of 'uniform' varibles.  
The 'shader program' consists of a Vertex Shader and a Fragment Shader written 
		in GLSL, compiled and linked and ready to execute as a Single-Instruction, 
		Multiple-Data (SIMD) parallel program executed simultaneously by multiple 
		'shader units' on the GPU.  The GPU runs one 'instance' of the Vertex 
		Shader for each vertex in every shape, and one 'instance' of the Fragment 
		Shader for every on-screen pixel covered by any part of any drawing 
		primitive defined by those vertices.
The 'VBO' consists of a 'buffer object' (a memory block reserved in the GPU),
		accessed by the shader program through its 'attribute' variables. Shader's
		'uniform' variable values also get retrieved from GPU memory, but their 
		values can't be changed while the shader program runs.  
		Each VBObox object stores its own 'uniform' values as vars in JavaScript; 
		its 'adjust()'	function computes newly-updated values for these uniform 
		vars and then transfers them to the GPU memory for use by shader program.
EVENTUALLY you should replace 'cuon-matrix-quat03.js' with the free, open-source
   'glmatrix.js' library for vectors, matrices & quaternions: Google it!
		This vector/matrix library is more complete, more widely-used, and runs
		faster than our textbook's 'cuon-matrix-quat03.js' library.  
		--------------------------------------------------------------
		I recommend you use glMatrix.js instead of cuon-matrix-quat03.js
		--------------------------------------------------------------
		for all future WebGL programs. 
You can CONVERT existing cuon-matrix-based programs to glmatrix.js in a very 
    gradual, sensible, testable way:
		--add the glmatrix.js library to an existing cuon-matrix-based program;
			(but don't call any of its functions yet).
		--comment out the glmatrix.js parts (if any) that cause conflicts or in	
			any way disrupt the operation of your program.
		--make just one small local change in your program; find a small, simple,
			easy-to-test portion of your program where you can replace a 
			cuon-matrix object or function call with a glmatrix function call.
			Test; make sure it works. Don't make too large a change: it's hard to fix!
		--Save a copy of this new program as your latest numbered version. Repeat
			the previous step: go on to the next small local change in your program
			and make another replacement of cuon-matrix use with glmatrix use. 
			Test it; make sure it works; save this as your next numbered version.
		--Continue this process until your program no longer uses any cuon-matrix
			library features at all, and no part of glmatrix is commented out.
			Remove cuon-matrix from your library, and now use only glmatrix.

	------------------------------------------------------------------
	VBObox -- A MESSY SET OF CUSTOMIZED OBJECTS--NOT REALLY A 'CLASS'
	------------------------------------------------------------------
As each 'VBObox' object can contain:
  -- a DIFFERENT GLSL shader program, 
  -- a DIFFERENT set of attributes that define a vertex for that shader program, 
  -- a DIFFERENT number of vertices to used to fill the VBOs in GPU memory, and 
  -- a DIFFERENT set of uniforms transferred to GPU memory for shader use.  
  THUS:
		I don't see any easy way to use the exact same object constructors and 
		prototypes for all VBObox objects.  Every additional VBObox objects may vary 
		substantially, so I recommend that you copy and re-name an existing VBObox 
		prototype object, and modify as needed, as shown here. 
		(e.g. to make the VBObox3 object, copy the VBObox2 constructor and 
		all its prototype functions, then modify their contents for VBObox3 
		activities.)

*/

// Written for EECS 351-2,	Intermediate Computer Graphics,
//							Northwestern Univ. EECS Dept., Jack Tumblin
// 2016.05.26 J. Tumblin-- Created; tested on 'TwoVBOs.html' starter code.
// 2017.02.20 J. Tumblin-- updated for EECS 351-1 use for Project C.
// 2018.04.11 J. Tumblin-- minor corrections/renaming for particle systems.
//    --11e: global 'gl' replaced redundant 'myGL' fcn args; 
//    --12: added 'SwitchToMe()' fcn to simplify 'init()' function and to fix 
//      weird subtle errors that sometimes appear when we alternate 'adjust()'
//      and 'draw()' functions of different VBObox objects. CAUSE: found that
//      only the 'draw()' function (and not the 'adjust()' function) made a full
//      changeover from one VBObox to another; thus calls to 'adjust()' for one
//      VBObox could corrupt GPU contents for another.
//      --Created vboStride, vboOffset members to centralize VBO layout in the 
//      constructor function.
//    -- 13 (abandoned) tried to make a 'core' or 'resuable' VBObox object to
//      which we would add on new properties for shaders, uniforms, etc., but
//      I decided there was too little 'common' code that wasn't customized.
//=============================================================================


var floatsPerVertex = 7;  // # of Float32Array elements used for each vertex

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

var sphVerts, sphVertsCount = 0;

function makeSphere2() {
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
//
// (NOTE: you'll get better-looking results if you create a 'makeSphere3() 
// function that uses the 'degenerate stepped spiral' design (Method 3 in 
// lecture notes).
//
  if (sphVertsCount > 0) return;

  var slices =12;   // # of slices of the sphere along the z axis, including 
                    // the south-pole and north pole end caps. ( >=2 req'd)
  var sliceVerts  = 21; // # of vertices around the top edge of the slice
                    // (same number of vertices on bottom of slice, too)
                    // (HINT: odd# or prime#s help avoid accidental symmetry)
  var topColr = new Float32Array([0.3, 0.3, 0.3]);  // South Pole: dark-gray
  var botColr = new Float32Array([0.8, 0.8, 0.8]);  // North Pole: light-gray.
  var errColr = new Float32Array([1.0, 0.2, 0.2]);  // Bright-red trouble colr
  var sliceAngle = Math.PI/slices;  // One slice spans this fraction of the 
  // 180 degree (Pi radian) lattitude angle between south pole and north pole.

  // Create a (global) array to hold this sphere's vertices:
  sphVertsCount = (slices*2*sliceVerts) -2;
  sphVerts = new Float32Array( sphVertsCount  * floatsPerVertex);
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
    if(s==slices-1) isLastSlice=1;// (flag: skip last vertex of the last slice).
    for(v=isFirstSlice;    v< 2*sliceVerts-isLastSlice;   v++,j+=floatsPerVertex)
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
      // finally, set some interesting colors for vertices:
      if(v==0) {  // Troublesome vertex: this vertex gets shared between 3 
      // important triangles; the last triangle of the previous slice, the 
      // anti-diagonal 'step' triangle that connects previous slice and next 
      // slice, and the first triangle of that next slice.  Smooth (Gouraud) 
      // shading of this vertex prevents us from choosing separate colors for 
      // each slice.  For a better solution, use the 'Degenerate Stepped Spiral' 
      // (Method 3) described in the Lecture Notes.
        sphVerts[j+4]=errColr[0]; 
        sphVerts[j+5]=errColr[1]; 
        sphVerts[j+6]=errColr[2];       
        }
      else if(isFirstSlice==1) {  
        sphVerts[j+4]=botColr[0]; 
        sphVerts[j+5]=botColr[1]; 
        sphVerts[j+6]=botColr[2]; 
        }
      else if(isLastSlice==1) {
        sphVerts[j+4]=topColr[0]; 
        sphVerts[j+5]=topColr[1]; 
        sphVerts[j+6]=topColr[2]; 
      }
      else {  // for all non-top, not-bottom slices, set vertex colors randomly
          sphVerts[j+4]= Math.random()/2;   // 0.0 <= red <= 0.5
          sphVerts[j+5]= Math.random()/2;   // 0.0 <= grn <= 0.5 
          sphVerts[j+6]= Math.random()/2;   // 0.0 <= blu <= 0.5          
      }
    }
  }
}

//=============================================================================
//=============================================================================
function VBObox0() {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.

  // Constructor goal: 
  // Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
  // written into code) in all other VBObox functions. Keeping all these (initial)
  // values here, in this one coonstrutor function, ensures we can change them 
  // easily WITHOUT disrupting any other code, ever!
    

  	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
    'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
    //
    'uniform mat4 u_ModelMat0;\n' +
    'attribute vec4 a_Pos0;\n' +
    'attribute vec3 a_Colr0;\n'+
    'varying vec3 v_Colr0;\n' +
    //
    'void main() {\n' +
    '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
    '	 v_Colr0 = a_Colr0;\n' +
    ' }\n';

  	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
    'precision mediump float;\n' +
    'varying vec3 v_Colr0;\n' +
    'void main() {\n' +
    '  gl_FragColor = vec4(v_Colr0, 1.0);\n' + 
    '}\n';

    makeGroundGrid();
  	this.vboContents = gndVerts;

  	this.vboVerts = gndVertsCount;						// # of vertices held in 'vboContents' array
  	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
  	                              // bytes req'd by 1 vboContents array element;
  																// (why? used to compute stride and offset 
  																// in bytes for vertexAttribPointer() calls)
    this.vboBytes = this.vboContents.length * this.FSIZE;               
                                  // total number of bytes stored in vboContents
                                  // (#  of floats in vboContents array) * 
                                  // (# of bytes/float).
  	this.vboStride = this.vboBytes / this.vboVerts; 
  	                              // (== # of bytes to store one complete vertex).
  	                              // From any attrib in a given vertex in the VBO, 
  	                              // move forward by 'vboStride' bytes to arrive 
  	                              // at the same attrib for the next vertex. 
    

  	            //----------------------Attribute sizes
    this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                  // attribute named a_Pos0. (4: x,y,z,w values)
    this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 

    console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                    this.vboFcount_a_Colr0) *   // every attribute in our VBO
                    this.FSIZE == this.vboStride, // for agreeement with'stride'
                    "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

                //----------------------Attribute offsets  
  	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
  	                              // of 1st a_Pos0 attrib value in vboContents[]
    this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                  // (4 floats * bytes/float) 
                                  // # of bytes from START of vbo to the START
                                  // of 1st a_Colr0 attrib value in vboContents[]
  	            //-----------------------GPU memory locations:
  	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
  	                              // returned by gl.createBuffer() function call
  	this.shaderLoc;								// GPU Location for compiled Shader-program  
  	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
  								          //------Attribute locations in our shaders:
  	this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
  	this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

  	            //---------------------- Uniform locations &values in our shaders
  	this.ModelMat = new Matrix4();	// Transforms CVV axes to model axes.
  	this.u_ModelMatLoc;							// GPU location for u_ModelMat uniform
}

VBObox0.prototype.init = function() {
  //=============================================================================
  // Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
  // kept in this VBObox. (This function usually called only once, within main()).
  // Specifically:
  // a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
  //  executable 'program' stored and ready to use inside the GPU.  
  // b) create a new VBO object in GPU memory and fill it by transferring in all
  //  the vertex data held in our Float32array member 'VBOcontents'. 
  // c) Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
  // -------------------
  // CAREFUL!  before you can draw pictures using this VBObox contents, 
  //  you must call this VBObox object's switchToMe() function too!
  //--------------------
  // a) Compile,link,upload shaders-----------------------------------------------
  	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  	if (!this.shaderLoc) {
      console.log(this.constructor.name + 
      						'.init() failed to create executable Shaders on the GPU. Bye!');
      return;
    }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.

  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //    use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:---------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(),etc.)
  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
	this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.u_ModelMatLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }  
}

VBObox0.prototype.switchToMe = function() {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.

  // a) select our shader program:
  gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
  	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos0);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Colr0);
  							
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
  //==============================================================================
  // Returns 'true' if our WebGL rendering context ('gl') is ready to render using
  // this objects VBO and shader program; else return false.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

  var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
  //==============================================================================
  // Update the GPU to newer, current values we now store for 'uniform' vars on 
  // the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  

  this.ModelMat = popMatrix();
  pushMatrix(this.ModelMat);
  
  this.ModelMat.translate( 0, -0, 0.0);  
  this.ModelMat.scale(0.1, 0.1, 0.1);       // shrink by 10X:
  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  										false, 				// use matrix transpose instead?
  										this.ModelMat.elements);	// send data from Javascript.
  // Adjust the attributes' stride and offset (if necessary)
  // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
}

VBObox0.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  

  // Draw just the ground-plane's vertices
  gl.drawArrays(gl.LINES,                 // use this drawing primitive, and
                0, // start at this vertex number, and
                this.vboVerts); // draw this many vertices.
}

VBObox0.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU inside our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO

}
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox1() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WIsTHOUT disrupting any other code, ever!

    this.VERT_SRC = //--------------------- VERTEX SHADER source code 
  'precision highp float;\n' +        // req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Pos1;\n' +
  'attribute vec3 a_Colr1;\n'+
  'varying vec3 v_Colr1;\n' +
  //
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Pos1;\n' +
  '  v_Colr1 = a_Colr1;\n' + 
  ' }\n';
/*
 // SQUARE dots:
  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
  '}\n';
*/
/*
 // ROUND FLAT dots:
  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
  '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' + 
  '  if(dist < 0.5) {\n' +
  '    gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
  '    } else {discard;};' +
  '}\n';
*/
 // SHADED, sphere-like dots:
  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
    '  gl_FragColor = vec4(v_Colr1, 1.0);\n' + 
    '}\n';

  makeSphere2();
	this.vboContents = sphVerts;
  
	this.vboVerts = sphVertsCount;							// # of vertices held in 'vboContents' array;
	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
	                              // bytes req'd by 1 vboContents array element;
																// (why? used to compute stride and offset 
																// in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
	this.vboStride = this.vboBytes / this.vboVerts;     
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex.
	                               
	            //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
  this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                  this.vboFcount_a_Colr1) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
	this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
	                              // of 1st a_Pos1 attrib value in vboContents[]
  this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Colr1 attrib value in vboContents[]
  // this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
  //                           this.vboFcount_a_Colr1) * this.FSIZE; 
                                // == 7 floats * bytes/float
                                // # of bytes from START of vbo to the START
                                // of 1st a_PtSize attrib value in vboContents[]

	            //-----------------------GPU memory locations:                                
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_Pos1Loc;							  // GPU location: shader 'a_Pos1' attribute
	this.a_Colr1Loc;							// GPU location: shader 'a_Colr1' attribute
	// this.a_PtSiz1Loc;							// GPU location: shader 'a_PtSiz1' attribute
	
	            //---------------------- Uniform locations &values in our shaders
	this.ModelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
	this.u_ModelMatrixLoc;						// GPU location for u_ModelMat uniform
};


VBObox1.prototype.init = function() {
//==============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.
  											
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.  
  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //	(see OpenGL ES specification for more info).  Your choices are:
  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents rarely or never change.
  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //				contents may change often as our program runs.
  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
  // 			times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:-----------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos1');
    return -1;	// error exit.
  }
 	this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
  if(this.a_Colr1Loc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr1');
    return -1;	// error exit.
  }
  // this.a_PtSiz1Loc = gl.getAttribLocation(this.shaderLoc, 'a_PtSiz1');
  // if(this.a_PtSiz1Loc < 0) {
  //   console.log(this.constructor.name + 
	 //    					'.init() failed to get the GPU location of attribute a_PtSiz1');
	 //  return -1;	// error exit.
  // }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
}

VBObox1.prototype.switchToMe = function () {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.

  // a) select our shader program:
    gl.useProgram(this.shaderLoc);	
  //		Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
  	gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
  										this.vboLoc);			// the ID# the GPU uses for our VBO.

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    // 	Here's how to use the almost-identical OpenGL version of this function:
  	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
		this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,		  // type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos1);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
                         gl.FLOAT, false, 
  						           this.vboStride,  this.vboOffset_a_Colr1);
  // gl.vertexAttribPointer(this.a_PtSiz1Loc,this.vboFcount_a_PtSiz1, 
  //                        gl.FLOAT, false, 
		// 					           this.vboStride,	this.vboOffset_a_PtSiz1);	
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  gl.enableVertexAttribArray(this.a_Colr1Loc);
  // gl.enableVertexAttribArray(this.a_PtSiz1Loc);
}

VBObox1.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox1.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);
  
  this.ModelMatrix.translate( 0.0, 0.0, 0.0); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  this.ModelMatrix.scale(0.25, 0.25, 0.25);
              // Make it smaller:
  this.ModelMatrix.rotate(g_angleNow1 % 360.0, 1, 0, 1);  // Spin on XY diagonal axis
  this.ModelMatrix.rotate((g_angleNow1/3) % 360.0, -1,1,0); // and at different rate on -X,Y

  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,	// GPU location of the uniform
  										false, 										// use matrix transpose instead?
  										this.ModelMatrix.elements);	// send data from Javascript.
}

VBObox1.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                0, // start at this vertex number, and 
                this.vboVerts); // draw this many vertices.

}


VBObox1.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}

/*
VBObox1.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox1.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
function VBObox2() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox2' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  

    this.VERT_SRC = //--------------------- VERTEX SHADER source code 
  'precision highp float;\n' +        // req'd in OpenGL ES if we use 'float'
  //
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Pos1;\n' +
  'attribute vec3 a_Colr1;\n'+
  'varying vec3 v_Colr1;\n' +
  //
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Pos1;\n' +
  '  v_Colr1 = a_Colr1;\n' + 
  ' }\n';
 // SHADED, sphere-like dots:
  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
  'precision mediump float;\n' +
  'varying vec3 v_Colr1;\n' +
  'void main() {\n' +
    '  gl_FragColor = vec4(v_Colr1, 1.0);\n' + 
    '}\n';

  makeSphere2();
  this.vboContents = sphVerts;
  
  this.vboVerts = sphVertsCount;              // # of vertices held in 'vboContents' array;
  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;  
                                // bytes req'd by 1 vboContents array element;
                                // (why? used to compute stride and offset 
                                // in bytes for vertexAttribPointer() calls)
  this.vboBytes = this.vboContents.length * this.FSIZE;               
                                // (#  of floats in vboContents array) * 
                                // (# of bytes/float).
  this.vboStride = this.vboBytes / this.vboVerts;     
                                // (== # of bytes to store one complete vertex).
                                // From any attrib in a given vertex in the VBO, 
                                // move forward by 'vboStride' bytes to arrive 
                                // at the same attrib for the next vertex.
                                 
              //----------------------Attribute sizes
  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos1. (4: x,y,z,w values)
  this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
                  this.vboFcount_a_Colr1) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
                  
              //----------------------Attribute offsets
  this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
                                // of 1st a_Pos1 attrib value in vboContents[]
  this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
                                // == 4 floats * bytes/float
                                //# of bytes from START of vbo to the START
                                // of 1st a_Colr1 attrib value in vboContents[]
  // this.vboOffset_a_PtSiz1 =(this.vboFcount_a_Pos1 +
  //                           this.vboFcount_a_Colr1) * this.FSIZE; 
                                // == 7 floats * bytes/float
                                // # of bytes from START of vbo to the START
                                // of 1st a_PtSize attrib value in vboContents[]

              //-----------------------GPU memory locations:                                
  this.vboLoc;                  // GPU Location for Vertex Buffer Object, 
                                // returned by gl.createBuffer() function call
  this.shaderLoc;               // GPU Location for compiled Shader-program  
                                // set by compile/link of VERT_SRC and FRAG_SRC.
                          //------Attribute locations in our shaders:
  this.a_Pos1Loc;               // GPU location: shader 'a_Pos1' attribute
  this.a_Colr1Loc;              // GPU location: shader 'a_Colr1' attribute
  // this.a_PtSiz1Loc;              // GPU location: shader 'a_PtSiz1' attribute
  
              //---------------------- Uniform locations &values in our shaders
  this.ModelMatrix = new Matrix4(); // Transforms CVV axes to model axes.
  this.u_ModelMatrixLoc;            // GPU location for u_ModelMat uniform
};


VBObox2.prototype.init = function() {
//==============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(this.constructor.name + 
                '.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

  gl.program = this.shaderLoc;    // (to match cuon-utils.js -- initShaders())

  // b) Create VBO on GPU, fill it------------------------------------------------
  this.vboLoc = gl.createBuffer();  
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
                '.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //  == "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //  == "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,        // GLenum 'target' for this GPU buffer 
                  this.vboLoc);         // the ID# the GPU uses for this buffer.
                        
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //   use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER,        // GLenum target(same as 'bindBuffer()')
                  this.vboContents,     // JavaScript Float32Array
                  gl.STATIC_DRAW);      // Usage hint.  
  //  The 'hint' helps GPU allocate its shared memory for best speed & efficiency
  //  (see OpenGL ES specification for more info).  Your choices are:
  //    --STATIC_DRAW is for vertex buffers rendered many times, but whose 
  //        contents rarely or never change.
  //    --DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
  //        contents may change often as our program runs.
  //    --STREAM_DRAW is for vertex buffers that are rendered a small number of 
  //      times and then discarded; for rapidly supplied & consumed VBOs.

  // c1) Find All Attributes:-----------------------------------------------------
  //  Find & save the GPU location of all our shaders' attribute-variables and 
  //  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
  this.a_Pos1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Pos1');
  if(this.a_Pos1Loc < 0) {
    console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Pos1');
    return -1;  // error exit.
  }
  this.a_Colr1Loc = gl.getAttribLocation(this.shaderLoc, 'a_Colr1');
  if(this.a_Colr1Loc < 0) {
    console.log(this.constructor.name + 
                '.init() failed to get the GPU location of attribute a_Colr1');
    return -1;  // error exit.
  }
  // this.a_PtSiz1Loc = gl.getAttribLocation(this.shaderLoc, 'a_PtSiz1');
  // if(this.a_PtSiz1Loc < 0) {
  //   console.log(this.constructor.name + 
   //             '.init() failed to get the GPU location of attribute a_PtSiz1');
   //  return -1; // error exit.
  // }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.u_ModelMatrixLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.u_ModelMatrixLoc) { 
    console.log(this.constructor.name + 
                '.init() failed to get GPU location for u_ModelMatrix uniform');
    return;
  }
}

VBObox2.prototype.switchToMe = function () {
  //==============================================================================
  // Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
  //
  // We only do this AFTER we called the init() function, which does the one-time-
  // only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
  // even then, you are STILL not ready to draw our VBObox's contents onscreen!
  // We must also first complete these steps:
  //  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
  //  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
  //  c) tell the GPU to connect the shader program's attributes to that VBO.

  // a) select our shader program:
    gl.useProgram(this.shaderLoc);  
  //    Each call to useProgram() selects a shader program from the GPU memory,
  // but that's all -- it does nothing else!  Any previously used shader program's 
  // connections to attributes and uniforms are now invalid, and thus we must now
  // establish new connections between our shader program's attributes and the VBO
  // we wish to use.  
    
  // b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
  //  instead connect to our own already-created-&-filled VBO.  This new VBO can 
  //    supply values to use as attributes in our newly-selected shader program:
    gl.bindBuffer(gl.ARRAY_BUFFER,      // GLenum 'target' for this GPU buffer 
                      this.vboLoc);     // the ID# the GPU uses for our VBO.

  // c) connect our newly-bound VBO to supply attribute variable values for each
  // vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
  // this sets up data paths from VBO to our shader units:
    //  Here's how to use the almost-identical OpenGL version of this function:
    //    http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
    this.a_Pos1Loc,//index == ID# for the attribute var in GLSL shader pgm;
    this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
    gl.FLOAT,     // type == what data type did we use for those numbers?
    false,        // isNormalized == are these fixed-point values that we need
                  //                  normalize before use? true or false
    this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
                  // stored attrib for this vertex to the same stored attrib
                  //  for the next vertex in our VBO.  This is usually the 
                  // number of bytes used to store one complete vertex.  If set 
                  // to zero, the GPU gets attribute values sequentially from 
                  // VBO, starting at 'Offset'. 
                  // (Our vertex size in bytes: 4 floats for pos + 3 for color)
    this.vboOffset_a_Pos1);           
                  // Offset == how many bytes from START of buffer to the first
                  // value we will actually use?  (we start with position).
  gl.vertexAttribPointer(this.a_Colr1Loc, this.vboFcount_a_Colr1,
                         gl.FLOAT, false, 
                         this.vboStride,  this.vboOffset_a_Colr1);
  // gl.vertexAttribPointer(this.a_PtSiz1Loc,this.vboFcount_a_PtSiz1, 
  //                        gl.FLOAT, false, 
    //                     this.vboStride,  this.vboOffset_a_PtSiz1); 
  //-- Enable this assignment of the attribute to its' VBO source:
  gl.enableVertexAttribArray(this.a_Pos1Loc);
  gl.enableVertexAttribArray(this.a_Colr1Loc);
  // gl.enableVertexAttribArray(this.a_PtSiz1Loc);
}

VBObox2.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
                '.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
              '.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function() {
//=============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update the VBO's contents, and (if needed) each 
// attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }

  this.ModelMatrix = popMatrix();
  pushMatrix(this.ModelMatrix);
  
  this.ModelMatrix.translate(0, 0, 0.5); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  this.ModelMatrix.scale(0.2, 0.2, 0.2);
              // Make it smaller:
  this.ModelMatrix.rotate(g_angleNow2 % 360.0, 0, 1, 1);  // 
  this.ModelMatrix.rotate((g_angleNow2/3) % 360.0, 1,-1,0); // 

  //  Transfer new uniforms' values to the GPU:-------------
  // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  gl.uniformMatrix4fv(this.u_ModelMatrixLoc,  // GPU location of the uniform
                      false,                    // use matrix transpose instead?
                      this.ModelMatrix.elements); // send data from Javascript.
}


VBObox2.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
              '.draw() call you needed to call this.switchToMe()!!');
  }

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                0, // start at this vertex number, and 
                this.vboVerts); // draw this many vertices.
}

VBObox2.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// 'vboContents' to our VBO, but without changing any GPU memory allocations.
  											
 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                  0,                  // byte offset to where data replacement
                                      // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
}
/*
VBObox2.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox2.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/

//=============================================================================
//=============================================================================
//=============================================================================