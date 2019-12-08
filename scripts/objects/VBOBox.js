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
//              Add JavaScript global variables for existing lightSource[0] uniforms;
//              (Temporarily) use mouse-drag to modify lightSource[0] position & redraw;
//              and make 'clear' button re-set the lightSource[0] position.
//              Note how AWKWARDLY mouse-dragging moved the light: can we fix it?
//  Version 05: YES! first, lets' understand what we see on-screen:
//            --Prev. versions set Camera position to (6,0,0) in world coords,  
//              (eyeWorldPos[] value set in main()), aimed at origin, 'up'==+z.
//              THUS camera's x,y axes are aligned with world-space y,z axes! 
//            --Prev. versions set lightSource[0]Pos[] to world coords (6,6,0) in main(),
//              thus it's on-screen location is center-right.  Our mouseDrag() 
//              code causes left/right drag to adjust lightSource[0] +/-x in world space, 
//              (towards/away from camera), and up/down drag adjusts lightSource[0] +/-y 
//              (left/right on-screen). No wonder the result looks weird!
//              FIX IT: change mouseDrag() to map x,y drags to lightSource[0] y,z values
//                instead of x,y.  We will keep x value fixed at +6, so that
//                mouse-drags move lightSource[0] in the same yz plane as the camera.
//                ALSO -- change lightSource[0] position to better-looking (6,5,5). 
//                (don't forget HTML button handler 'clearDrag()' fcn below).
//  Version 06: Create GLSL struct 'LampT' & prove we can use it as a uniform
//              that affects Vertex Shader's on-screen result (see version0 6a)
//              In Fragment shader, create a 1-element array of 'LampT' structs 
//              and use it to replace the uniforms for 'lightSource[0]' (see version 06b)
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
//              Create just one lightsT object called 'lightSource[0]' to test.
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

// global vars that contain the values we send thru those uniforms,
//  ... for our camera:
var eyePosWorld = new Float32Array(3);  // x,y,z in world coords

  // ... for our first material:
var matlSel= MATL_RED_PLASTIC;        // see keypress(): 'm' key changes matlSel
var matl0 = new Material(matlSel);  
//  ... for our first light source:   (stays false if never initialized)

var shaders = new shaderLib();

function VBObox(sn, vertexShader, fragmentShader) {
  //=============================================================================
  //=============================================================================
  // CONSTRUCTOR for one re-usable 'VBObox' object that holds all data and fcns
  // needed to render vertices from one Vertex Buffer Object (VBO) using one 
  // separate shader program (a vertex-shader & fragment-shader pair) and one
  // set of 'uniform' variables.

  //=============================================================================
  // Vertex shader program: Phong Shading
  //=============================================================================
  // Reason for adding a '1':
  // https://gamedev.stackexchange.com/questions/61257/glsl-declaring-global-variables-outside-of-the-main-function-scope

  this.sn = sn;

  shaders.setShader(vertexShader, fragmentShader);
  shaders.generateShader();

  this.VERT_SRC = shaders.getVertexShader() 
  this.FRAG_SRC = shaders.getFragmentShader() 

  this.vboContents = [];

  this.vboContents = makeSphere();

  //----------------------Attribute sizes
  this.vboFcount_a_Pos = 4;    // # of floats in the VBO needed to store the
                                 // attribute named a_Position+sn. (4: x,y,z,w values)
  this.vboFcount_a_Color = 4;   // # of floats for this attrib (r,g,b values) 
  this.vboFcount_a_Tot = this.vboFcount_a_Pos + this.vboFcount_a_Color;

  this.vboVerts = this.vboContents.length / this.vboFcount_a_Tot;


  // Memory Size Calc
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


  console.assert(this.vboFcount_a_Tot * this.FSIZE == this.vboStride, // for agreeement with'stride'
                 "VBObox" + this.sn + ".vboStride disagrees with attribute-size values!");





 //              //----------------------Attribute offsets
  this.vboOffset_a_Pos = 0; 
  this.vboOffset_a_Color = this.vboFcount_a_Pos * this.FSIZE;    

              //-----------------------GPU memory locations:                                
  this.vboLoc;                  // GPU Location for Vertex Buffer Object (Position), 
                                // returned by gl.createBuffer() function call

  this.elementLoc;                  // GPU Location for Element Array Buffer Object, 
                                // returned by gl.createBuffer() function call

  this.shaderLoc;               // GPU Location for compiled Shader-program  
                                // set by compile/link of VERT_SRC and FRAG_SRC.
  
              //---------------------- Uniform locations &values in our shaders
    //  ... for our transforms:
  this.modelMatrix  = new Matrix4();  // Model matrix
  this.mvpMatrix    = new Matrix4();  // Model-view-projection matrix
  this.normalMatrix = new Matrix4();  // Transformation matrix for normals

  //    -- For 3D camera and transforms:
  this.uLoc_eyePosWorld  = false;
  this.uLoc_ModelMatrix  = false;
  this.uLoc_MvpMatrix    = false;
  this.uLoc_NormalMatrix = false;
};


VBObox.prototype.init = function() {
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
  console.log('Creating program for box ' + this.sn + '...');

  this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
  if (!this.shaderLoc) {
    console.log(this.constructor.name + 
                '.init() failed to create executable Shaders on the GPU.');
    return;
  }
  // CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
  //  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

  // -----------------------------------------------------------------------------
  // b) Create VBO on GPU, fill it------------------------------------------------
  this.vboLoc = gl.createBuffer();  
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
                '.init() failed to create VBO in GPU.'); 
    return;
  }

  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //  == "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //  == "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vboLoc);
                        
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //   use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, this.vboContents, gl.STATIC_DRAW);

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

  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Position');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
                '.init() Failed to get GPU location of attribute a_Position');
    return -1;  // error exit.
  }
  this.a_ColorLoc = gl.getAttribLocation(this.shaderLoc, 'a_Color');
  if(this.a_ColorLoc < 0) {
    console.log(this.constructor.name + 
                '.init() failed to get the GPU location of attribute a_Color');
    return -1;  // error exit.
  }

  // c2) Find All Uniforms:-----------------------------------------------------
  //
  // Get GPU storage location for each uniform var used in our shader programs
  // This step is applied later in switchtoMe() method in which the program
  // this.shaderLoc is used.

}

VBObox.prototype.switchToMe = function () {

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
  gl.program = this.shaderLoc;    // (to match cuon-utils.js -- initShaders())
  gl.useProgram(this.shaderLoc);  
  // Each call to useProgram() selects a shader program from the GPU memory,
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
    gl.vertexAttribPointer(this.a_PosLoc, this.vboFcount_a_Pos,
                         gl.FLOAT, false, 
                         this.vboStride,  this.vboOffset_a_Pos);

    gl.vertexAttribPointer(this.a_ColorLoc, this.vboFcount_a_Color,
                         gl.FLOAT, false, 
                         this.vboStride,  this.vboOffset_a_Color);

    //-- Enable this assignment of the attribute to its' VBO source:
    gl.enableVertexAttribArray(this.a_PosLoc);
    gl.enableVertexAttribArray(this.a_ColorLoc);

    // Fill in the vertex shader source & fragment shader source

    // Create, save the storage locations of uniform variables: ... for the scene
    // (Version 03: changed these to global vars (DANGER!) for use inside any func)
    this.uLoc_eyePosWorld  = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
    this.uLoc_ModelMatrix  = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    this.uLoc_MvpMatrix    = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    this.uLoc_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!this.uLoc_eyePosWorld ||
        !this.uLoc_ModelMatrix || !this.uLoc_MvpMatrix || !this.uLoc_NormalMatrix) {
      console.log('Failed to get GPUs matrix storage locations');
      return;
    }

    this.uLoc_useColor = gl.getUniformLocation(gl.program, 'u_useColor');

    //  ... for Phong light source:
    // NEW!  Note we're getting the location of a GLSL struct array member:

    for (var i = 0; i < lightSourceCount; i++) {
      lightSource[i].u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[' + i + '].pos'); 
      lightSource[i].u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[' + i + '].ambi');
      lightSource[i].u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[' + i + '].diff');
      lightSource[i].u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[' + i + '].spec');
      if( !lightSource[i].u_pos || !lightSource[i].u_ambi || !lightSource[i].u_diff || !lightSource[i].u_spec ) {
        console.log('Failed to get GPU\'s lightSource[' + i + '] storage locations');
        return;
      }
    }

    // ... for Phong material/reflectance:
    matl0.uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
    matl0.uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
    matl0.uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
    matl0.uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
    matl0.uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
    if(!matl0.uLoc_Ke || !matl0.uLoc_Ka || !matl0.uLoc_Kd 
                      || !matl0.uLoc_Ks || !matl0.uLoc_Kshiny
       ) {
      console.log('Failed to get GPUs Reflectance storage locations');
      return;
    }

}

VBObox.prototype.isReady = function() {
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
              '.isReady() false: vbo at this.norLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
              '.adjust() call you needed to call this.switchToMe()!!');
  }

  
  this.modelMatrix.setTranslate(0, 0, 0.25); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  this.modelMatrix.scale(0.25, 0.25, 0.25);

  this.mvpMatrix = popMatrix();
  pushMatrix(this.mvpMatrix);

  this.mvpMatrix.multiply(this.modelMatrix);

  // Calculate the matrix to transform the normal based on the model matrix
  this.normalMatrix.setInverseOf(this.modelMatrix);
  this.normalMatrix.transpose();

    // Position the camera in world coordinates:
    eyePosWorld.set([eyeX, eyeY, eyeZ]);
    gl.uniform3fv(this.uLoc_eyePosWorld, eyePosWorld);// use it to set our uniform
    // (Note: uniform4fv() expects 4-element float32Array as its 2nd argument)\

  // Send the new matrix values to their locations in the GPU:
  gl.uniformMatrix4fv(this.uLoc_ModelMatrix, false, this.modelMatrix.elements);
  gl.uniformMatrix4fv(this.uLoc_MvpMatrix, false, this.mvpMatrix.elements);
  gl.uniformMatrix4fv(this.uLoc_NormalMatrix, false, this.normalMatrix.elements);

}

VBObox.prototype.draw = function() {
//=============================================================================
// Send commands to GPU to select and render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
              '.draw() call you needed to call this.switchToMe()!!');
  }

  for (var i = 0; i < lightSourceCount; i++) {
    gl.uniform3fv(lightSource[i].u_pos,  lightSource[i].I_pos.elements.slice(0,3));
    //     ('slice(0,3) member func returns elements 0,1,2 (x,y,z) ) 
    gl.uniform3fv(lightSource[i].u_ambi, lightSource[i].I_ambi.elements);   // ambient
    gl.uniform3fv(lightSource[i].u_diff, lightSource[i].I_diff.elements);   // diffuse
    gl.uniform3fv(lightSource[i].u_spec, lightSource[i].I_spec.elements);   // Specular
  }

  //  console.log('lightSource[0].u_pos',lightSource[0].u_pos,'\n' );
  //  console.log('lightSource[0].I_diff.elements', lightSource[0].I_diff.elements, '\n');mmmmmm


  //---------------For the Material object(s):
  gl.uniform3fv(matl0.uLoc_Ke, matl0.K_emit.slice(0,3));        // Ke emissive
  gl.uniform3fv(matl0.uLoc_Ka, matl0.K_ambi.slice(0,3));        // Ka ambient
  gl.uniform3fv(matl0.uLoc_Kd, matl0.K_diff.slice(0,3));        // Kd diffuse
  gl.uniform3fv(matl0.uLoc_Ks, matl0.K_spec.slice(0,3));        // Ks specular
  gl.uniform1i(matl0.uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny 

  this.useColor = 1;
  gl.uniform1i(this.uLoc_useColor ,this.useColor);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                0, // start at this vertex number, and 
                this.vboVerts); // draw this many vertices.

  // Usage: void gl.drawElements(mode, count, type, offset);
  // gl.drawElements(gl.TRIANGLES, this.elementLen, gl.UNSIGNED_SHORT, 0);

}


// VBObox.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 // gl.bufferSubData(gl.ARRAY_BUFFER,   // GLenum target(same as 'bindBuffer()')
 //                  0,                  // byte offset to where data replacement
 //                                      // begins in the VBO.
 //                   this.vboContents);   // the JS source-data array used to fill VBO

// }


VBObox.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
//    ********   YOU WRITE THIS! ********
//
//
//

  gl.deleteBuffer(this.vboLoc);
  gl.deleteProgram(this.shaderLoc);
}

// VBObox.prototype.restore = function() {
// //=============================================================================
// // Replace/restore all GPU resources used by this VBObox object, including any 
// // shader programs, attributes, uniforms, textures, samplers or other claims on 
// // GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// // all stride and offset values, etc.
// //
// //
// //    ********   YOU WRITE THIS! ********
// //
// //
// //
// }
