function makeAxis() {
	// Drawing Axes: Draw them using gl.LINES drawing primitive;
	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
	var g_torAxisPosAry = new Float32Array([
			0.0,  0.0,  0.0, 1.0,
			1.3,  0.0,  0.0, 1.0,
			0.0,  0.0,  0.0, 1.0,
			0.0,  1.3,  0.0, 1.0,
			0.0,  0.0,  0.0, 1.0,
			0.0,  0.0,  1.3, 1.0,
		]);


	var g_torAxisColorAry = new Float32Array([
			0.2,  0.2,  0.2,  1.0,	// X axis line (origin: gray)
			1.0,  0.2,  0.2,  1.0,	// 						 (endpoint: red)
			0.2,  0.2,  0.2,  1.0,	// Y axis line (origin: white)
			0.2,  1.0,  0.2,  1.0,	//						 (endpoint: green)
			0.2,  0.2,  0.2,  1.0,	// Z axis line (origin:white)
			0.2,  0.2,  1.0,  1.0,	//						 (endpoint: blue)
		]);


	appendObject('Axis', g_torAxisPosAry, g_torAxisColorAry);
}