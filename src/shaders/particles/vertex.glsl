uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

attribute float aIntensity;
attribute float aAngles;

varying vec3 vColor;

void main()
{
    //displacement
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture,uv).r;
    displacementIntensity = smoothstep(0.1,0.3,displacementIntensity);
    vec3 displacementDirection = vec3(cos(aAngles),sin(aAngles),5.0);
    displacementDirection = normalize(displacementDirection);
    displacementDirection*=displacementIntensity * 3.0;
    displacementDirection*=aIntensity;

    newPosition+=displacementDirection;

    // Final position 
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // picture
    float pictureIntensity = texture(uPictureTexture, uv).r;

    // Point size
    gl_PointSize = pictureIntensity * 0.05 * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // varyings
    vColor = vec3(pow(pictureIntensity, 2.0));
}