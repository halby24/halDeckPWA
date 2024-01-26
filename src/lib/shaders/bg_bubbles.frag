#version 300 es
precision highp float;

uniform float iAspect;
uniform float iTime;// shader playback time (in seconds)
in vec2 fragCoord;
out vec4 fragColor;

vec3 screen(vec3 a,vec3 b){return 1.0-(1.0-a)*(1.0-b);} // screen blending

void main()
{
    vec2 uv=fragCoord;
    uv.x*=iAspect;
    
    // background
    vec3 color_bottom=vec3(0.2275, 0.0627, 0.0863);
    vec3 color_top=vec3(0.3922, 0.149, 0.3333);
    vec3 color=mix(color_bottom,color_top,uv.y);
    
    // bubbles
    for(int i=0;i<20;i++)
    {
        // bubble seeds
        float pha=sin(float(i)*546.13+1.)*.5+.5;
        float siz=pow(sin(float(i)*651.74+5.)*.5+.5,4.);
        float pox=sin(float(i)*321.55+4.1)*iAspect;
        
        // bubble size, position and color
        float rad=.1+.2*siz;
        vec2 pos=vec2(pox,-1.-rad+(2.+2.*rad)*mod(pha+.1*iTime*(.2+.8*siz),1.));
        float dis=length(uv-pos);
        vec3 col=mix(vec3(0.8078, 0.3765, 0.7059),vec3(0.4784, 0.5922, 0.7451),.5+.5*sin(float(i)*1.2+1.9));
        //    col+= 8.0*smoothstep( rad*0.95, rad, dis );
        
        // render
        float f=length(uv-pos)/rad;
        f=sqrt(clamp(1.-f*f,0.,1.));
        color=screen(color, col.zyx*(1.-smoothstep(rad*.95,rad,dis))*f);
    }
    
    // vigneting
    color*=sqrt(1.5-.5*length(uv));
    
    fragColor=vec4(color,1.);
}