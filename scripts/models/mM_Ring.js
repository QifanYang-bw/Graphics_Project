function makeRing() {

  var verticesPerDiv = 10;

  var rOutside = 1.0;
  var rInside = 0.95;
  var ringHeight = 1;

  var ringDivs = 48;                 // # of stepped-spiral rings(constant theta)
                                      // along the entire length of the bent tube.
                                      // (>=3 req'd: more for smoother bending)


  var g_torAry = new Float32Array(  (verticesPerDiv * ringDivs) * g_floatsPerVertex  );



  var theta = 0;                   // begin torus at angles 0,0
  var thetaStep = 2 * Math.PI / ringDivs;  // theta angle between each tube ring

  // Seq: 3, 0, 2, 1, 6, 5, 7, 4, 3, 0

  var counter = 0;

  var topColor = 0.2, botColor = 0.5;
  for (var i = 0; i < ringDivs; i++)
  {
    for (var j = 0; j <= 4; j++)
    {
      var radi, height, color; 

      if (j == 0 || j >= 3) 
        radi = rOutside;
      else
        radi = rInside;

      if (j <= 1 || j == 4) 
      {
        height = ringHeight;
        color = topColor;
      }
      else
      {
        height = 0;
        color = botColor;
      }

      for (var k = 1; k >= 0; k--)
      {
        g_torAry[counter    ] = radi * Math.cos((i + k) * thetaStep);
        g_torAry[counter + 1] = radi * Math.sin((i + k) * thetaStep);
        g_torAry[counter + 2] = height;
        g_torAry[counter + 3] = 1.0;

        g_torAry[counter + 4] = color;
        g_torAry[counter + 5] = color;
        g_torAry[counter + 6] = color;
        g_torAry[counter + 7] = 1.0;

        counter += g_floatsPerVertex; 
      }

    }
  }

  // console.log(counter, (verticesPerDiv * ringDivs) * g_floatsPerPos);

  appendObject('Ring', g_torAry, MATL_PEWTER);

}