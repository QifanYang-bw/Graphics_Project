
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
  // easily WIsTHOUT disrupting any other code, ever!

  // In Gouraud Shading, the color for the fragment is computed in the Vertex Shader.
  // Whereas, in Phong Shading, the color for the fragment is computed in the
  // Fragment Shader.

  //=============================================================================
  // Vertex shader program: Phong Shading
  //=============================================================================
  // Reason for adding a '1':
  // https://gamedev.stackexchange.com/questions/61257/glsl-declaring-global-variables-outside-of-the-main-function-scope

  this.sn = 2;
  this.VERT_SRC =
    //-------------Set precision.
    // GLSL-ES 2.0 defaults (from spec; '4.5.3 Default Precision Qualifiers'):
    // DEFAULT for Vertex Shaders:  precision highp float; precision highp int;
    //                  precision lowp sampler2D; precision lowp samplerCube;
    // DEFAULT for Fragment Shaders:  UNDEFINED for float; precision mediump int;
    //                  precision lowp sampler2D; precision lowp samplerCube;
    //--------------- GLSL Struct Definitions:
    'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
    '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
    '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
    '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
    '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
    '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
    '};\n' +
    //                                
    //-------------ATTRIBUTES of each vertex, read from our Vertex Buffer Object
    'attribute vec4 a_Position' + this.sn + '; \n' +   // vertex position (model coord sys)

                      
    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    //  'uniform vec3 u_Kd; \n' +           // Phong diffuse reflectance for the 
                                        // entire shape. Later: as vertex attrib.
    'uniform MatlT u_MatlSet' + this.sn + '[1];\n' +   // Array of all materials.
    'uniform mat4 u_MvpMatrix' + this.sn + '; \n' +
    'uniform mat4 u_ModelMatrix' + this.sn + '; \n' +    // Model matrix
    'uniform mat4 u_NormalMatrix' + this.sn + '; \n' +   // Inverse Transpose of ModelMatrix;
                                          // (won't distort normal vec directions
                                          // but it usually WILL change its length)
    
    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    'varying vec3 v_Kd' + this.sn + '; \n' +             // Phong Lighting: diffuse reflectance
                                          // (I didn't make per-pixel Ke,Ka,Ks;
                                          // we use 'uniform' values instead)
    'varying vec4 v_Position' + this.sn + '; \n' +       
    'varying vec3 v_Normal' + this.sn + '; \n' +         // Why Vec3? its not a point, hence w==0
    //-------------------------------------------- ---------------------------------
    'void main() { \n' +  
      // Compute CVV coordinate values from our given vertex. This 'built-in'
      // 'varying' value gets interpolated to set screen position for each pixel.
    '  gl_Position = u_MvpMatrix' + this.sn + ' * a_Position' + this.sn + ';\n' +
      // Calculate the vertex position & normal vec in the WORLD coordinate system
      // for use as a 'varying' variable: fragment shaders get per-pixel values
      // (interpolated between vertices for our drawing primitive (TRIANGLE)).
    '  v_Position' + this.sn + ' = u_ModelMatrix' + this.sn + ' * a_Position' + this.sn + '; \n' +
      // 3D surface normal of our vertex, in world coords.  ('varying'--its value
      // gets interpolated (in world coords) for each pixel's fragment shader.
    '  v_Normal' + this.sn + ' = normalize(vec3(u_NormalMatrix' + this.sn + ' * a_Position' + this.sn + '));\n' +
    '  v_Kd' + this.sn + ' = u_MatlSet' + this.sn + '[0].diff; \n' +    // find per-pixel diffuse reflectance from per-vertex
                            // (no per-pixel Ke,Ka, or Ks, but you can do it...)
    //  '  v_Kd = vec3(1.0, 1.0, 0.0); \n'  + // TEST; color fixed at green
    '}\n';

  //=============================================================================
  // Fragment shader program: Blinn Phong
  //=============================================================================
  this.FRAG_SRC =
    //-------------Set precision.
    // GLSL-ES 2.0 defaults (from spec; '4.5.3 Default Precision Qualifiers'):
    // DEFAULT for Vertex Shaders:  precision highp float; precision highp int;
    //                  precision lowp sampler2D; precision lowp samplerCube;
    // DEFAULT for Fragment Shaders:  UNDEFINED for float; precision mediump int;
    //                  precision lowp sampler2D; precision lowp samplerCube;
    // MATCH the Vertex shader precision for float and int:
    'precision highp float;\n' +
    'precision highp int;\n' +
    //
    //--------------- GLSL Struct Definitions:
    'struct LampT {\n' +    // Describes one point-like Phong light source
    '   vec3 pos;\n' +      // (x,y,z,w); w==1.0 for local light at x,y,z position
                            //       w==0.0 for distant light from x,y,z direction 
    '   vec3 ambi;\n' +     // Ia ==  ambient light source strength (r,g,b)
    '   vec3 diff;\n' +     // Id ==  diffuse light source strength (r,g,b)
    '   vec3 spec;\n' +     // Is == specular light source strength (r,g,b)
    '}; \n' +
    //
    'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
    '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
    '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
    '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
    '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
    '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
    '};\n' +

    //-------------UNIFORMS: values set from JavaScript before a drawing command.

    // Tip: GLSL loops are un-rolled into native GPU instructions. This means there
    // needs to be a hard upper limit to the number of passes through the for loop,
    // that governs how many copies of the loop's inner code will be generated. If you
    // replace this with a const float or even a #define directive, the shader compiler
    // can then determine the number of passes at compile time, and generate the code
    // accordingly. But with a uniform there, the upper limit is not known at compile time.

    // Ref: https://stackoverflow.com/questions/38986208/webgl-loop-index-cannot-be-compared-with-non-constant-expression

    // tl;dr: Use const float for loop variables and comparisons.

    // Light source
    'const int u_LampCount' + this.sn + ' = ' + lightSourceCount + ';\n' +
    'uniform LampT u_LampSet' + this.sn + '[' + lightSourceCount + '];\n' +   // Array of all light sources.
    'uniform MatlT u_MatlSet' + this.sn + '[1];\n' +   // Array of all materials.
    //
    'uniform vec3 u_eyePosWorld' + this.sn + '; \n' +  // Camera/eye location in world coords.
    
    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader: 
    'varying vec3 v_Normal' + this.sn + ';\n' +        // Find 3D surface normal at each pix
    'varying vec4 v_Position' + this.sn + ';\n' +      // pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd' + this.sn + '; \n' +           // Find diffuse reflectance K_d per pix
                              // Ambient? Emissive? Specular? almost
                              // NEVER change per-vertex: I use 'uniform' values

    'void main() { \n' +
        // Normalize! !!IMPORTANT!! TROUBLE if you don't! 
        // normals interpolated for each pixel aren't 1.0 in length any more!
    '  vec3 normal = normalize(v_Normal' + this.sn + '); \n' +
    '  vec3 ambient = vec3(0.0, 0.0, 0.0), diffuse = vec3(0.0, 0.0, 0.0), speculr = vec3(0.0, 0.0, 0.0);' + 

    '  for (int i = 0; i < u_LampCount' + this.sn + '; i+=1) {' + 
        // Find the unit-length light dir vector 'L' (surface pt --> light):
    '    vec3 lightDirection = normalize(u_LampSet' + this.sn + '[i].pos - v_Position' + this.sn + '.xyz);\n' +
        // Find the unit-length eye-direction vector 'V' (surface pt --> camera)
    '    vec3 eyeDirection = normalize(u_eyePosWorld' + this.sn + ' - v_Position' + this.sn + '.xyz); \n' +
        // The dot product of (unit-length) light direction and the normal vector
        // (use max() to discard any negatives from lights below the surface) 
        // (look in GLSL manual: what other functions would help?)
        // gives us the cosine-falloff factor needed for the diffuse lighting term:
    '    float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
        // The Blinn-Phong lighting model computes the specular term faster 
        // because it replaces the (V*R)^shiny weighting with (H*N)^shiny,
        // where 'halfway' vector H has a direction half-way between L and V
        // H = norm(norm(V) + norm(L)).  Note L & V already normalized above.
        // (see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
    '    vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '    float nDotH = max(dot(H, normal), 0.0); \n' +
        // (use max() to discard any negatives from lights below the surface)
        // Apply the 'shininess' exponent K_e:
        // Try it two different ways:   The 'new hotness': pow() fcn in GLSL.
        // CAREFUL!  pow() won't accept integer exponents! Convert K_shiny!  
    '    float e64 = pow(nDotH, float(u_MatlSet' + this.sn + '[0].shiny));\n' +
    // Calculate the final color from diffuse reflection and ambient reflection
    //  '  vec3 emissive = u_Ke;' +
    '    ambient = ambient + u_LampSet' + this.sn + '[i].ambi * u_MatlSet' + this.sn + '[0].ambi;\n' +
    '    diffuse = diffuse + u_LampSet' + this.sn + '[i].diff * v_Kd' + this.sn + ' * nDotL;\n' +
    '    speculr = speculr + u_LampSet' + this.sn + '[i].spec * u_MatlSet' + this.sn + '[0].spec * e64;\n' +
    '  }' +

    '  vec3 emissive = u_MatlSet' + this.sn + '[0].emit;' + 

    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr, 1.0);\n' +
    '}\n';

  // console.log(lightSourceCount);
  this.vboContents = [];

  this.vboContents = makeSphere();

  //             //----------------------Attribute sizes
  this.vboFcount_a_Pos = 4;    // # of floats in the VBO needed to store the
                                 // attribute named a_Position+sn. (4: x,y,z,w values)

  this.vboVerts = this.vboContents.length / this.vboFcount_a_Pos;

                  
                  
 //              //----------------------Attribute offsets
  this.vboOffset_a_Pos = 0; 

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

  // ---------- Bind Array Buffer ----------
  initArrayBuffer(gl, this.vboLoc, new Float32Array(this.vboContents));
  
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //  == "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //  == "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
                        
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //   use gl.bufferSubData() to modify VBO contents without changing VBO size)

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

  // c2) Find All Uniforms:-----------------------------------------------------
  //
  // Get GPU storage location for each uniform var used in our shader programs
  // This step is applied later in switchtoMe() method in which the program
  // this.shaderLoc is used.

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
    gl.program = this.shaderLoc;    // (to match cuon-utils.js -- initShaders())
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
    if (!enableArrayBuffer(gl, this.vboLoc, 'a_Position' + this.sn + '', gl.FLOAT, this.vboFcount_a_Pos)) 
    {
      console.log('Failed to enable a_Position' + this.sn + ' buffer object');
      return -1;
    }

  // Do it again for normals
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.norLoc);
    // if (!enableArrayBuffer(gl, this.norLoc, 'a_Normal', gl.FLOAT, this.vboFcount_a_Nor1))
    // {
    //   console.log('Failed to enable a_Normal buffer object');
    //   return -1;
    // }

    // Fill in the vertex shader source & fragment shader source

    // Create, save the storage locations of uniform variables: ... for the scene
    // (Version 03: changed these to global vars (DANGER!) for use inside any func)
    this.uLoc_eyePosWorld  = gl.getUniformLocation(gl.program, 'u_eyePosWorld' + this.sn + '');
    this.uLoc_ModelMatrix  = gl.getUniformLocation(gl.program, 'u_ModelMatrix' + this.sn + '');
    this.uLoc_MvpMatrix    = gl.getUniformLocation(gl.program, 'u_MvpMatrix' + this.sn + '');
    this.uLoc_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix' + this.sn + '');
    if (!this.uLoc_eyePosWorld ||
        !this.uLoc_ModelMatrix || !this.uLoc_MvpMatrix || !this.uLoc_NormalMatrix) {
      console.log('Failed to get GPUs matrix storage locations');
      return;
      }
    //  ... for Phong light source:
    // NEW!  Note we're getting the location of a GLSL struct array member:

    for (var i = 0; i < lightSourceCount; i++) {
      lightSource[i].u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet' + this.sn + '[' + i + '].pos'); 
      lightSource[i].u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet' + this.sn + '[' + i + '].ambi');
      lightSource[i].u_diff = gl.getUniformLocation(gl.program, 'u_LampSet' + this.sn + '[' + i + '].diff');
      lightSource[i].u_spec = gl.getUniformLocation(gl.program, 'u_LampSet' + this.sn + '[' + i + '].spec');
      if( !lightSource[i].u_pos || !lightSource[i].u_ambi || !lightSource[i].u_diff || !lightSource[i].u_spec ) {
        console.log('Failed to get GPU\'s lightSource[' + i + '] storage locations');
        return;
      }
    }

    // ... for Phong material/reflectance:
    matl0.uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet' + this.sn + '[0].emit');
    matl0.uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet' + this.sn + '[0].ambi');
    matl0.uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet' + this.sn + '[0].diff');
    matl0.uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet' + this.sn + '[0].spec');
    matl0.uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet' + this.sn + '[0].shiny');
    if(!matl0.uLoc_Ke || !matl0.uLoc_Ka || !matl0.uLoc_Kd 
                      || !matl0.uLoc_Ks || !matl0.uLoc_Kshiny
       ) {
      console.log('Failed to get GPUs Reflectance storage locations');
      return;
    }

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
              '.isReady() false: vbo at this.norLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox2.prototype.adjust = function() {
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

VBObox2.prototype.draw = function() {
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

  // gl.enable(gl.CULL_FACE);
  // gl.cullFace(gl.BACK);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                0, // start at this vertex number, and 
                this.vboVerts); // draw this many vertices.

  // Usage: void gl.drawElements(mode, count, type, offset);
  // gl.drawElements(gl.TRIANGLES, this.elementLen, gl.UNSIGNED_SHORT, 0);

}


// VBObox2.prototype.reload = function() {
//=============================================================================
// Over-write current values in the GPU for our already-created VBO: use 
// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
// contents to our VBO without changing any GPU memory allocations.

 // gl.bufferSubData(gl.ARRAY_BUFFER,   // GLenum target(same as 'bindBuffer()')
 //                  0,                  // byte offset to where data replacement
 //                                      // begins in the VBO.
 //                   this.vboContents);   // the JS source-data array used to fill VBO

// }

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
//    ********   YOU WRITE THIS! ********
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
//    ********   YOU WRITE THIS! ********
//
//
//
}
*/