//23456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
//
// PointLightedSphere_perFragment.js (c) 2012 matsuda and kanda
// MODIFIED for EECS 351-1, Northwestern Univ. Jack Tumblin:
//
//    Completed the Blinn-Phong lighting model: add emissive and specular:
//    --Ke, Ka, Kd, Ks: K==Reflectance; emissive, ambient, diffuse, specular.
//    --Kshiny: specular exponent for 'shinyness'.
//    --Ia, Id, Is:   I==Illumination:          ambient, diffuse, specular.
//    -- Implemented Blinn-Phong 'half-angle' specular term (from class)
//
//  JTSecondLight_perFragment.js:
//  Version 01: Same as JTPointBlinnPhongSphere_perFragment.js
//  Version 02: add mouse, keyboard callbacks with on-screen display.
//  Version 03: add 'draw()' function (ugly!) to call whenever we need to 
//              re-draw the screen (e.g. after mouse-drag). Convert all 'handles'
//              for GPU storage locations (supplied by gl.getUniformLocation() 
//              to GLOBAL vars to prevent large argument lists for the draw() 
//              fcn.  Apply K_shiny uniform in GLSL using pow() fcn; test it
//              with K_shiny values of 10 and 100.
//  Version 04: eliminate arguments to 'draw()' function by converting them to
//              'global' variables; then we can call 'draw()' from any fcn.  
//              In keypress() fcn, make s/S keys decrease/increase K_shiny by 1
//              and call the 'draw()' function to show result on-screen. 
//              Add JavaScript global variables for existing lamp0 uniforms;
//              (Temporarily) use mouse-drag to modify lamp0 position & redraw;
//              and make 'clear' button re-set the lamp0 position.
//              Note how AWKWARDLY mouse-dragging moved the light: can we fix it?
//  Version 05: YES! first, lets' understand what we see on-screen:
//            --Prev. versions set Camera position to (6,0,0) in world coords,  
//              (eyeWorldPos[] value set in main()), aimed at origin, 'up'==+z.
//              THUS camera's x,y axes are aligned with world-space y,z axes! 
//            --Prev. versions set lamp0Pos[] to world coords (6,6,0) in main(),
//              thus it's on-screen location is center-right.  Our mouseDrag() 
//              code causes left/right drag to adjust lamp0 +/-x in world space, 
//              (towards/away from camera), and up/down drag adjusts lamp0 +/-y 
//              (left/right on-screen). No wonder the result looks weird!
//              FIX IT: change mouseDrag() to map x,y drags to lamp0 y,z values
//                instead of x,y.  We will keep x value fixed at +6, so that
//                mouse-drags move lamp0 in the same yz plane as the camera.
//                ALSO -- change lamp0 position to better-looking (6,5,5). 
//                (don't forget HTML button handler 'clearDrag()' fcn below).
//  Version 06: Create GLSL struct 'LampT' & prove we can use it as a uniform
//              that affects Vertex Shader's on-screen result (see version0 6a)
//              In Fragment shader, create a 1-element array of 'LampT' structs 
//              and use it to replace the uniforms for 'lamp0' (see version 06b)
//              --Best way to create a JavaScript 'Lamp' object?
//              --Best way to transfer contents to GLSL? GLSL 'Lamp' struct?
//                (try: https://www.opengl.org/wiki/Uniform_%28GLSL%29 
//              --find 'struct Thingy', note how uniforms set struct contents
//                in sequential locations, and/or fill them as arrays...
// (try: http://wiki.lwjgl.org/wiki/GLSL_Tutorial:_Communicating_with_Shaders)
//  Version 07: In JavaScript, use the 'materials_Ayerdi.js' library to replace 
//              the individual 'matl0_K...' global vars with a new 'materials' 
//              object made of MATL_RED_PLASTIC called 'matl0' (ver. 07a).
//              Update keypress() so that the 'm' key will change material of
//              the sphere; move the uniform-setting for lights and materials
//              out of main() and into the 'draw()' function: (ver. 07b)
//  Version 08: In JavaScript, create a 'lightsT' object to hold all data 
//              needed or used by one light source of any kind; put all its
//              functions in a separate 'lights-JT.js' library (see HTML file:
//              load this 'library' along with cuon-matrix-quat.js, etc).
//              Create just one lightsT object called 'lamp0' to test.
//  Version 09: Create GLSL struct 'MatlT'; test it. Create a 1-element array of 
//              'MatlT' structs in the Fragment Shader and  use element 0 of 
//              that array to replace our misc reflectance uniforms.
//  Version 10: In Javascript, improve 'Materials_Ayerdi.js': add a set() member
//              function to choose new materials without discarding the object 
//              (as we did for the 'm' key in keypress()).  Then add new member
//              variables to hold uniform's GPU locations (as in LightsT);
//              to eliminate the last materials global vars. (Ver 10b)
//
//  STILL TO DO:
//              --add direction/spotlight mode (Lengyel, Section 7.2.4 pg. 160)
//              by adding a 'look-at' point member.
//              --add a user-interface to aim the spotlight ('glass cylinder'?) 
//              --add a new light that recreates the Version 01 light at (6,6,0).
//              --add user-interface to (fixed) light at (6,6,0).  How shall we 
//              organize MULTIPLE lights (up to 8?) by object-oriented methods?

//      --Further object-oriented re-organizing: can we make objects for 
//        User-Interface? Shapes? Cameras? Textures? Animation? can we fit them 
//        all inside just a 'Scene' object, and use that as our program's
//        one-and-only global variable?

//=============================================================================
// Vertex shader program
//=============================================================================


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