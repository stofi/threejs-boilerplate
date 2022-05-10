
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

/* Controls */
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float hue;
uniform float seekDisortionAmount;
uniform float seekDisortionSpeed;
uniform float userBrightness;

vec3 rgb2hsv(vec3 c)
{
	vec4 K=vec4(0.,-1./3.,2./3.,-1.);
	vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));
	vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
	
	float d=q.x-min(q.w,q.y);
	float e=1.e-10;
	return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x);
}

vec3 hsv2rgb(vec3 c)
{
	vec4 K=vec4(1.,2./3.,1./3.,3.);
	vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
	return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

void main(){
	gl_FragColor=vColor;
	
	float xOffset=(vUv.y+max(sin(10.*uTime*seekDisortionSpeed+vUv.y*21.)*40.-38.8,0.))*seekDisortionAmount*seekDisortionSpeed;
	float yOffset=0.;
	vec2 offsetUv=mod(
		vec2(
			vUv.x+xOffset,
			vUv.y+yOffset
		),
		vec2(1.)
	);
	
	vec4 color=texture2D(tDiffuse,offsetUv);
	color.rgb/=color.a;
	// Apply contrast
	color.rgb=(
		(color.rgb-.5)*(max(contrast,0.)+.5)
	);
	
	// Apply brightness
	color.rgb+=(brightness*userBrightness)+.5;
	vec3 hsv=rgb2hsv(color.rgb);
	// Apply saturation
	// hsv.y=mix(hsv.y,saturation,step(hsv.y,saturation));
	// Apply hue
	// hsv.z=mix(hsv.z,hue,step(hsv.z,hue));
	color.rgb=hsv2rgb(hsv);
	
	color.rgb*=color.a;
	
	gl_FragColor=color;
	
	// vignette
	vec2 center=abs(vUv-.5);
	float xSin=1.-sin(center.x*M_PI);
	float ySin=1.-sin(center.y*M_PI);
	float falloff=pow(xSin*ySin,.3);
	float vignette=1.-smoothstep(.6,.8,length(center));
	float dark=1.-(falloff*vignette);
	// map dark from <0;1> to <.3;1>
	dark=1.-(dark*dark*.8+.2);
	gl_FragColor.rgb=mix(vec3(.027,.024,.02),gl_FragColor.rgb,dark);
	// gl_FragColor=vec4(AZUR,1.);
}