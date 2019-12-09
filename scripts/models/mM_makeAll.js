var g_floatsPerPos = 4;
var g_floatsPerColor = 4;
var g_floatsPerVertex = 8;

var vertexPool = {};
var curVertexLength = 0;

var vboVerts = new Float32Array();

function makeAll() {

  makeDog();
  makeHuman();
  makeWineGlass();
  // makeTorus();
  
  // makeAxis();
  // makeGroundGrid();
  makeSphere();

  makeRing();
  makeWing();
  maketweakedCylinder1();
  maketweakedPillar();
  makeDroneMisc();


}



// ==================== General Functions ====================

const cubeSeq = [0, 1, 3, 2, 2, 6, 3, 7, 0, 4, 1, 5, 2, 6, 6, 5, 7, 4];

function appendCube(name, posArr, colorArr){

  var i, j;
  var vboOutput = [];

  for (i = 0; i < colorArr.length; i++) {
    console.log('Before:', colorArr[i]);
    for (j = 0; j < 3; j++) {
      colorArr[i][j] = colorArr[i][j] * colorArr[i][3] + (1 - colorArr[i][3]);
    }
    colorArr[i][3] = 1.0;
    console.log('After:', colorArr[i]);
  }

  for (i = 0; i < cubeSeq.length; i++) {
    vboOutput = vboOutput.concat(posArr[cubeSeq[i]]);

    // temporary solution to transparent colors

    vboOutput = vboOutput.concat(colorArr[cubeSeq[i]]);
  };

  appendObject(name, vboOutput);

}

function appendObject(name, vboArr){

  var vertexLen = Math.floor(vboArr.length / g_floatsPerVertex);

  vboVerts = ArrayConcat(vboVerts, vboArr)

  vertexPool[name] = [curVertexLength, vertexLen];
  curVertexLength += vertexLen;

  // console.log(curVertexLength);
  // console.log(vboVerts.length / g_floatsPerVertex);
}

//concatenate two Float32Arrays
function ArrayConcat(a, b)
{
  var output = new Float32Array(a.length + b.length);

  output.set(a);
  output.set(b, a.length);

  return output;
}

