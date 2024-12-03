void main()
{

    vec2 uv = gl_PointCoord;
    // float distanceToCenter = distance(uv, vec2(0.5));
    float distanceToCenter = length(uv - vec2(0.5));



    gl_FragColor = vec4(vec3(distanceToCenter), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}