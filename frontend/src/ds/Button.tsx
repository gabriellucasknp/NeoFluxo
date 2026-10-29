import { forwardRef, useRef, useState, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from 'react';
import { ArrowUpRight, Loader2 } from './icons';

/*
 * Botão único do sistema. Pílula (refs 1, 2, 11), azul cheio como o "Export as CVS" do 10.
 * Hover sem mexer a caixa (regra da /site): uma camada de cor atravessa da esquerda pra direita ("fluxo")
 * e sai pela direita. O rótulo nunca troca de cor; quando o fundo inverte, a cópia invertida aparece pelo
 * mesmo recorte (CSS .ds-sweep em index.css). Clique = onda que nasce no ponto do toque.
 */

type Fase = 'idle' | 'in' | 'out';

// quem chama pode posicionar o botão (absolute/fixed); só então o relative padrão sai, senão ele venceria no CSS
const posicao = (className: string) => (/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative');

/** Liga o hover de fluxo e a onda do clique a qualquer botão. */
function useFlow(disabled?: boolean) {
  const [fase, setFase] = useState<Fase>('idle');
  const [ondas, setOndas] = useState<{ id: number; x: number; y: number; d: number }[]>([]);
  const saida = useRef<number>();
  const n = useRef(0);

  const enter = () => {
    if (disabled) return;
    clearTimeout(saida.current);
    // entrou de novo enquanto saía: recolhe sem transição e cobre no quadro seguinte
    setFase((f) => (f === 'out' ? 'idle' : f));
    requestAnimationFrame(() => setFase('in'));
  };
  const leave = () => {
    if (disabled) return;
    setFase((f) => (f === 'in' ? 'out' : f));
    clearTimeout(saida.current);
    saida.current = window.setTimeout(() => setFase((f) => (f === 'out' ? 'idle' : f)), 440);
  };
  const down = (e: PointerEvent<HTMLElement>) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    const id = ++n.current;
    setOndas((o) => [...o, { id, x: e.clientX - r.left, y: e.clientY - r.top, d: Math.max(r.width, r.height) * 2.4 }]);
    setTimeout(() => setOndas((o) => o.filter((w) => w.id !== id)), 600);
  };

  const ripples = ondas.map((w) => <span key={w.id} aria-hidden className="ds-ripple" style={{ left: w.x, top: w.y, width: w.d, height: w.d }} />);
  return { fase, handlers: { onPointerEnter: enter, onPointerLeave: leave, onFocus: enter, onBlur: leave, onPointerDown: down }, ripples };
}

/** Seta ↗ que atravessa por dentro: sai pela diagonal e reentra pelo canto oposto, recortada. */
function Arrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span aria-hidden className={`relative block shrink-0 overflow-hidden ${className}`}>
      <ArrowUpRight className="absolute inset-0 h-full w-full transition-transform duration-300 ease-out group-hover:-translate-y-full group-hover:translate-x-full" />
      <ArrowUpRight className="absolute inset-0 h-full w-full -translate-x-full translate-y-full transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0" />
    </span>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

// [fundo parado, camada que atravessa, cor do rótulo invertido (só quando o fundo inverte)]
// Todo botão cheio troca de cor de verdade no hover: a camada é a tinta (preto no claro, branco no escuro).
// Tom vizinho (azul → azul mais claro) lia como "só clareou" (Mateus, 23/10).
const VARIANT: Record<Variant, [string, string, string | null]> = {
  primary: ['bg-primary text-on-primary', 'bg-fg', 'text-canvas'],
  secondary: ['bg-raised text-fg ring-1 ring-inset ring-line-strong', 'bg-fg', 'text-canvas'],
  ghost: ['text-fg-2', 'bg-surface-3', null],
  danger: ['bg-danger text-white', 'bg-fg', 'text-canvas'],
  success: ['bg-success text-white', 'bg-fg', 'text-canvas'],
};
const SIZE: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2 px-7 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** seta ↗ no fim, como nos botões das refs 3, 8 e 10 */
  arrow?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, arrow, loading, disabled, className = '', children, type = 'button', ...rest },
  ref,
) {
  const off = disabled || loading;
  const { fase, handlers, ripples } = useFlow(off);
  const [base, fill, inv] = VARIANT[variant];
  const conteudo = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
      {arrow && <Arrow />}
    </>
  );
  return (
    <button
      ref={ref}
      type={type}
      disabled={off}
      data-f={fase}
      {...handlers}
      className={`ds-sweep group ${posicao(className)} isolate inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${base} ${SIZE[size]} ${className}`}
      {...rest}
    >
      <span aria-hidden className={`ds-sweep__fill absolute inset-0 -z-10 ${fill}`} />
      {ripples}
      <span className={`relative flex items-center ${SIZE[size].split(' ')[1]}`}>{conteudo}</span>
      {inv && (
        <span aria-hidden className={`ds-sweep__inv pointer-events-none absolute inset-0 flex items-center justify-center ${SIZE[size].split(' ')[1]} ${inv}`}>
          {conteudo}
        </span>
      )}
    </button>
  );
});

type IconTone = 'outline' | 'soft' | 'solid' | 'onColor';
// [fundo parado, camada que atravessa, cor do ícone invertido]
const TONE: Record<IconTone, [string, string, string | null]> = {
  outline: ['text-fg ring-1 ring-inset ring-line-strong', 'bg-fg', 'text-canvas'],
  soft: ['bg-surface-2 text-fg-2', 'bg-fg', 'text-canvas'],
  solid: ['bg-primary text-on-primary', 'bg-fg', 'text-canvas'],
  onColor: ['bg-white/15 text-white ring-1 ring-inset ring-white/30', 'bg-white', 'text-highlight'],
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: IconTone;
  size?: 'sm' | 'md';
  children: ReactNode;
}

/** Botão redondo só de ícone (refs 8 e 10). Mesmo fluxo do Button; o contorno vira sólido. */
export function IconButton({ label, tone = 'soft', size = 'md', className = '', children, type = 'button', disabled, ...rest }: IconButtonProps) {
  const { fase, handlers, ripples } = useFlow(disabled);
  const [base, fill, inv] = TONE[tone];
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      data-f={fase}
      {...handlers}
      className={`ds-sweep group ${posicao(className)} isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full disabled:opacity-50 ${size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'} ${base} ${className}`}
      {...rest}
    >
      <span aria-hidden className={`ds-sweep__fill absolute inset-0 -z-10 ${fill}`} />
      {ripples}
      <span className="relative flex">{children}</span>
      {inv && (
        <span aria-hidden className={`ds-sweep__inv pointer-events-none absolute inset-0 flex items-center justify-center ${inv}`}>
          {children}
        </span>
      )}
    </button>
  );
}

/** O ↗ redondo dos cards (8, 10): o fluxo preenche e a seta atravessa por dentro. */
export function ArrowButton({ label, tone = 'outline', ...rest }: Omit<IconButtonProps, 'children'>) {
  return (
    <IconButton label={label} tone={tone} {...rest}>
      <Arrow />
    </IconButton>
  );
}
