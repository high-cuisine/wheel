import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Segment } from '../types';
import { useLang } from '../LangContext';

interface WheelProps {
  segments: Segment[];
  onSpin: () => void;
  onSpinEnd: (segmentIndex: number) => void;
  isSpinning: boolean;
  displaySize: number;
}

export interface WheelHandle {
  spin: (targetIndex: number) => void;
}

// Internal drawing resolution — always 500×500 logical pixels
const SIZE = 500;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = 232;
const RIM_W = 14;
const WHEEL_R = OUTER_R - RIM_W / 2 - 1;
const HUB_R = 62;
const SPIN_DURATION = 4500;
const MIN_REVOLUTIONS = 5;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function hex2rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hex2rgb(hex);
  return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`;
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  rotation: number,
) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  const n = segments.length;
  const segAngle = (2 * Math.PI) / n;

  // Outer glow ring
  const outerGlow = ctx.createRadialGradient(CX, CY, OUTER_R - 20, CX, CY, OUTER_R + 22);
  outerGlow.addColorStop(0, 'rgba(255,210,0,0.25)');
  outerGlow.addColorStop(1, 'rgba(255,210,0,0)');
  ctx.beginPath();
  ctx.arc(CX, CY, OUTER_R + 22, 0, 2 * Math.PI);
  ctx.fillStyle = outerGlow;
  ctx.fill();

  // Draw segments
  for (let i = 0; i < n; i++) {
    const startAngle = i * segAngle - rotation - Math.PI / 2;
    const endAngle = startAngle + segAngle;
    const midAngle = startAngle + segAngle / 2;

    const fx = CX + Math.cos(midAngle) * WHEEL_R;
    const fy = CY + Math.sin(midAngle) * WHEEL_R;
    const tx = CX + Math.cos(midAngle) * HUB_R;
    const ty = CY + Math.sin(midAngle) * HUB_R;
    const grad = ctx.createLinearGradient(fx, fy, tx, ty);
    grad.addColorStop(0, lighten(segments[i].color, 35));
    grad.addColorStop(0.4, segments[i].color);
    grad.addColorStop(1, segments[i].color);

    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, WHEEL_R, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Segment text
    const label = segments[i].label;
    const isLong = label.length > 6;
    const fontSize = isLong ? 10 : label.length > 4 ? 13 : 16;
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(midAngle);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 5;
    ctx.font = `bold ${fontSize}px 'Rajdhani', sans-serif`;
    ctx.fillText(label, WHEEL_R - 10, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Gold outer rim
  const rimGrad = ctx.createLinearGradient(CX - OUTER_R, CY, CX + OUTER_R, CY);
  rimGrad.addColorStop(0, '#7a5200');
  rimGrad.addColorStop(0.25, '#ffd700');
  rimGrad.addColorStop(0.5, '#fff8c0');
  rimGrad.addColorStop(0.75, '#ffd700');
  rimGrad.addColorStop(1, '#7a5200');
  ctx.beginPath();
  ctx.arc(CX, CY, OUTER_R, 0, 2 * Math.PI);
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = RIM_W;
  ctx.stroke();

  // Rivets
  for (let i = 0; i < n; i++) {
    const angle = i * segAngle - rotation - Math.PI / 2;
    const rx = CX + OUTER_R * Math.cos(angle);
    const ry = CY + OUTER_R * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(rx, ry, 5, 0, 2 * Math.PI);
    const rg = ctx.createRadialGradient(rx - 1, ry - 1, 1, rx, ry, 5);
    rg.addColorStop(0, '#ffe97a');
    rg.addColorStop(1, '#a07000');
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.strokeStyle = '#5a3a00';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Inner gold ring
  ctx.beginPath();
  ctx.arc(CX, CY, HUB_R + 8, 0, 2 * Math.PI);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hub
  const hubGrad = ctx.createRadialGradient(CX - 18, CY - 18, 4, CX, CY, HUB_R);
  hubGrad.addColorStop(0, '#3a1277');
  hubGrad.addColorStop(0.6, '#1a0845');
  hubGrad.addColorStop(1, '#0d0420');
  ctx.beginPath();
  ctx.arc(CX, CY, HUB_R, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hub decorative rays
  ctx.save();
  ctx.translate(CX, CY);
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(0, HUB_R - 8);
    ctx.strokeStyle = 'rgba(255,215,0,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();

  // Hub jewel
  const jewelGrad = ctx.createRadialGradient(CX - 4, CY - 4, 2, CX, CY, 12);
  jewelGrad.addColorStop(0, '#ff6b6b');
  jewelGrad.addColorStop(0.5, '#cc0000');
  jewelGrad.addColorStop(1, '#7a0000');
  ctx.beginPath();
  ctx.arc(CX, CY, 12, 0, 2 * Math.PI);
  ctx.fillStyle = jewelGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pointer triangle
  const pTip = CY - OUTER_R - 4;
  ctx.beginPath();
  ctx.moveTo(CX, pTip + 26);
  ctx.lineTo(CX - 14, pTip + 4);
  ctx.lineTo(CX + 14, pTip + 4);
  ctx.closePath();
  const pGrad = ctx.createLinearGradient(CX - 14, pTip + 4, CX + 14, pTip + 4);
  pGrad.addColorStop(0, '#cc2222');
  pGrad.addColorStop(0.5, '#ff4444');
  pGrad.addColorStop(1, '#cc2222');
  ctx.fillStyle = pGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pointer diamond
  ctx.save();
  ctx.translate(CX, pTip);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.rect(-7, -7, 14, 14);
  const dGrad = ctx.createLinearGradient(-7, -7, 7, 7);
  dGrad.addColorStop(0, '#ff6666');
  dGrad.addColorStop(1, '#990000');
  ctx.fillStyle = dGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

const Wheel = forwardRef<WheelHandle, WheelProps>(
  ({ segments, onSpin, onSpinEnd, isSpinning, displaySize }, ref) => {
    const { T } = useLang();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);
    const animRef = useRef<number | null>(null);
    const scale = displaySize / SIZE;

    const draw = useCallback(
      (rotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawScene(ctx, segments, rotation);
      },
      [segments],
    );

    useEffect(() => {
      draw(rotationRef.current);
    }, [draw]);

    useImperativeHandle(ref, () => ({
      spin(targetIndex: number) {
        if (animRef.current !== null) return;

        const n = segments.length;
        const segAngle = (2 * Math.PI) / n;

        const targetRot = (targetIndex + 0.5) * segAngle;
        const currentMod =
          ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let delta = targetRot - currentMod;
        if (delta <= 0) delta += 2 * Math.PI;

        const totalDelta = MIN_REVOLUTIONS * 2 * Math.PI + delta;
        const startRotation = rotationRef.current;
        const endRotation = startRotation + totalDelta;
        const startTime = performance.now();

        function animate(now: number) {
          const t = Math.min(1, (now - startTime) / SPIN_DURATION);
          const eased = easeOutCubic(t);
          const current = startRotation + totalDelta * eased;
          rotationRef.current = current;
          draw(current);

          if (t < 1) {
            animRef.current = requestAnimationFrame(animate);
          } else {
            rotationRef.current = endRotation;
            draw(endRotation);
            animRef.current = null;
            onSpinEnd(targetIndex);
          }
        }

        animRef.current = requestAnimationFrame(animate);
      },
    }));

    // Outer wrapper reports displaySize dimensions in the layout flow.
    // Inner wrapper is 500×500 and scaled with CSS transform to fill the outer box.
    return (
      <div
        style={{
          position: 'relative',
          width: displaySize,
          height: displaySize,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: SIZE,
            height: SIZE,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            style={{
              display: 'block',
              filter: 'drop-shadow(0 0 30px rgba(120,50,220,0.6))',
            }}
          />
          {/* Spin button overlaid on hub — coordinates in 500px space */}
          <button
            onClick={onSpin}
            disabled={isSpinning}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 190,
              height: 52,
              borderRadius: 26,
              background: isSpinning
                ? 'linear-gradient(135deg, #166534, #14532d)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.3)',
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 3,
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              boxShadow: isSpinning
                ? 'none'
                : '0 4px 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.2)',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {isSpinning ? T.spinning : T.spin}
          </button>
        </div>
      </div>
    );
  },
);

Wheel.displayName = 'Wheel';
export default Wheel;
