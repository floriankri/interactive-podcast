import { useEffect, useRef, useState } from 'react';

// Shader sources from blue shader implementation
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

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
        float dist = length(vPosition);
        float blurStart = mix(0.85, 0.5, uBlurFactor);
        float alpha = (1.0 - smoothstep(blurStart - 0.15, blurStart, dist)) * uOpacity;
        vec2 grainUv = vPosition * 2.0;
        float grain = random(grainUv + vec2(fract(uBlurFactor * 123.456)));
        float grainStrength = 0.1 * alpha;
        vec3 baseColor = mix(vec3(1.0), uColor.rgb * 0.7, alpha);
        vec3 grainColor = mix(baseColor, baseColor * (1.0 - grainStrength), grain);
        gl_FragColor = vec4(grainColor, 1.0);
    }
`;

class Circle {
    constructor(gl: WebGLRenderingContext, x: number, y: number, size: number, color: number[]) {
        this.gl = gl;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.opacity = 1.0;
        this.blurFactor = 0.15;
        this.creationTime = Date.now();
        this.lifetime = 1500;
        this.initialSize = size;
    }

    overlapsWith(other: Circle) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sumOfRadii = (this.size + other.size);
        const overlap = Math.max(0, sumOfRadii - distance) / Math.min(this.size, other.size);
        return overlap;
    }

    update() {
        const age = Date.now() - this.creationTime;
        const progress = age / this.lifetime;
        this.opacity = Math.max(0, 1 - progress);
        this.blurFactor = progress;
        this.size = this.initialSize * (1 - progress * 0.5);
        return this.opacity > 0;
    }

    gl: WebGLRenderingContext;
    x: number;
    y: number;
    size: number;
    color: number[];
    opacity: number;
    blurFactor: number;
    creationTime: number;
    lifetime: number;
    initialSize: number;
}

class CircleVisualizer {
    constructor(canvas: HTMLCanvasElement, position: 'left' | 'center' | 'right') {
        this.canvas = canvas;
        this.position = position;
        this.gl = canvas.getContext('webgl', {
            antialias: false,
            alpha: true
        }) as WebGLRenderingContext;

        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.circles = [];
        this.initWebGL();
        this.initBuffers();
        this.setupEventListeners();

        const height = 0.9;
        const width = height * (2.0/3.0);
        const backgroundColor = position === 'left' 
            ? [0.455, 0.675, 0.780, 0.1]  // Blue
            : position === 'center' ? [0.690, 0.294, 0.518, 0.1] : [0.408, 0.682, 0.678, 0.1]; // Pink : Green
        this.backgroundShape = new Circle(
            this.gl,
            0,
            0,
            width,
            backgroundColor
        );
        this.backgroundShape.blurFactor = 0.5;

        this.animate();
    }

    private initWebGL() {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        this.program = this.gl.createProgram()!;
        this.gl.attachShader(this.program, vertexShader!);
        this.gl.attachShader(this.program, fragmentShader!);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link');
        }

        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'aVertexPosition'),
            modelView: this.gl.getUniformLocation(this.program, 'uModelViewMatrix')!,
            projection: this.gl.getUniformLocation(this.program, 'uProjectionMatrix')!,
            color: this.gl.getUniformLocation(this.program, 'uColor')!,
            opacity: this.gl.getUniformLocation(this.program, 'uOpacity')!,
            blurFactor: this.gl.getUniformLocation(this.program, 'uBlurFactor')!
        };
    }

    private compileShader(type: number, source: string) {
        const shader = this.gl.createShader(type);
        if (!shader) return null;
        
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    private initBuffers() {
        const positions = [
            -1.0,  1.0,
             1.0,  1.0,
            -1.0, -1.0,
             1.0, -1.0,
        ];

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        
        this.buffers = {
            position: positionBuffer
        };
    }

    private setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    private resizeCanvas() {
        const size = 600; // Doubled from 300
        this.canvas.width = size;
        this.canvas.height = size;
        this.gl.viewport(0, 0, size, size);
    }

    private drawCircle(circle: Circle) {
        const projectionMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        const modelViewMatrix = new Float32Array([
            circle.size, 0, 0, 0,
            0, circle.size, 0, 0,
            0, 0, 1, 0,
            circle.x, circle.y, 0, 1
        ]);

        this.gl.uniformMatrix4fv(this.locations.modelView, false, modelViewMatrix);
        this.gl.uniformMatrix4fv(this.locations.projection, false, projectionMatrix);
        this.gl.uniform4fv(this.locations.color, new Float32Array(circle.color));
        this.gl.uniform1f(this.locations.opacity, circle.opacity);
        this.gl.uniform1f(this.locations.blurFactor, circle.blurFactor);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    private animate = () => {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
        this.gl.vertexAttribPointer(this.locations.position, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.locations.position);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ZERO);

        this.drawCircle(this.backgroundShape);

        this.circles = this.circles.filter(circle => {
            const isAlive = circle.update();
            if (isAlive) {
                this.drawCircle(circle);
            }
            return isAlive;
        });

        requestAnimationFrame(this.animate);
    }

    public spawnRandomCircle() {
        const size = 0.523;
        const maxX = 0.9 - size;
        const maxY = 0.9 - size;
        let x, y;
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 30) {
            x = (Math.random() * 2 - 1) * maxX;
            y = (Math.random() * 2 - 1) * maxY;
            
            const baseColor = this.position === 'left'
                ? [0.455, 0.675, 0.780] // Blue
                : this.position === 'center' ? [0.690, 0.294, 0.518] : [0.408, 0.682, 0.678]; // Pink : Green
            
            const color = [
                baseColor[0] + Math.random() * 0.1,
                baseColor[1] + Math.random() * 0.1,
                baseColor[2] + Math.random() * 0.1,
                1.0
            ];
            
            const newCircle = new Circle(this.gl, x, y, size, color);
            validPosition = true;
            
            for (const existingCircle of this.circles) {
                if (existingCircle.opacity > 0.8 && newCircle.overlapsWith(existingCircle) > 0.4) {
                    validPosition = false;
                    break;
                }
            }
            
            if (validPosition) {
                this.circles.push(newCircle);
                break;
            }
            attempts++;
        }
    }

    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private locations: {
        position: number;
        modelView: WebGLUniformLocation;
        projection: WebGLUniformLocation;
        color: WebGLUniformLocation;
        opacity: WebGLUniformLocation;
        blurFactor: WebGLUniformLocation;
    };
    private buffers: {
        position: WebGLBuffer | null;
    };
    private circles: Circle[];
    private backgroundShape: Circle;
    private position: 'left' | 'center' | 'right';
}

interface BlueShaderProps {
    currentWord: string;
    position: 'left' | 'center' | 'right';
    currentSpeaker: string;
    uniqueSpeakers: Set<string>;
}

export const BlueShader = ({ currentWord, position, currentSpeaker, uniqueSpeakers }: BlueShaderProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const visualizerRef = useRef<CircleVisualizer | null>(null);
    const [lastProcessedLength, setLastProcessedLength] = useState(0);
    const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({});

    // Effect to create speaker mapping when uniqueSpeakers changes
    useEffect(() => {
        const speakers = Array.from(uniqueSpeakers);
        if (speakers.length > 0) {
            const newSpeakerMap: Record<string, string> = {
                'left': speakers[0],
                'center': speakers[1] || speakers[0],
                'right': speakers[2] || speakers[0]
            };
            setSpeakerMap(newSpeakerMap);
        }
    }, [uniqueSpeakers]);

    useEffect(() => {
        if (canvasRef.current && !visualizerRef.current) {
            visualizerRef.current = new CircleVisualizer(canvasRef.current, position);
        }

        return () => {
            visualizerRef.current = null;
        };
    }, [position]);

    useEffect(() => {
        if (!visualizerRef.current || !speakerMap[position]) return;

        // Check if this shader's speaker is currently active
        const isActiveSpeaker = speakerMap[position] === currentSpeaker;
        
        if (!isActiveSpeaker) {
            setLastProcessedLength(currentWord.length);
            return;
        }

        // Check for new consonants in the word
        const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
        const newLength = currentWord.length;

        if (newLength > lastProcessedLength) {
            // Get the new characters
            const newChars = currentWord.slice(lastProcessedLength, newLength);
            
            // Count new consonants
            const newConsonants = [...newChars].filter(char => consonants.includes(char));
            
            // Spawn a circle for each new consonant only if this is the active speaker
            newConsonants.forEach(() => {
                visualizerRef.current?.spawnRandomCircle();
            });
        }

        setLastProcessedLength(newLength);
    }, [currentWord, lastProcessedLength, currentSpeaker, position, speakerMap]);

    return (
        <canvas
            ref={canvasRef}
            id={`glCanvas-${position}`}
            style={{
                position: 'absolute',
                top: position === 'right' ? '-100px' : 
                     position === 'center' ? '400px' : '20px',
                left: position === 'left' ? '20px' : 
                      position === 'center' ? '75%' : 'calc(100% - 820px)',
                transform: position === 'center' ? 'translateX(-50%)' : 'none',
                right: 'auto',
                width: '600px',
                height: '600px',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
}; 