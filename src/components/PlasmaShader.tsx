import { useWebGL } from '../hooks/useWebGL';

const vertexShader = `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  
  void main() {
    // Normalizált koordináták -1..1 tartományban
    vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    // Egyszerű "plazma" jellegű minta
    float t = iTime * 0.7;
    float v = 0.0;
    v += sin(uv.x * 3.0 + t);
    v += sin(uv.y * 4.0 - t * 1.3);
    v += sin((uv.x + uv.y) * 5.0 + t * 0.7);
    v /= 3.0;

    // Színezés
    vec3 col = vec3(
      0.5 + 0.5 * sin(3.0 * v + t),
      0.5 + 0.5 * sin(3.0 * v + t + 2.0),
      0.5 + 0.5 * sin(3.0 * v + t + 4.0)
    );

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function PlasmaShader() {
    const canvasRef = useWebGL({
        vertexShader,
        fragmentShader,
    });

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
        />
    );
}
