// Create shared variable. The value is given as the interpolation between normals computed in the vertex shader
uniform int rcState;
uniform vec3 remotePosition;
uniform float enhance;
varying vec3 interpolatedNormal;
varying float dist;
/* HINT: YOU WILL NEED A DIFFERENT SHARED VARIABLE TO COLOR ACCORDING TO POSITION */

void main() {
  // Set final rendered color according to the surface normal
  	vec3 mod = vec3(normalize(interpolatedNormal));

  	gl_FragColor = vec4(normalize(interpolatedNormal), 1.0); 
	//Paint it red
	if(rcState == 1)
	mod = vec3(1, 0, 0);

	//Paint it green
	if(rcState == 2)
	mod = vec3(0, 1, 0);

	//Paint it blue
	if(rcState == 3)
	mod = vec3(0, 0, 1);

  	if((dist <= 4.0) && ((rcState == 1) || (rcState == 2) ||(rcState == 3)))
	gl_FragColor = vec4(mod + vec3(enhance, enhance, enhance),1.0);
	
  	
}
