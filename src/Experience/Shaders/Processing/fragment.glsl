
#ifdef LINT
precision mediump float;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
#endif

uniform sampler2D tDiffuse;
uniform float uTime;

#define M_PI 3.14159265358979323846

varying vec4 vColor;
varying vec2 vUv;
varying vec3 vNormal;

/* Color palette */
#define BLACK vec3(0.,0.,0.)
#define WHITE vec3(1.,1.,1.)
#define RED vec3(1.,0.,0.)
#define GREEN vec3(0.,1.,0.)
#define BLUE vec3(0.,0.,1.)
#define YELLOW vec3(1.,1.,0.)
#define CYAN vec3(0.,1.,1.)
#define MAGENTA vec3(1.,0.,1.)
#define ORANGE vec3(1.,.5,0.)
#define PURPLE vec3(1.,0.,.5)
#define LIME vec3(.5,1.,0.)
#define ACQUA vec3(0.,1.,.5)
#define VIOLET vec3(.5,0.,1.)
#define AZUR vec3(0.,.5,1.)

void main(){
	vec4 color=texture2D(tDiffuse,vUv);
	
	gl_FragColor=color;
}