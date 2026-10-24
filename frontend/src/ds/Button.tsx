import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { press, spring } from './motion';

/*
 * Botão único do sistema. Pílula (refs 1, 2, 11), preto/azul cheio como o "Export as CVS" do 10.
 * Rótulo nunca muda de cor no hover (causa de flick); o fundo escurece e o botão sobe 1px.
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-raised text-fg ring-1 ring-inset ring-line-strong hover:bg-surface-2',
  ghost: 'text-fg-2 hover:bg-surface-2',
  danger: 'bg-danger text-white hover:bg-danger/90',
};
const SIZE: Record<Size, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2 px-7 text-base',
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** seta ↗ no fim, como nos botões das refs 3, 8 e 10 */
  arrow?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, arrow, loading, disabled, className = '', children, ...rest },
  ref,
) {
  const off = disabled || loading;
  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={off}
      {...(off ? {} : press)}
      className={`group inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
      {arrow && (
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      )}
    </motion.button>
  );
});

type IconTone = 'outline' | 'soft' | 'solid' | 'onColor';
const TONE: Record<IconTone, string> = {
  outline: 'text-fg ring-1 ring-inset ring-line-strong hover:bg-surface-2',
  soft: 'bg-surface-2 text-fg-2 hover:bg-surface-3 hover:text-fg',
  solid: 'bg-primary text-on-primary hover:bg-primary-hover',
  onColor: 'bg-white/15 text-white ring-1 ring-inset ring-white/30 hover:bg-white/25',
};

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  label: string;
  tone?: IconTone;
  size?: 'sm' | 'md';
  children: ReactNode;
}

/** Botão redondo só de ícone (refs 8 e 10). Sempre com rótulo pra leitor de tela. */
export function IconButton({ label, tone = 'soft', size = 'md', className = '', children, ...rest }: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={spring.snappy}
      className={`group inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'} ${TONE[tone]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/** O ↗ redondo dos cards (8, 10): a seta escorrega na diagonal no hover. */
export function ArrowButton({ label, tone = 'outline', ...rest }: Omit<IconButtonProps, 'children'>) {
  return (
    <IconButton label={label} tone={tone} {...rest}>
      <span className="relative block h-4 w-4 overflow-hidden">
        <ArrowUpRight className="absolute inset-0 h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-4 group-hover:translate-x-4" />
        <ArrowUpRight className="absolute inset-0 h-4 w-4 -translate-x-4 translate-y-4 transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </IconButton>
  );
}
