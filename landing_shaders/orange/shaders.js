const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying vec2 vPosition;
    
    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vPosition = aVertexPosition.xy;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    
    uniform vec4 uColor;
    uniform float uOpacity;
    uniform float uBlurFactor;
    
    varying vec2 vPosition;

    // Pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
        // Calculate distance from center for circle
        float dist = length(vPosition);
        
        // Dynamic blur edge based on fade progress
        float blurStart = mix(0.85, 0.5, uBlurFactor);
        float alpha = (1.0 - smoothstep(blurStart - 0.15, blurStart, dist)) * uOpacity;
        
        // Add grain effect with fade
        vec2 grainUv = vPosition * 2.0; // Scale UV for more visible grain
        float grain = random(grainUv + vec2(fract(uBlurFactor * 123.456))); // Animate grain with blur factor
        float grainStrength = 0.1 * alpha; // Adjust grain intensity and fade it with alpha
        
        // For multiply mode, we need to output white (1.0) for fully transparent areas
        vec3 baseColor = mix(vec3(1.0), uColor.rgb * 0.7, alpha);
        vec3 grainColor = mix(baseColor, baseColor * (1.0 - grainStrength), grain);
        
        gl_FragColor = vec4(grainColor, 1.0);  // Always use alpha of 1.0 for multiply mode
    }
`; 