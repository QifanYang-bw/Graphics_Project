/*
// Based on Instancing02.js, 2019.10.21.Instancing

function makeTorus() {
//==============================================================================
// Make a torus from one TRIANGLE_STRIP drawing primitive, using the 
// 'stepped spiral' design (Method 2) described in the class lecture notes.
//
// (NOTE: you'll get better-looking results if you create a 'makeSphere3() 
// function that uses the 'degenerate stepped spiral' design (Method 3).
//
// 	Imagine a torus as a flexible, cylinder-shaped rod or tube bent into a 
// circle around the z-axis. The bent tube's centerline forms a circle
// entirely in the z=0 plane, centered at the origin, with radius 'rBend'. 
// Angle 'theta' measures position along the circle: it beings at theta=0 at
// the point (rBend,0,0) on the +x axis, and as theta grows greater than zero  
// the circle extends in the counter-clockwise (CCW) or right-handed direction 
// of rotation, moving towards the +y axis where theta will reach +90deg., 
// consistent with all the other right-handed coordinate systems.
// 		This bent tube forms a torus because the tube itself has a circular cross-
// section with radius 'rTube' , and we measure position on that circle by the 
// angle 'phi'. Again we use the right-handed coordinate system to define 'phi':
// it measures angle in the CCW direction around the tube's centerline, circling 
// right-handed along the direction of increasing theta. 
// 	For example theta=0, phi=0 selects the torus surface point (rBend+rTube,0,0);
// a slight increase in angle phi moves the point in -z direction and a slight
// increase in theta moves that point in circularly towards the +y axis.  
// To construct the torus, 
// --we begin with the circle that forms the starting edge of the tube, 
// where theta == 0 (e.g. the torus surface within the y=0 plane)
//					xc = rBend + rTube*cos(phi); 		// tube's circular crossection
//					yc = 0; 
//					zc = -rTube*sin(phi);			(note NEGATIVE sin() this ensures that
//																		 increasing phi moves CCW around the torus
//                                     center-line direction, now at (0,+1,0)
// and then rotate the circle given by xc,yc,zc around the z-axis by angle theta:
//					x = xc*cos(theta) - yc*sin(theta)  // (contents of a 2D rot matrix)
//					y = xc*sin(theta) + yc*cos(theta)
//					z = zc
// Plug in the (xc,yc,zc) values from above & simplify. As yc==0, we can write:
//					x = (rBend + rTube*cos(phi))*cos(theta)
//					y = (rBend + rTube*cos(phi))*sin(theta) 
//					z = -rTube*sin(phi)
// 

var rTube = 0.12;										// Radius of the tube we bent to form a torus
var rBend = 1.0;										// Radius of circle made by tube's centerline
																		//(Set rTube <rBend to keep torus hole open!)
var tubeRings = 23;									// # of stepped-spiral rings(constant theta)
																		// along the entire length of the bent tube.
																		// (>=3 req'd: more for smoother bending)
var ringSides = 13;									// # of sides of each ring (and thus the 
																		// number of vertices in their cross-section)
																		// >=3 req'd;more for rounder cross-sections)
// for nice-looking torus with approx square facets, 
//			--choose odd or prime#  for ringSides, and
//			--choose odd or prime# for tubeRings of approx. ringSides *(rBend/rTube)
// EXAMPLE: rBend = 1, rTube = 0.5, tubeRings =23, ringSides = 11.

// Create a (global) array to hold this torus's vertices:
 // g_torVertAry = new Float32Array(g_floatsPerVertex*(2*ringSides*tubeRings +2));


// Create a (global) array to hold this sphere's vertices:
var g_torPosAry = new Float32Array(  (2*ringSides*tubeRings +2) * g_floatsPerPos);

var g_torColorAry = new Float32Array(  (2*ringSides*tubeRings +2) * g_floatsPerColor);

//	Each slice requires 2*ringSides vertices, but 1st tubeRing will skip its 
// first triangle where phi=0, leaving behind an empty triangular hole. 
// Similarly, the last tubeRing will skip its last triangle. To 'close' the 
// torus, we repeat the first 2 vertices at the end of the last tubeRing.  
//  (Said another way: the first edge in the first tubeRing is parallel to
//
// the torus' center-line (an edge of constant phi), but that ring ends with a
// diagonal edge that goes up to the next ring, and leaves a triangular 'hole'.
// Similarly, the last edge of the last tubeRing is also parallel to the torus
// center-line. This leaves open 2 triangles.  We can fill them both by adding
// just 2 more vertices to the end of the triangle-strip, placed at the same
// location as the 1st two vertices in the triangle strip.)

var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/tubeRings;	// theta angle between each tube ring
var phiHalfStep = Math.PI/ringSides;	// half-phi angle between each ringSide
																			// (WHY HALF? 2 vertices per step in phi)
	// s counts rings along the tube; 
	// v counts vertices within one ring (starts at 0 for each ring)
	// j counts array elements (vertices * g_floatsPerVertex) put in g_torVertAry array.
	for(s=0,j=0; s<tubeRings; s++) 
	{		// for each 'ring' of the torus:
		for(v=0; v< 2*ringSides; v++, j+=g_floatsPerPos) 
			{	// for each vertex in this segment:
			if(v%2==0)	{	// position the even #'d vertices at bottom of segment,
				g_torPosAry[j  ] = (rBend + rTube*Math.cos((v)*phiHalfStep)) * 
				                               Math.cos((s)*thetaStep);
							  //	x = (rBend + rTube*cos(phi)) * cos(theta)
				g_torPosAry[j+1] = (rBend + rTube*Math.cos((v)*phiHalfStep)) *
				                               Math.sin((s)*thetaStep);
								//  y = (rBend + rTube*cos(phi)) * sin(theta) 
				g_torPosAry[j+2] = -rTube*Math.sin((v)*phiHalfStep);
								//  z = -rTube  *   sin(phi)
				g_torPosAry[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				g_torPosAry[j  ] = (rBend + rTube*Math.cos((v-1)*phiHalfStep)) * 
                                       Math.cos((s+1)*thetaStep);
							  //	x = (rBend + rTube*cos(phi)) * cos(NextTheta)
				g_torPosAry[j+1] = (rBend + rTube*Math.cos((v-1)*phiHalfStep)) *
				                               Math.sin((s+1)*thetaStep);
								//  y = (rBend + rTube*cos(phi)) * sin(NextTheta) 
				g_torPosAry[j+2] = -rTube*Math.sin((v-1)*phiHalfStep);
								//  z = -rTube  *   sin(phi)
				g_torPosAry[j+3] = 1.0;		// w
			}
			if(v==0 && s!=0) {
				g_torColorAry[j] = 0.88;
				g_torColorAry[j+1] = 0.88;
				g_torColorAry[j+2] = 0.5;
				g_torColorAry[j+3] = 1;	
			}
			else {
				g_torColorAry[j] = 0.88;
				g_torColorAry[j+1] = 0.88;
				g_torColorAry[j+2] = 0.5;
				g_torColorAry[j+3] = 1;	
			}
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
	// (curious? put these two vertices at the origin to see them on-screen)
	g_torPosAry[j  ] = rBend + rTube;	// copy vertex zero;
				  //	x = (rBend + rTube*cos(phi==0)) * cos(theta==0)
	g_torPosAry[j+1] = 0.0;
					//  y = (rBend + rTube*cos(phi==0)) * sin(theta==0) 
	g_torPosAry[j+2] = 0.0;
					//  z = -rTube  *   sin(phi==0)
	g_torPosAry[j+3] = 1.0;		// w

	g_torColorAry[j] = 0.88;
	g_torColorAry[j+1] = 0.88;
	g_torColorAry[j+2] = 0.5;
	g_torColorAry[j+3] = 1;	

	j+=g_floatsPerPos; // go to next vertex:
	g_torPosAry[j  ] = (rBend + rTube) * Math.cos(thetaStep);
				  //	x = (rBend + rBar*cos(phi==0)) * cos(theta==thetaStep)
	g_torPosAry[j+1] = (rBend + rTube) * Math.sin(thetaStep);
					//  y = (rBend + rTube*cos(phi==0)) * sin(theta==thetaStep) 
	g_torPosAry[j+2] = 0.0;
					//  z = -rTube  *   sin(phi==0)
	g_torPosAry[j+3] = 1.0;		// w

	g_torColorAry[j] = 0.88;
	g_torColorAry[j+1] = 0.88;
	g_torColorAry[j+2] = 0.5;
	g_torColorAry[j+3] = 1;	
	// DONE!


  appendObject('Torus', g_torPosAry, g_torColorAry);
}
*/