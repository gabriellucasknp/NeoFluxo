import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowButton } from './Button';
import { lift, spring } from './motion';

/*
 * Card de número (hoje são 2 jeitos, e o número grande não existia).
 * Número gigante e fino (refs 3, 9), rótulo em cima, ↗ redondo no canto (8, 10);
 * um card por linha vem destacado em azul cheio (7, 8, 10). O número conta até o valor quando aparece.
 */

const fmt = (n: number, decimals: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function CountUp({ value, decimals = 0, className = '' }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!seen || reduce) return setShown(value);
    const c = animate(0, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    return () => c.stop();
  }, [seen, value, reduce]);

  // a largura não pula enquanto conta: o valor final reserva o espaço
  return (
    <span ref={ref} className={`relative inline-block tabular ${className}`}>
      <span className="invisible">{fmt(value, decimals)}</span>
      <span className="absolute inset-0">{fmt(shown, decimals)}</span>
    </span>
  );
}

export function StatCard({
  label,
  value,
  decimals = 0,
  unit,
  note,
  delta,
  highlight,
  icon,
  onOpen,
  inLayout,
}: {
  label: string;
  value: number;
  decimals?: number;
  unit?: string;
  note?: string;
  /** variação, como o "+8" do 8: positivo em verde, negativo em vermelho */
  delta?: string;
  highlight?: boolean;
  icon?: ReactNode;
  onOpen?: () => void;
  /** dentro de grade que se reorganiza (ref 14): o texto só anda, não estica junto com o card */
  inLayout?: boolean;
}) {
  const on = highlight;
  const keep = inLayout ? ({ layout: 'position', transition: spring.layout } as const) : {};
  return (
    <motion.article
      {...lift}
      className={`flex min-h-[176px] flex-col justify-between gap-6 rounded-card p-5 ${on ? 'bg-highlight text-on-highlight' : 'bg-surface text-fg ring-1 ring-inset ring-line'}`}
    >
      <motion.div {...keep} className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && <span className={`flex h-10 w-10 items-center justify-center rounded-full ${on ? 'bg-white/15' : 'bg-surface-2 text-fg-2'}`}>{icon}</span>}
          <p className={`text-sm font-medium ${on ? 'text-on-highlight/85' : 'text-fg-2'}`}>{label}</p>
        </div>
        {onOpen && <ArrowButton label={`Abrir ${label}`} size="sm" tone={on ? 'onColor' : 'outline'} onClick={onOpen} />}
      </motion.div>
      <motion.div {...keep}>
        <p className="flex items-baseline gap-2 font-display text-5xl font-light leading-none tracking-tight">
          <CountUp value={value} decimals={decimals} />
          {unit && <span className={`text-lg font-medium ${on ? 'text-on-highlight/80' : 'text-muted'}`}>{unit}</span>}
          {delta && (
            <span
              className={`self-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                on ? 'bg-white/20 text-on-highlight' : delta.startsWith('-') ? 'bg-danger-soft text-danger-fg' : 'bg-success-soft text-success-fg'
              }`}
            >
              {delta}
            </span>
          )}
        </p>
        {note && <p className={`mt-2 text-sm ${on ? 'text-on-highlight/80' : 'text-muted'}`}>{note}</p>}
      </motion.div>
    </motion.article>
  );
}

/** Pílula com anel de progresso (refs 2, 6, 9): o anel desenha até a porcentagem quando aparece. */
export function RingStat({ label, percent, value, tone = 'chart-1' }: { label: string; percent: number; value?: string; tone?: 'chart-1' | 'success' | 'warning' }) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const r = 22;
  const c = 2 * Math.PI * r;
  const color = { 'chart-1': 'rgb(var(--chart-1))', success: 'rgb(var(--success))', warning: 'rgb(var(--warning))' }[tone];
  return (
    <motion.div {...lift} className="flex items-center gap-4 rounded-full bg-surface py-2.5 pl-2.5 pr-7 ring-1 ring-inset ring-line">
      <svg ref={ref} viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(var(--surface-3))" strokeWidth="6" />
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: seen ? c * (1 - percent / 100) : c }}
          transition={{ ...spring.soft, delay: 0.1 }}
        />
      </svg>
      <div>
        <p className="font-display text-2xl font-medium leading-none text-fg tabular">{value ?? `${percent}%`}</p>
        <p className="mt-1 text-sm text-muted">{label}</p>
      </div>
    </motion.div>
  );
}
