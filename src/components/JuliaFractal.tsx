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
    // Normalizált koordináták -2..2 tartományban (zoom)
    vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 4.0 - 2.0;
    uv.x *= iResolution.x / iResolution.y;

    // Julia-halmaz paraméter (animált)
    float t = iTime * 0.3;
    vec2 c = vec2(
      -0.8 + 0.2 * sin(t),
      0.156 + 0.1 * cos(t * 1.3)
    );

    // Iteráció
    vec2 z = uv;
    float iter = 0.0;
    const float maxIter = 256.0;

    for (float i = 0.0; i < 256.0; i++) {
      if (dot(z, z) > 4.0) break;
      z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      iter = i;
    }

    // Színezés - sima átmenet
    float smoothIter = iter - log2(log2(dot(z, z)));
    float hue = smoothIter / 50.0;

    // HSV -> RGB konverzió
    vec3 col = vec3(
      0.5 + 0.5 * cos(6.28318 * (hue + 0.0)),
      0.5 + 0.5 * cos(6.28318 * (hue + 0.33)),
      0.5 + 0.5 * cos(6.28318 * (hue + 0.67))
    );

    // Sötétítés a halmaz belsejében
    if (iter >= maxIter - 1.0) col = vec3(0.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function JuliaFractal() {
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
