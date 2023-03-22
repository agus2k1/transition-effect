const fragmentShader = `
    varying vec2 vCoordinates;

    void main() {
        gl_FragColor = vec4(vCoordinates.x / 512., vCoordinates.y / 512., 0., 1.);
    }
`;

export default fragmentShader;
