// Create shared variable for the vertex and fragment shaders
varying vec3 interpolatedNormal;
varying float dist;

uniform int rcState;
uniform float enhance;
uniform vec3 remotePosition;

/* HINT: YOU WILL NEED A DIFFERENT SHARED VARIABLE TO COLOR ACCORDING TO POSITION */

void main() {
    // Set shared variable to vertex normal
    interpolatedNormal = normal;

    // Set transformation matrix
    mat4 transformMat;
	transformMat[0] = vec4(7.0, 0.0, 0.0, 0.0);
	transformMat[1] = vec4(0.0, 7.0, 0.0, 0.0);
	transformMat[2] = vec4(0.0, 0.0, 7.0, 0.0);
	transformMat[3] = vec4(0.0, 1.0, 0.0, 1.0);


    vec4 posits = modelMatrix* transformMat * vec4(position, 1.0);
    dist = distance(posits, vec4(remotePosition,1.0));


    // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
    gl_Position = projectionMatrix * modelViewMatrix* transformMat  * vec4(position, 1.0);


    // Sets wavy motion whenever remote moves
    if(rcState == 4){
        if(mod(dist, 2.0) >= 0.5){
            gl_Position = projectionMatrix * modelViewMatrix* transformMat  * vec4(position + vec3(0,-1/7,0), 1.0);
        }
        if(mod(dist, 2.0) < 0.5){
            gl_Position = projectionMatrix * modelViewMatrix* transformMat  * vec4(position + vec3(0,0.025 + enhance,0), 1.0);
        }
    }



    // Magnifies parts of the dragon thats close to the remote
    if(rcState == 5){
        if (dist <= 4.0){
            gl_Position = projectionMatrix * modelViewMatrix* transformMat  * vec4((position + vec3(0,-1/7,0)) * vec3(enhance,enhance,enhance), 1.0);
        }
    }

    // X-Ray
    if(rcState == 6){
        if (dist <= 4.0){
            gl_Position = projectionMatrix * modelViewMatrix* transformMat  * vec4((position + vec3(0,-1/7,0)) / vec3(0,0,0), 1.0);
        }
    }
    
}
