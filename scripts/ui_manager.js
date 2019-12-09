var gui, settings;


var SettingsManager = function() {

	var lightManager = function(lightID, isHeadLight = false) {

		this.isLit = true;

		this.__isHeadLight = isHeadLight;

		if (!this.__isHeadLight) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		}

		this.ambient = [100, 100, 200];//lightSource[lightID].I_ambi.elements;
		this.diffusal = [100, 100, 200];//lightSource[lightID].I_ambi.elements;
		this.specular = [100, 100, 200];//lightSource[lightID].I_ambi.elements;


	}

	this.vertexShader = 0;
	this.fragmentShader = 0;

	this.displayColor = true;
	this.showGrid = true;

	this.lightSource = [];

	this.lightSource[0] = new lightManager(0, true);

	for (var i = 1; i < 3; i++) {

		this.lightSource[i] = new lightManager(i);

	}

};

SettingsManager.prototype.apply = function() {

	// Display Color Settings
	applyColorOnBody = this.displayColor;

	// VBO Box Settings
	var vboboxEnabled = 1 + parseInt(this.vertexShader) * 2 + parseInt(this.fragmentShader);
	if (vboboxEnabled != currentShow) {

		g_show[currentShow] = 0;
		currentShow = vboboxEnabled;
		g_show[vboboxEnabled] = 1;

	}

	g_show0 = this.showGrid;

	// Light Settings
	for (var i = 0; i < 3; i++) {

		var thisLight = settings.lightSource[i];

		if (!thisLight.__isHeadLight) {

			var pos = [thisLight.x, thisLight.y, thisLight.z];
			lightSource[i].I_pos.elements.set(pos);

		}

		lightSource[i].isLit = thisLight.isLit;

		lightSource[i].I_ambi.elements.set(RGBIntToFloat(thisLight.ambient));
		lightSource[i].I_diff.elements.set(RGBIntToFloat(thisLight.diffusal));
		lightSource[i].I_spec.elements.set(RGBIntToFloat(thisLight.specular));

	}

	// console.log(lightSource);
}

function RGBIntToFloat(intArray) {
	if (intArray.length != 3) {
		console.log('function RGBIntToFloat only support vec3!')
	}

	return [intArray[0] / 255, intArray[1] / 255, intArray[2] / 255]
}


function RGBFloatToInt(floatArray) {
	if (floatArray.length != 3) {
		console.log('function RGBIntToFloat only support vec3!')
	}

	return [floatArray[0] * 255, floatArray[1] * 255, floatArray[2] * 255]
}

function addGUI() {

	gui = new dat.GUI({
	  load: defaultSettings
	});
	settings = new SettingsManager();

	gui.remember(settings);

	for (var i = 0; i < lightSourceCount; i++) {
		gui.remember(settings.lightSource[i]);
	}

	var f1 = gui.addFolder('Rendering');
	f1.add(settings, 'vertexShader', { Phong: 0, Gouraud: 1 } );
	f1.add(settings, 'fragmentShader', { Phong: 0, Blinn_Phong: 1 } );

	var f2 = gui.addFolder('Display');
	f2.add(settings, 'displayColor');
	f2.add(settings, 'showGrid');

	var fLamps = [];

	fLamps[i] = gui.addFolder('HeadLight');

	var thisLight = settings.lightSource[0];

	fLamps[i].add(thisLight, 'isLit');
	fLamps[i].addColor(thisLight, 'ambient');
	fLamps[i].addColor(thisLight, 'diffusal');
	fLamps[i].addColor(thisLight, 'specular');

	for (var i = 1; i < lightSourceCount; i++) {

		fLamps[i] = gui.addFolder('Light #' + i);

		thisLight = settings.lightSource[i];

		fLamps[i].add(thisLight, 'isLit');
		fLamps[i].add(thisLight, 'x');
		fLamps[i].add(thisLight, 'y');
		fLamps[i].add(thisLight, 'z');

		fLamps[i].addColor(thisLight, 'ambient');
		fLamps[i].addColor(thisLight, 'diffusal');
		fLamps[i].addColor(thisLight, 'specular');

	}

	f1.open();
}


// var SettingsManager = function() {

// 	// this.message = 'dat.gui';
// 	// this.speed = 0.8;
// 	// this.displayOutline = false;
// 	// this.explode = function() { ... };
// 	// Define render logic ...

// 	this.applyColorOnBody = toggleApplyColorOnBody();

// 	// this.lightSource

// };

// SettingsManager.prototype.apply = function() {

//   // lightSource[lightID].isLit = !lightSource[lightID].isLit;

//   applyColorOnBody = this.applyColorOnBody;

// }

// function addGUI() {

// 	gui = new dat.GUI();
// 	settings = new SettingsManager();

// 	// var f2 = gui.addFolder('general');
// 	gui.add(settings, 'applyColorOnBody');

// 	// f2.add(text, 'maxSize');
// 	// f2.add(text, 'message');

// }
