//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// JT_MultiShader.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

/* Show how to use 3 separate VBOs with different verts, attributes & uniforms. 
-------------------------------------------------------------------------------
	Create a 'VBObox' object/class/prototype & library to collect, hold & use all 
	data and functions we need to render a set of vertices kept in one Vertex 
	Buffer Object (VBO) on-screen, including:
	--All source code for all Vertex Shader(s) and Fragment shader(s) we may use 
		to render the vertices stored in this VBO;
	--all variables needed to select and access this object's VBO, shaders, 
		uniforms, attributes, samplers, texture buffers, and any misc. items. 
	--all variables that hold values (uniforms, vertex arrays, element arrays) we 
	  will transfer to the GPU to enable it to render the vertices in our VBO.
	--all user functions: init(), draw(), adjust(), reload(), empty(), restore().
	Put all of it into 'JT_VBObox-Lib.js', a separate library file.

USAGE:
------
1) If your program needs another shader program, make another VBObox object:
 (e.g. an easy vertex & fragment shader program for drawing a ground-plane grid; 
 a fancier shader program for drawing Gouraud-shaded, Phong-lit surfaces, 
 another shader program for drawing Phong-shaded, Phong-lit surfaces, and
 a shader program for multi-textured bump-mapped Phong-shaded & lit surfaces...)
 
 HOW:
 a) COPY CODE: create a new VBObox object by renaming a copy of an existing 
 VBObox object already given to you in the VBObox-Lib.js file. 
 (e.g. copy VBObox1 code to make a VBObox3 object).

 b) CREATE YOUR NEW, GLOBAL VBObox object.  
 For simplicity, make it a global variable. As you only have ONE of these 
 objects, its global scope is unlikely to cause confusions/errors, and you can
 avoid its too-frequent use as a function argument.
 (e.g. above main(), write:    var phongBox = new VBObox3();  )

 c) INITIALIZE: in your JS progam's main() function, initialize your new VBObox;
 (e.g. inside main(), write:  phongBox.init(); )

 d) DRAW: in the JS function that performs all your webGL-drawing tasks, draw
 your new VBObox's contents on-screen. 
 (NOTE: as it's a COPY of an earlier VBObox, your new VBObox's on-screen results
  should duplicate the initial drawing made by the VBObox you copied.  
  If that earlier drawing begins with the exact same initial position and makes 
  the exact same animated moves, then it will hide your new VBObox's drawings!
  --THUS-- be sure to comment out the earlier VBObox's draw() function call  
  to see the draw() result of your new VBObox on-screen).
  (e.g. inside drawAll(), add this:  
      phongBox.switchToMe();
      phongBox.draw();            )

 e) ADJUST: Inside the JS function that animates your webGL drawing by adjusting
 uniforms (updates to ModelMatrix, etc) call the 'adjust' function for each of your
VBOboxes.  Move all the uniform-adjusting operations from that JS function into the
'adjust()' functions for each VBObox. 

2) Customize the VBObox contents; add vertices, add attributes, add uniforms.
 ==============================================================================*/


// Global Variables  
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments. 
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvas;									// HTML-5 'canvas' element ID#

var lightSource = [];
var lightSourceCount;

// For multiple VBOs & Shaders:-----------------
var worldBox;
var partBox = [];

// global vars that contain the values we send thru those uniforms,
//  ... for our camera:
var eyePosWorld = new Float32Array(3);  // x,y,z in world coords

// ... for our first material:
var matlSel = MATL_RED_PLASTIC;        // see keypress(): 'm' key changes matlSel

var matl0 = new Material();  

//  ... for our light source:   (stays false if never initialized)
var materialSource = [];
var materialSourceCount;

//----------------------------- Animation ----------------------------
var g_isRun = true;                 // run/stop for animation; used in tick().
var g_last = Date.now();          // Timestamp for most-recently-drawn image; 
                                    // in milliseconds; used by 'animate()' fcn 
                                    // (now called 'timerAll()' ) to find time
                                    // elapsed since last on-screen image.

// Rotation multiplication factor for speed control and pausing
var g_rateBoostingFactor = 1.0;     

var g_modelMatLoc;                  // that uniform's location in the GPU

//------------For mouse click-and-drag: -------------------------------
var g_isDrag = false;   // mouse-drag: true when user holds down mouse button
var g_xMclik = 0.0;     // last mouse button-down position (in CVV coords)
var g_yMclik = 0.0;   
var g_xMdragTot = 0.0;  // total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot = 0.0;  


//------------Special function: For jumping -------------------------------
var jumpSignal = false;

// VBO Box Status
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show = [];
var currentShow;

// Camera Constants
var vertexPool = {};
var curBufferLength;
// ------------------------------------------------
var currentAngle = 0.0;
var eyeX = 0.001, eyeY = 5.001, eyeZ = 1.001; 
// var focalEyeX = 0, focalEyeY = 0, focalEyeZ = .5;  
var lookAtX = 0.0, lookAtY = 0.0, lookAtZ = 1.00;
var tX = 0, tY = 0, tZ = 0;
var STEP1 = 0.15;
var STEP2 = 0.01;
var JUDGE = -1;



function canvasInit() {
  
  makeAll();

  // Set up Light sources & materials before all VBO Boxes
  setLights();
  setMaterials();

  addGUI();

  worldBox = new VBObox0();     // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
  partBox[1] = new VBObox(1, VertexShaderEnum.Phong, FragmentShaderEnum.Phong);
  partBox[2] = new VBObox(2, VertexShaderEnum.Phong, FragmentShaderEnum.BlinnPhong);
  partBox[3] = new VBObox(3, VertexShaderEnum.Gouraud, FragmentShaderEnum.Phong);
  partBox[4] = new VBObox(4, VertexShaderEnum.Gouraud, FragmentShaderEnum.BlinnPhong);

  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);    // VBO + shaders + uniforms + attribs for our 3D world,
                        // including ground-plane,                       
  partBox[1].init(gl);    //  "   "   "  for 1st kind of shading & lighting
  partBox[2].init(gl);    //  "   "   "  for 2nd kind of shading & lighting
  partBox[3].init(gl);    //  "   "   "  for 1st kind of shading & lighting
  partBox[4].init(gl);    //  "   "   "  for 2nd kind of shading & lighting

  g_show[1] = 1;
  g_show[2] = 0;
  g_show[3] = 0;
  g_show[4] = 0;

  currentShow = 1;
}

function setLights() {

  lightSourceCount = 3;
  
  for (var i = 0; i < lightSourceCount; i++) {
    lightSource[i] = new LightsT(); 
  } 

  // Init World position, colors of light source in global vars;
  // lightSource[0].I_pos.elements.set([0,0,0]);
  // lightSource[0].I_ambi.elements.set([0.1, 0.1, 0.4]);
  // lightSource[0].I_diff.elements.set([0.15, 0.15, 0.6]);
  // lightSource[0].I_spec.elements.set([0.25, 0.25, 1.0]);

  // lightSource[1].I_pos.elements.set( [6.0, 5.0, 5.0]);
  // lightSource[1].I_ambi.elements.set([0.4, 0.4, 0.4]);
  // lightSource[1].I_diff.elements.set([1.0, 1.0, 1.0]);
  // lightSource[1].I_spec.elements.set([1.0, 1.0, 1.0]);

  // lightSource[2].I_pos.elements.set([-3.0, -5.0, -2.0]);
  // lightSource[2].I_ambi.elements.set([0.2, 0.2, 0.15]);
  // lightSource[2].I_diff.elements.set([0.75, 0.75, 0.5]);
  // lightSource[2].I_spec.elements.set([0.8, 0.8, 0.6]);


  // lightSource[1].isLit = false;

}


function setMaterials() {

  materialSourceCount = 23;

  for (var i = 0; i <= materialSourceCount; i++) {
    materialSource[i] = new Material(i); 
  } 

}

function main() {
//=============================================================================
  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvas = document.getElementById('webgl');	
  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function call
  // will follow this format:  gl.WebGLfunctionName(args);

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //SIMPLE VERSION:  gl = getWebGLContext(g_canvas); 
  // Here's a BETTER version:
  gl = g_canvas.getContext("webgl", { preserveDrawingBuffer: true });
	// This fancier-looking version disables HTML-5's default screen-clearing, so 
	// that our drawMain() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  window.addEventListener("keydown", myKeyDown, false);

  canvasInit();
	
  gl.clearColor(0.1, 0.1, 0.1, 1);	  // RGBA color for clearing <canvas>

  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  // gl.enable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
  
  // ==============ANIMATION=============
  // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5: 
  //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
  //  or
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simpler-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, & computing loads, and to respond 
  //			to on-screen window placement (to skip battery-draining animation in 
  //			any window that was hidden behind others, or was scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  //------------------------------------
  var tick = function() {		    // locally (within main() only), define our 
                                // self-calling animation function. 
    drawResize();
    animate();                  // Update all time-varying params, and
    drawVBOBox();                  // Draw all the VBObox contents
    
    requestAnimationFrame(tick, g_canvas); // browser callback request; wait
                                // til browser is ready to re-draw canvas, then
  };
  //------------------------------------
  tick();                       // do it again!
}

function drawVBOBox() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var originalMatrixDepth = getMatrixDepth();

  // Perspective Cam
  gl.viewport(0,0,g_canvas.width, g_canvas.height);
  var mMatrix = new Matrix4();
  
  // FOV = 30 deg
  mMatrix.perspective(30.0,   // FOVY: top-to-bottom vertical image angle, in degrees
                      (g_canvas.width)/g_canvas.height,   // Image Aspect Ratio: camera lens width/height
                      1.0,   // camera z-near distance (always positive; frustum begins at z = -znear)
                      1000.0);  // camera z-far distance (always positive; frustum ends at z = -zfar)
  
  mMatrix.lookAt(eyeX,  eyeY,  eyeZ,     // center of projection
                 lookAtX, lookAtY, lookAtZ,  // look-at point 
                 0,  0,  1);

  // ModelMatrix.setTranslate(0, 0, 0);

  // console.log('stack', __cuon_matrix_mod_stack);
  // pushMatrix(mMatrix);


  var b4Draw = Date.now();
  var b4Wait = b4Draw - g_last;
  // console.log('orig',mMatrix);

  settings.apply();

	if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
	  worldBox.switchToMe();  // Set WebGL to render from this VBObox.
		worldBox.adjust(mMatrix);		  // Send new values for uniforms to the GPU, and
		worldBox.draw();			  // draw our VBO's contents using our shaders.
  }

  // console.log('before');
  // console.log('length', __cuon_matrix_mod_stack);

  for (var i = 1; i <= 4; i++) {
    if(g_show[i] == 1) {
      partBox[i].switchToMe();
      partBox[i].setVPMatrix(mMatrix);
      partBox[i].draw();
    }
  }

  /* // ?How slow is our own code?  	
  var aftrDraw = Date.now();
  var drawWait = aftrDraw - b4Draw;
  console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");
  */

  clearMatrix(originalMatrixDepth);

}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  if(g_show0 != 1) g_show0 = 1;				// show,
  else g_show0 = 0;										// hide.
  console.log('g_show0: '+g_show0);
}


function drawResize() {
//==============================================================================
// Called when user re-sizes their browser window , because our HTML file
// contains:  <body onload="main()" onresize="winResize()">

 // var nuCanvas = document.getElementById('webgl');  // get current canvas
 // var nuGL = getWebGLContext(nuCanvas);             // and context:
  
  // g_canvas.width = window.innerWidth;
  g_canvas.width = document.body.clientWidth;
  g_canvas.height = window.innerHeight;
  // console.log(window.innerWidth, window.innerWidth - 12);
}


function myKeyDown(kev) {
  //===============================================================================
  // Called when user presses down ANY key on the keyboard;
  //
  // For a light, easy explanation of keyboard events in JavaScript,
  // see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
  // For a thorough explanation of a mess of JavaScript keyboard event handling,
  // see:    http://javascript.info/tutorial/keyboard-events
  //
  // NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
  //        'keydown' event deprecated several read-only properties I used
  //        previously, including kev.charCode, kev.keyCode. 
  //        Revised 2/2019:  use kev.key and kev.code instead.
  //
  // Report EVERYTHING in console:
  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
              "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
              "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

  // // and report EVERYTHING on webpage:
  //   document.getElementById('KeyDownResult'); // clear old results
  //   // key details:
  //   document.getElementById('KeyModResult' );
  document.getElementById('KeyModResult' ).innerHTML = 
        "   --kev.code:"+kev.code   +"      --kev.key:"+kev.key+
    "<br>--kev.ctrlKey:"+kev.ctrlKey+" --kev.shiftKey:"+kev.shiftKey+
    "<br>--kev.altKey:"+kev.altKey +"  --kev.metaKey:"+kev.metaKey;

  var dx = lookAtX - eyeX, dy = lookAtY - eyeY, dz = lookAtZ - eyeZ;
  var focal = Math.sqrt(dx*dx + dy*dy + dz*dz);
  var lzx = Math.sqrt(dx*dx+dy*dy);
  var sin_phi = lzx / focal;

  var theta0 = Math.PI -  Math.asin(dx/lzx);
  var cos_theta = dy / Math.sqrt(dx*dx + dy*dy);
  var sin_theta = dx / Math.sqrt(dx*dx + dy*dy);

  var lookAtHorizontalMultiplier = 2.0;

  var phi0 = Math.asin(dz/focal);
 
  switch(kev.code) {

    case "KeyP":
      console.log("Pause/unPause!\n");                // print on console,
      // document.getElementById('KeyDownResult');   // print on webpage
      runStop();

      break;

    //------------------Space Jumping-----------------
    case "Space":
      console.log(' Space: Jumping!');
      // document.getElementById('KeyDownResult');


      jumpTrigger();

      if(kev.target == document.body) {
        kev.preventDefault();
      }

      break; 

    case "KeyD": { // d
            u = new Float32Array([0, 0, 1]);
            
            l = new Vector3();
            
            l[0] = dx/focal; l[1] = dy/focal; l[2] = dz/focal;

            t = new Vector3();
            t[0] = u[1]*l[2] - u[2]*l[1];
            t[1] = u[2]*l[0] - u[0]*l[2];
            t[2] = u[0]*l[1] - u[1]*l[0];

            temp2 = Math.sqrt(t[0]*t[0] + t[1]*t[1] + t[2]*t[2]);

            t[0] /= temp2; t[1] /= temp2; t[2] /= temp2;

            eyeX -= STEP1 * t[0];
            eyeY -= STEP1 * t[1];
            eyeZ -= STEP1 * t[2];

            lookAtX -= STEP1 * t[0];
            lookAtY -= STEP1 * t[1];
            lookAtZ -= STEP1 * t[2];

            break;
    }
    case "KeyA": { // a
            u = new Float32Array([0, 0, 1]);
            
            l = new Vector3();
            l[0] = dx/focal; l[1] = dy/focal; l[2] = dz/focal;

            t = new Vector3();
            t[0] = u[1]*l[2] - u[2]*l[1];
            t[1] = u[2]*l[0] - u[0]*l[2];
            t[2] = u[0]*l[1] - u[1]*l[0];

            temp2 = Math.sqrt(t[0]*t[0] + t[1]*t[1] + t[2]*t[2]);

            t[0] /= temp2; t[1] /= temp2; t[2] /= temp2;

            eyeX += STEP1 * t[0];
            eyeY += STEP1 * t[1];
            eyeZ += STEP1 * t[2];

            lookAtX += STEP1 * t[0];
            lookAtY += STEP1 * t[1];
            lookAtZ += STEP1 * t[2];

            break;
    } 
    case "KeyW": 
           { 
            t = new Vector3();
            t[0] = dx/focal; t[1] = dy/focal; t[2] = dz/focal;

            eyeX += STEP1 * t[0];
            eyeY += STEP1 * t[1];
            eyeZ += STEP1 * t[2];

            lookAtX += STEP1 * t[0];
            lookAtY += STEP1 * t[1];
            lookAtZ += STEP1 * t[2];

            break;
    } 
    case "KeyS": { 
            t = new Vector3();
            t[0] = dx/focal; t[1] = dy/focal; t[2] = dz/focal;
            
            eyeX -= STEP1 * t[0];
            eyeY -= STEP1 * t[1];
            eyeZ -= STEP1 * t[2];

            lookAtX -= STEP1 * t[0];
            lookAtY -= STEP1 * t[1];
            lookAtZ -= STEP1 * t[2];

            break;
    } 
    case "KeyI":{ 
            if (JUDGE==-1 || JUDGE==1)
            {  
              PHI_NOW = phi0 + STEP2;
              JUDGE = 0;
            }
            else
            {
              PHI_NOW += STEP2;
            }

            lookAtX = focal * Math.cos(PHI_NOW) * sin_theta + eyeX;
            lookAtY = focal * Math.cos(PHI_NOW) * cos_theta + eyeY;
            lookAtZ = focal * Math.sin(PHI_NOW) + eyeZ;

            break;
    }
    case "KeyK":{ 
            if(JUDGE == -1 || JUDGE == 1)
            { 
              PHI_NOW = phi0 - STEP2;  
              JUDGE = 0;
            }
            else
            {
              PHI_NOW -= STEP2;
            }

            lookAtX = focal * Math.cos(PHI_NOW) * sin_theta + eyeX;
            lookAtY = focal * Math.cos(PHI_NOW) * cos_theta + eyeY;
            lookAtZ = focal * Math.sin(PHI_NOW) + eyeZ;

            break;
    }
    case "KeyJ":{ 
          if(JUDGE==-1 || JUDGE==0)
            {
              THETA_NOW = theta0 + STEP2 * lookAtHorizontalMultiplier;          
              JUDGE = 1;
            }
            else
            {
              THETA_NOW -= STEP2 * lookAtHorizontalMultiplier;
            }

            lookAtX = focal * sin_phi * Math.sin(THETA_NOW) + eyeX;
            lookAtY = focal * sin_phi * Math.cos(THETA_NOW) + eyeY;
            lookAtZ = dz + eyeZ;
            
            break;
    }
    case "KeyL": {
            if (JUDGE == -1 || JUDGE == 0)
            {
              THETA_NOW = theta0 - STEP2 * lookAtHorizontalMultiplier;
              JUDGE = 1;
            }
            else
            {
              THETA_NOW += STEP2 * lookAtHorizontalMultiplier;
            }

            lookAtX = focal * sin_phi * Math.sin(THETA_NOW) + eyeX;
            lookAtY = focal * sin_phi * Math.cos(THETA_NOW) + eyeY;
            lookAtZ = dz + eyeZ;

            break;
    }
      

    case "KeyM":{
      matlSel = (matlSel +1) % MATL_DEFAULT;  // see materials_Ayerdi.js for list

      vertexPool['Sphere'][2] = matlSel;

      break;
    }
    case "KeyX": {
      materialSource[matlSel].K_shiny += 1.0;               // INCREASE shininess
      if(materialSource[matlSel].K_shiny > 128.0) materialSource[matlSel].K_shiny = 128.0;  //  c.
      console.log('UPPERcase S: ++K_shiny ==', materialSource[matlSel].K_shiny,'\n'); 
      // draw();                           // re-draw on-screen image.
      break;
    }
    case "KeyZ": {
      materialSource[matlSel].K_shiny += -1.0;                // DECREASE shininess
      if(materialSource[matlSel].K_shiny < 1.0) materialSource[matlSel].K_shiny = 1.0;
      console.log('lowercase s: --K_shiny ==', materialSource[matlSel].K_shiny, '\n');
      // draw();                         // re-draw on-screen image.
      break;
    }
  }
}