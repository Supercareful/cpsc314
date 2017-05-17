uniform int rcState;
uniform float enhance;

void main() {
	// HINT: WORK WITH rcState HERE
	//int test = rcState;
	//vec3 test = vec3(1, 0, 0);
	
	//Make starting color white
	if(rcState == 0)
	gl_FragColor = vec4(1,1,1,1);

	//Paint it red
	if(rcState == 1)
	gl_FragColor = vec4(1,0,0, 1);

	//Paint it green
	if(rcState == 2)
	gl_FragColor = vec4(0, 1, 0, 1);

	//Paint it blue
	if(rcState == 3)
	gl_FragColor = vec4(0, 0, 1, 1);

	//Paint it yellow
	if(rcState == 4)
	gl_FragColor = vec4(1,1,0,1);

	//Paint it pink
	if(rcState == 5)
	gl_FragColor = vec4(1,0,1,1);

	//Paint it black
	if(rcState == 6)
	gl_FragColor = vec4(0,0,0,1);
}