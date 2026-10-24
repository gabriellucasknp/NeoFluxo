import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Navigation2 } from 'lucide-react';
import { CountUp } from './StatCard';
import { spring } from './motion';

/*
 * Bloco de demanda (hoje são 7 versões). Medidor em arco com a setinha do "832" da ref 4:
 * o arco enche e a seta gira até a demanda calculada; o traço marca o limite da Baixa Tensão (75 kW).
 */

const W = 240;
const R = 96;
const CX = W / 2;
const CY = 140; // folga em cima pro traço e o rótulo do limite

function point(f: number, r = R) {
  const a = Math.PI * (1 - f); // f=0 à esquerda, f=1 à direita
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
}

function arc(f0: number, f1: number) {
  const [x0, y0] = point(f0);
  const [x1, y1] = point(f1);
  // meia-volta no máximo: o arco é sempre o "pequeno" (flag 0). Com 1, acima da metade ele dava a volta pelo outro lado.
  return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
}

export function DemandGauge({
  demand,
  limit = 75,
  max,
  norma,
}: {
  /** demanda calculada em kW */
  demand: number;
  /** acima disso o projeto sai da Baixa Tensão */
  limit?: number;
  max?: number;
  norma?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const top = max ?? Math.max(limit * 2, demand * 1.15);
  const f = Math.min(demand / top, 1);
  const fl = limit / top;
  const mt = demand > limit;
  const [lx0, ly0] = point(fl, R - 20);
  const [lx1, ly1] = point(fl, R + 20);

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <div className="min-w-[150px]">
        <p className={`text-sm font-semibold ${mt ? 'text-warning-fg' : 'text-success-fg'}`}>{mt ? `+${(demand - limit).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kW acima do limite` : 'Dentro do limite'}</p>
        <p className="mt-1 flex items-baseline gap-1.5 font-display text-6xl font-light leading-none tracking-tight text-fg">
          <CountUp value={demand} decimals={1} />
          <span className="text-xl font-medium text-muted">kW</span>
        </p>
        <p className="mt-2 max-w-[22ch] text-sm text-muted">
          {mt ? 'Média Tensão' : 'Baixa Tensão'} · {norma ?? (mt ? 'DIS-NOR-053' : 'DIS-NOR-030')}
        </p>
      </div>

      <div className="relative" style={{ width: W, height: CY + 18 }}>
        <svg viewBox={`0 0 ${W} ${CY + 18}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="gauge-fill" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="rgb(var(--chart-2))" />
              <stop offset="1" stopColor="rgb(var(--primary))" />
            </linearGradient>
          </defs>
          <path d={arc(0, 1)} fill="none" stroke="rgb(var(--surface-3))" strokeWidth="26" strokeLinecap="round" />
          <motion.path
            d={arc(0, Math.max(f, 0.001))}
            fill="none"
            stroke="url(#gauge-fill)"
            strokeWidth="26"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: seen ? 1 : 0 }}
            transition={{ ...spring.soft, stiffness: 90, damping: 22 }}
          />
          <line x1={lx0} y1={ly0} x2={lx1} y2={ly1} stroke="rgb(var(--fg))" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="absolute text-[11px] font-semibold text-fg-2" style={{ left: lx1 - 16, top: ly1 - 20 }}>
          {limit} kW
        </span>
        <motion.div
          className="absolute left-1/2 flex h-12 w-12 items-center justify-center"
          style={{ top: CY - 30, x: '-50%' }}
          initial={{ rotate: -90 }}
          animate={{ rotate: seen ? -90 + 180 * f : -90 }}
          transition={{ type: 'spring', stiffness: 70, damping: 14 }}
        >
          <Navigation2 className="h-9 w-9 fill-fg text-fg" strokeWidth={1.5} />
        </motion.div>
      </div>
    </div>
  );
}
