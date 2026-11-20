import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { spring, ease } from './motion';

/*
 * Gráficos do sistema, pelas refs que Mateus marcou: barras em pílula com uma em destaque e balão (6, 7, 10),
 * área com cartão flutuante (9), pizza com fatias separadas e rótulo direto (6).
 * Regras da skill dataviz: um eixo só, barra ancorada na base, grade recessiva, texto em cor de texto,
 * cor da fatia em ordem fixa (validada), hover em tudo.
 */

const nf = (n: number, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

export interface Bar {
  label: string;
  value: number;
}

/** Barras em pílula. A maior (ou a escolhida) fica em azul com o valor num balão; o hover mostra o valor das outras. */
export function PillBars({
  data,
  unit = '',
  highlight,
  height = 220,
  onColor,
}: {
  data: Bar[];
  unit?: string;
  highlight?: number;
  height?: number;
  /** dentro do card azul cheio, como as barras no card verde da ref 6 */
  onColor?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value)) * 1.12;
  const top = highlight ?? data.findIndex((d) => d.value === Math.max(...data.map((x) => x.value)));
  const shown = hover ?? top;

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }} onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => {
          const on = i === top;
          const h = (d.value / max) * 100;
          return (
            <div
              key={d.label}
              className="relative flex h-full flex-1 cursor-default items-end justify-center"
              onMouseEnter={() => setHover(i)}
              tabIndex={0}
              onFocus={() => setHover(i)}
              aria-label={`${d.label}: ${nf(d.value)} ${unit}`}
            >
              <motion.div
                className={`w-full max-w-[56px] origin-bottom rounded-full ${
                  onColor ? (on ? 'bg-white' : hover === i ? 'bg-white/45' : 'bg-white/20') : on ? 'bg-primary' : hover === i ? 'bg-chart-2' : 'bg-chart-rest'
                }`}
                style={{ height: `${h}%`, transition: 'background-color .25s' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: seen ? 1 : 0 }}
                transition={{ ...spring.soft, stiffness: 140, delay: i * 0.05 }}
              />
              <AnimatePresence>
                {shown === i && seen && (
                  <motion.span
                    key="balao"
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95, transition: { duration: 0.12 } }}
                    transition={spring.snappy}
                    className={`pointer-events-none absolute left-1/2 z-10 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${onColor ? 'bg-[#0b0c10] text-white' : 'bg-fg text-canvas'}`}
                    style={{ bottom: `calc(${h}% + 10px)`, x: '-50%' }}
                  >
                    {nf(d.value)} {unit}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 sm:gap-3">
        {data.map((d, i) => (
          <span key={d.label} className={`flex-1 text-center text-xs ${onColor ? (i === top ? 'font-semibold' : 'opacity-75') : i === top ? 'font-semibold text-fg' : 'text-muted'}`}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface Point {
  label: string;
  value: number;
  bt: number;
  mt: number;
}

function FloatCard({ active, payload, label }: { active?: boolean; payload?: { payload: Point }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring.snappy}
      className="w-52 rounded-tile bg-highlight p-4 text-on-highlight shadow-pop"
    >
      <p className="text-xs text-on-highlight/80">Semana de {label}</p>
      <p className="mt-1 font-display text-3xl font-light leading-none tabular">
        {nf(p.value)} <span className="text-sm font-medium">kW</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-control bg-white/15 px-2.5 py-2">
          <span className="block text-on-highlight/75">Baixa</span>
          <span className="font-semibold tabular">{nf(p.bt)} kW</span>
        </span>
        <span className="rounded-control bg-white/15 px-2.5 py-2">
          <span className="block text-on-highlight/75">Média</span>
          <span className="font-semibold tabular">{nf(p.mt)} kW</span>
        </span>
      </div>
    </motion.div>
  );
}

/** Área com cartão flutuante (ref 9): passa o mouse e o cartão azul segue o ponto. */
export function AreaTrend({ data, height = 260 }: { data: Point[]; height?: number }) {
  const gid = useId().replace(/:/g, '');
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--chart-1))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgb(var(--chart-grid))" strokeDasharray="0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} dy={8} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--muted))', fontSize: 12 }} width={48} tickFormatter={(v) => nf(v)} />
          <Tooltip
            content={<FloatCard />}
            cursor={{ stroke: 'rgb(var(--fg))', strokeWidth: 1, strokeDasharray: '4 4' }}
            offset={18}
            wrapperStyle={{ outline: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="rgb(var(--chart-1))"
            strokeWidth={2}
            fill={`url(#${gid})`}
            activeDot={{ r: 6, stroke: 'rgb(var(--surface))', strokeWidth: 3, fill: 'rgb(var(--chart-1))' }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface Slice {
  label: string;
  value: number;
}

const SLICE = ['rgb(var(--chart-1))', 'rgb(var(--chart-2))', 'rgb(var(--chart-3))'];

/** Pizza (ref 6): fatias separadas por um vão da cor do card, rótulo direto com a % grande; hover afasta a fatia. */
export function PieShare({ data, size = 200 }: { data: Slice[]; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 10;
  const c = size / 2;
  let acc = 0;
  const slices = data.slice(0, 3).map((d, i) => {
    const a0 = (acc / total) * Math.PI * 2;
    acc += d.value;
    const a1 = (acc / total) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    const p = (a: number) => [c + r * Math.sin(a), c - r * Math.cos(a)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    const path = `M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
    return { ...d, i, path, mid, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-6">
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="shrink-0 overflow-visible"
        role="img"
        aria-label="Distribuição por enquadramento"
        initial={{ opacity: 0, scale: 0.7, rotate: -40 }}
        animate={seen ? { opacity: 1, scale: 1, rotate: 0 } : {}}
        transition={spring.soft}
      >
        {slices.map((s) => (
          <motion.path
            key={s.label}
            d={s.path}
            fill={SLICE[s.i]}
            stroke="rgb(var(--surface))"
            strokeWidth={3}
            strokeLinejoin="round"
            animate={{
              opacity: hover === null || hover === s.i ? 1 : 0.45,
              x: hover === s.i ? Math.sin(s.mid) * 8 : 0,
              y: hover === s.i ? -Math.cos(s.mid) * 8 : 0,
            }}
            transition={spring.snappy}
            onMouseEnter={() => setHover(s.i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </motion.svg>
      <ul className="min-w-[150px] flex-1 space-y-3">
        {slices.map((s) => (
          <li
            key={s.label}
            onMouseEnter={() => setHover(s.i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-3 rounded-control px-2 py-1 transition-opacity duration-200 ${hover !== null && hover !== s.i ? 'opacity-50' : ''}`}
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: SLICE[s.i] }} />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-2xl font-medium leading-none text-fg tabular">{s.pct}%</span>
              <span className="text-xs text-muted">
                {s.label} · {nf(s.value)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tabela-espelho pra quem não lê o gráfico (exigência da skill dataviz). */
export function ChartTable({ caption, rows, unit }: { caption: string; rows: { label: string; value: number }[]; unit: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button onClick={() => setOpen((o) => !o)} className="text-xs font-semibold text-accent-fg hover:underline" aria-expanded={open}>
        {open ? 'Esconder tabela' : 'Ver em tabela'}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.table
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="mt-2 w-full overflow-hidden text-sm"
          >
            <caption className="sr-only">{caption}</caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-line last:border-0">
                  <td className="py-1.5 text-fg-2">{r.label}</td>
                  <td className="py-1.5 text-right font-semibold text-fg tabular">
                    {nf(r.value)} {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        )}
      </AnimatePresence>
    </div>
  );
}
