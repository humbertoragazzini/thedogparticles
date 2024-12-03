varying vec3 vColor;

void main()
{

    vec2 uv = gl_PointCoord;
    // float distanceToCenter = distance(uv, vec2(0.5));
    float distanceToCenter = length(uv - vec2(0.5));

    // discard make the shader not render the pixel in the position
    if(distanceToCenter > 0.5){
        discard;
    }

    gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}