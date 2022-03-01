#ifdef LINT
precision mediump float;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
#endif

#define M_PI 3.14159265358979323846

varying vec4 vColor;
varying vec2 vUv;
varying vec3 vNormal;

void main(){
	gl_FragColor=vColor;
}