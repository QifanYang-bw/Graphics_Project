var VertexShaderEnum = {
	None: 0,
	Gouraud: 1,
	Phong: 2,
};

var FragmentShaderEnum = {
	None: 0,
	Phong: 1,
	BlinnPhong: 2,
};

function shaderLib() {

	this.sn = -1;
	this.vertexShaderType = VertexShaderEnum.None;
	this.fragmentShaderType = FragmentShaderEnum.None;

	this.VertexShader = '';
	this.FragmentShader = '';

}

shaderLib.prototype.setSerialNumber = function(sn) {

	this.sn = sn;

	this.VertexShader = '';
	this.FragmentShader = '';
}

shaderLib.prototype.setShader = function(vertexShader, fragmentShader) {

	this.vertexShaderType = vertexShader;
	this.fragmentShaderType = fragmentShader;
	
	this.VertexShader = '';
	this.FragmentShader = '';

}

shaderLib.prototype.generateShader = function() {

	if(this.sn == -1) {
		console.log('Serial Number for shaderlib is not set!');
		return false;
	}

	if(this.vertexShaderType == VertexShaderEnum.None || 
		 this.fragmentShaderType == FragmentShaderEnum.None) {
		console.log('Shader type for shaderLib is not set!');
		return false;
	}

	__PhongVertex =
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

    	'attribute vec4 a_Color' + this.sn + ';\n' + // vertex color (vec4)

											
		//-------------UNIFORMS: values set from JavaScript before a drawing command.
		//  'uniform vec3 u_Kd; \n' +           // Phong diffuse reflectance for the 
																				// entire shape. Later: as vertex attrib.
		'uniform MatlT u_MatlSet' + this.sn + '[1];\n' +   // Array of all materials.
		'uniform mat4 u_MvpMatrix' + this.sn + '; \n' +
		'uniform mat4 u_ModelMatrix' + this.sn + '; \n' +    // Model matrix
		'uniform mat4 u_NormalMatrix' + this.sn + '; \n' +   // Inverse Transpose of ModelMatrix;
																					// (won't distort normal vec directions
																					// but it usually WILL change its length)
		'uniform bool u_useColor' + this.sn + ';\n' +
		
		//-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
		'varying vec3 v_Kd' + this.sn + '; \n' +             // Phong Lighting: diffuse reflectance
																					// (I didn't make per-pixel Ke,Ka,Ks;
																					// we use 'uniform' values instead)
		'varying vec4 v_Position' + this.sn + '; \n' +       
		'varying vec3 v_Normal' + this.sn + '; \n' +         // Why Vec3? its not a point, hence w==0
		'varying float v_Opacity' + this.sn + '; \n' +

		//-------------------------------------------- ---------------------------------
		'void main() { \n' +  
			// Compute CVV coordinate values from our given vertex. This 'built-in'
			// 'varying' value gets interpolated to set screen position for each pixel.
		'	gl_Position = u_MvpMatrix' + this.sn + ' * a_Position' + this.sn + ';\n' +
			// Calculate the vertex position & normal vec in the WORLD coordinate system
			// for use as a 'varying' variable: fragment shaders get per-pixel values
			// (interpolated between vertices for our drawing primitive (TRIANGLE)).
		'	v_Position' + this.sn + ' = u_ModelMatrix' + this.sn + ' * a_Position' + this.sn + '; \n' +
			// 3D surface normal of our vertex, in world coords.  ('varying'--its value
			// gets interpolated (in world coords) for each pixel's fragment shader.
		'	v_Normal' + this.sn + ' = normalize(vec3(u_NormalMatrix' + this.sn + ' * a_Position' + this.sn + '));\n' +
		// '  v_Kd' + this.sn + ' = u_MatlSet' + this.sn + '[0].diff; \n' +    // find per-pixel diffuse reflectance from per-vertex
														// (no per-pixel Ke,Ka, or Ks, but you can do it...)
		'	if (u_useColor' + this.sn + ') { \n' + 
    	'		v_Kd' + this.sn + ' = a_Color' + this.sn + '.xyz;\n' +
    	'	} else { \n' + 
    	'		v_Kd' + this.sn + ' = u_MatlSet' + this.sn + '[0].diff;\n' +
    	'	}\n' + 
    	'	v_Opacity' + this.sn + ' = a_Color' + this.sn + '.w;\n' +
		//  '  v_Kd = vec3(1.0, 1.0, 0.0); \n'  + // TEST; color fixed at green
		'}\n';

	__PhongFragmentBefore =
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
		'	vec3 pos;\n' +      // (x,y,z,w); w==1.0 for local light at x,y,z position
								//       w==0.0 for distant light from x,y,z direction 
		'	vec3 ambi;\n' +     // Ia ==  ambient light source strength (r,g,b)
		'	vec3 diff;\n' +     // Id ==  diffuse light source strength (r,g,b)
		'	vec3 spec;\n' +     // Is == specular light source strength (r,g,b)
		'}; \n' +
		//
		'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
		'	vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
		'	vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
		'	vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
		'	vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
		'	int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
		'};\n' +

		//-------------UNIFORMS: values set from JavaScript before a drawing command.

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

		'varying float v_Opacity' + this.sn + '; \n' +

		'void main() { \n' +
				// Normalize! !!IMPORTANT!! TROUBLE if you don't! 
				// normals interpolated for each pixel aren't 1.0 in length any more!
		'  vec3 normal = normalize(v_Normal' + this.sn + '); \n' +
		'  vec3 ambient = vec3(0.0, 0.0, 0.0), diffuse = vec3(0.0, 0.0, 0.0), specular = vec3(0.0, 0.0, 0.0);\n' + 

		'  for (int i = 0; i < u_LampCount' + this.sn + '; i+=1) {\n' + 

		'    vec3 lightDirection = normalize(u_LampSet' + this.sn + '[i].pos - v_Position' + this.sn + '.xyz);\n' +
		'    vec3 eyeDirection = normalize(u_eyePosWorld' + this.sn + ' - v_Position' + this.sn + '.xyz); \n' +

				// Diffusal
		'    float nDotL = max(dot(lightDirection, normal), 0.0); \n';

	__PhongSpecular =
				// Specular (Phong)
		'    vec3 C = normal * dot(lightDirection, normal); \n' +
		'    vec3 reflectDirection = 2. * C - lightDirection; \n' +
		'    float RdotV = max(dot(reflectDirection, eyeDirection), 0.); \n' +
		'    float e64 = pow(RdotV, float(u_MatlSet' + this.sn + '[0].shiny)); \n';

	__BlinnPhongSpecular =
				// Specular (Blinn Phong)
		'    vec3 H = normalize(lightDirection + eyeDirection); \n' +
		'    float nDotH = max(dot(H, normal), 0.0); \n' +
		'    float e64 = pow(nDotH, float(u_MatlSet' + this.sn + '[0].shiny));\n';

	__PhongFragmentAfter =
		'    ambient = ambient + u_LampSet' + this.sn + '[i].ambi * u_MatlSet' + this.sn + '[0].ambi;\n' +
		'    diffuse = diffuse + u_LampSet' + this.sn + '[i].diff * v_Kd' + this.sn + ' * nDotL;\n' +
		'    specular = specular + u_LampSet' + this.sn + '[i].spec * u_MatlSet' + this.sn + '[0].spec * e64;\n' +
		'  }\n'  +
		'  vec3 emissive = u_MatlSet' + this.sn + '[0].emit;\n' + 
		'  gl_FragColor = vec4(emissive + ambient + diffuse + specular, v_Opacity' + this.sn + ');\n' +
		'}\n';


	__GouraudVertexBefore =
		'struct MatlT {\n' +
		'   vec3 emit;\n' + 
		'   vec3 ambi;\n' + 
		'   vec3 diff;\n' + 
		'   vec3 spec;\n' + 
		'   int shiny;\n' + 
		'};\n' +

		'struct LampT {\n' +
		'   vec3 pos;\n' +  
												
		'   vec3 ambi;\n' + 
		'   vec3 diff;\n' + 
		'   vec3 spec;\n' + 
		'}; \n' +
														 
		//-------------ATTRIBUTES of each vertex, read from our Vertex Buffer Object
		'attribute vec4 a_Position' + this.sn + '; \n' + // vertex position (model coord sys)

    	'attribute vec4 a_Color' + this.sn + ';\n' +     // vertex color (vec4)

		//-------------UNIFORMS: values set from JavaScript before a drawing command.
		'uniform MatlT u_MatlSet' + this.sn + '[1];\n' +  
		'uniform mat4 u_MvpMatrix' + this.sn + '; \n' +
		'uniform mat4 u_ModelMatrix' + this.sn + '; \n' + 
		'uniform mat4 u_NormalMatrix' + this.sn + '; \n' +
		
		//-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
		'const int LampCount' + this.sn + ' = ' + lightSourceCount + ';\n' +
		'uniform LampT u_LampSet' + this.sn + '[' + lightSourceCount + '];\n' +   // Array of all light sources.

		'uniform vec3 u_eyePosWorld' + this.sn + '; \n' +  // Camera/eye location in world coords.

		'uniform bool u_useColor' + this.sn + ';\n' +
		'varying vec4 v_color; \n' + 

		'void main() { \n' +
		'	gl_Position = u_MvpMatrix' + this.sn + ' * a_Position' + this.sn + ';\n' +

		'	vec4 worldPosition = u_ModelMatrix' + this.sn + ' * a_Position' + this.sn + '; \n' +
		// '  vec3 Kd = u_MatlSet' + this.sn + '[0].diff; \n' +    // find per-pixel diffuse reflectance from per-vertex

		'	vec3 Kd; \n' + 
		'	if (u_useColor' + this.sn + ') { \n' + 
    	'		Kd = a_Color' + this.sn + '.xyz;\n' +
    	'	} else { \n' + 
    	'		Kd = u_MatlSet' + this.sn + '[0].diff;\n' +
    	'	}\n' +  

		'	vec3 normal = normalize(vec3(u_NormalMatrix' + this.sn + ' * a_Position' + this.sn + ')); \n' +
		'	vec3 ambient = vec3(0.0, 0.0, 0.0), diffuse = vec3(0.0, 0.0, 0.0), specular = vec3(0.0, 0.0, 0.0);' + 

		'	for (int i = 0; i < LampCount' + this.sn + '; i+=1) {' + 
				// Find the unit-length light dir vector 'L' (surface pt --> light):
		'		vec3 lightDirection = normalize(u_LampSet' + this.sn + '[i].pos - worldPosition.xyz);\n' +
				// Find the unit-length eye-direction vector 'V' (surface pt --> camera)
		'		vec3 eyeDirection = normalize(u_eyePosWorld' + this.sn + ' - worldPosition.xyz); \n' +

				 // Diffusal
		'		float nDotL = max(dot(lightDirection, normal), 0.0); \n';

	__GouraudVertexAfter =
		'		ambient = ambient + u_LampSet' + this.sn + '[i].ambi * u_MatlSet' + this.sn + '[0].ambi;\n' +
		'		diffuse = diffuse + u_LampSet' + this.sn + '[i].diff * Kd * nDotL;\n' +
		'		specular = specular + u_LampSet' + this.sn + '[i].spec * u_MatlSet' + this.sn + '[0].spec * e64;\n' +
		'	}' +

		'	vec3 emissive = u_MatlSet' + this.sn + '[0].emit;' + 

		'	v_color = vec4(emissive + ambient + diffuse + specular, a_Color' + this.sn + '.w);\n' +
		'}\n';

	__GouraudFragment =
		'precision highp float;\n' +
		'precision highp int;\n' +

		'varying vec4 v_color; \n' + 

		'void main() { \n' +
		'  gl_FragColor = v_color; \n' +
		'}\n';

	specular = '';
	if (this.fragmentShaderType == FragmentShaderEnum.Phong) {
		specular = __PhongSpecular;
	} else if (this.fragmentShaderType == FragmentShaderEnum.BlinnPhong) {
		specular = __BlinnPhongSpecular;
	}

	if (this.vertexShaderType == VertexShaderEnum.Phong) {
		this.VertexShader = __PhongVertex;
		this.FragmentShader = __PhongFragmentBefore + specular + __PhongFragmentAfter;
	} else if (this.vertexShaderType == VertexShaderEnum.Gouraud) {
		this.VertexShader = __GouraudVertexBefore + specular + __GouraudVertexAfter;
		this.FragmentShader = __GouraudFragment;
	}

}

shaderLib.prototype.getVertexShader = function() {

	if (this.VertexShader != '')
		return this.VertexShader;
	else{
		console.log('No Vertex Shader available; Has generateShader() been called?');
		return -1;
	}

}

shaderLib.prototype.getFragmentShader = function() {

	if (this.FragmentShader != '')
		return this.FragmentShader;
	else{
		console.log('No Fragment Shader available; Has generateShader() been called?');
		return -1;
	}

}