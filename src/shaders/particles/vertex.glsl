uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

varying vec3 vColor;

void main()
{
    //displacement
    vec3 newPosition = position;
    float displacementIntensity = texture(uDisplacementTexture,uv).r;

    vec3 displacementDirection = vec3(0.0,0.0,1.0);

    displacementDirection*=displacementIntensity;

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