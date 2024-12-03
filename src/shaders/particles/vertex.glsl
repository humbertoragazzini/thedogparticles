uniform vec2 uResolution;
uniform sampler2D uPictureTexture;

varying vec3 vColor;

void main()
{
    // Final position 
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // picture
    float pictureIntensity = texture(uPictureTexture, uv).r;

    // Point size
    gl_PointSize = pictureIntensity * 0.3 * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // varyings
    vColor = vec3(pictureIntensity);
}