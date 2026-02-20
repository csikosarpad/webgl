import { useEffect, useRef, useCallback } from 'react';

interface WebGLSetupOptions {
    vertexShader: string;
    fragmentShader: string;
    uniforms?: Record<string, 'float' | 'vec2'>;
}

export function useWebGL(options: WebGLSetupOptions) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const startTimeRef = useRef<number>(performance.now());
    const animationFrameRef = useRef<number>(0);

    const compileShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }, []);

    const setupWebGL = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            alert('WebGL nem támogatott!');
            return;
        }
        glRef.current = gl;

        // Compile shaders
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, options.vertexShader);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, options.fragmentShader);

        if (!vertexShader || !fragmentShader) return;

        // Create and link program
        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);
        programRef.current = program;

        // Setup fullscreen triangle
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

        const aPosLoc = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [options.vertexShader, options.fragmentShader, compileShader]);

    const render = useCallback(() => {
        const gl = glRef.current;
        const canvas = canvasRef.current;
        const program = programRef.current;

        if (!gl || !canvas || !program) return;

        const now = performance.now();
        const t = (now - startTimeRef.current) / 1000.0;

        const iResolutionLoc = gl.getUniformLocation(program, 'iResolution');
        const iTimeLoc = gl.getUniformLocation(program, 'iTime');

        gl.uniform2f(iResolutionLoc, canvas.width, canvas.height);
        gl.uniform1f(iTimeLoc, t);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        animationFrameRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        const cleanup = setupWebGL();
        startTimeRef.current = performance.now();
        render();

        return () => {
            cleanup?.();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [setupWebGL, render]);

    return canvasRef;
}
