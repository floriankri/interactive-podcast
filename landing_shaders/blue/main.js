class Circle {
    constructor(gl, x, y, size, color) {
        this.gl = gl;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.opacity = 1.0;
        this.blurFactor = 0.15;  // Start with a slight blur
        this.creationTime = Date.now();
        this.lifetime = 1500; // 1.5 seconds lifetime
        this.initialSize = size;  // Store initial size
    }

    // Check overlap percentage with another circle
    overlapsWith(other) {
        // For circles, we can use the distance between centers
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate the overlap based on the radii
        const sumOfRadii = (this.size + other.size);
        const overlap = Math.max(0, sumOfRadii - distance) / Math.min(this.size, other.size);
        
        return overlap;
    }

    update() {
        const age = Date.now() - this.creationTime;
        const progress = age / this.lifetime;
        this.opacity = Math.max(0, 1 - progress);
        this.blurFactor = progress;
        // Shrink the size as it fades
        this.size = this.initialSize * (1 - progress * 0.5);  // Shrink to 50% of original size
        return this.opacity > 0;
    }
}

class CircleVisualizer {
    constructor() {
        console.log('CircleVisualizer initializing...');
        this.canvas = document.querySelector('#glCanvas');
        
        // Request WebGL context with anti-aliasing disabled
        this.gl = this.canvas.getContext('webgl', {
            antialias: false,
            alpha: true
        });
        
        if (!this.gl) {
            console.error('WebGL not supported');
            alert('Unable to initialize WebGL');
            return;
        }

        this.circles = [];
        this.initWebGL();
        this.initBuffers();
        this.setupEventListeners();

        // Create permanent background shape with light blue color
        const height = 0.9;  // 90% of viewport height
        const width = height * (2.0/3.0);  // 3:2 ratio
        this.backgroundShape = new Circle(
            this.gl,
            0,  // centered x
            0,  // centered y
            width,  // size based on height and ratio
            [0.455, 0.675, 0.780, 0.1]  // light blue (#74acc7) with 10% opacity
        );
        this.backgroundShape.blurFactor = 0.5;  // Set blur to 50%

        this.animate();
    }

    initWebGL() {
        console.log('Initializing WebGL...');
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.program));
            alert('Unable to initialize the shader program');
            return;
        }

        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'aVertexPosition'),
            modelView: this.gl.getUniformLocation(this.program, 'uModelViewMatrix'),
            projection: this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
            color: this.gl.getUniformLocation(this.program, 'uColor'),
            opacity: this.gl.getUniformLocation(this.program, 'uOpacity'),
            blurFactor: this.gl.getUniformLocation(this.program, 'uBlurFactor')
        };
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initBuffers() {
        // Create circle vertices
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

    setupEventListeners() {
        console.log('Setting up event listeners');
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add click event listener
        this.canvas.addEventListener('click', () => {
            // Spawn 1-3 circles at random positions when clicked
            const numCircles = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numCircles; i++) {
                this.spawnRandomCircle();
            }
        });
        
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate the size of our circle viewport (75% of screen height)
        const circleSize = Math.min(window.innerHeight * 0.75, window.innerWidth);
        
        // Calculate viewport position to center the circle
        const xOffset = (window.innerWidth - circleSize) / 2;
        const yOffset = (window.innerHeight - circleSize) / 2;
        
        // Set the viewport to maintain 1:1 aspect ratio
        this.gl.viewport(xOffset, yOffset, circleSize, circleSize);
    }

    drawCircle(circle) {
        // Use a circle projection matrix
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

    animate() {
        // Clear the canvas
        this.gl.clearColor(0.94, 0.94, 0.94, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Use shader program
        this.gl.useProgram(this.program);

        // Set up position attribute
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
        this.gl.vertexAttribPointer(this.locations.position, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.locations.position);

        // Enable blending with multiply mode
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ZERO);  // Multiply blend mode

        // Draw background shape first
        this.drawCircle(this.backgroundShape);

        // Update and draw circles
        this.circles = this.circles.filter(circle => {
            const isAlive = circle.update();
            if (isAlive) {
                this.drawCircle(circle);
            }
            return isAlive;
        });

        requestAnimationFrame(() => this.animate());
    }

    spawnRandomCircle() {
        // Use fixed size for all circles
        const size = 0.523;
        
        // Random position within bounds - adjusted for more central spawning
        const maxX = 0.9 - size;  // Increased boundary for wider spawn area
        const maxY = 0.9 - size;  // Increased boundary for wider spawn area
        let x, y;
        let validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 30) {
            x = (Math.random() * 2 - 1) * maxX;
            y = (Math.random() * 2 - 1) * maxY;
            
            // Random color with light blue base
            const color = [
                0.455 + Math.random() * 0.1,  // Red component
                0.675 + Math.random() * 0.1,  // Green component
                0.780 + Math.random() * 0.1,  // Blue component
                1.0                           // Alpha component
            ];
            
            const newCircle = new Circle(this.gl, x, y, size, color);
            validPosition = true;
            
            for (const existingCircle of this.circles) {
                if (existingCircle.opacity < 0.8) continue;  // Only check collision with very solid circles
                const overlap = newCircle.overlapsWith(existingCircle);
                if (overlap > 0.4) {  // Allow more overlap
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        }
        
        if (validPosition) {
            const color = [
                0.455 + Math.random() * 0.1,
                0.675 + Math.random() * 0.1,
                0.780 + Math.random() * 0.1,
                1.0
            ];
            this.circles.push(new Circle(this.gl, x, y, size, color));
            console.log('Circle spawned at:', x, y, 'with size:', size);
        }
    }
}

// Start the visualization when the page loads
window.onload = () => {
    console.log('Window loaded, creating CircleVisualizer');
    new CircleVisualizer();
}; 