import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { spring } from './motion';

/*
 * Caixa de texto única (hoje são 6 versões). Rótulo em cima, campo arredondado claro sobre o card,
 * foco com anel azul que acende, erro que treme uma vez e aparece embaixo.
 */

const BOX =
  'w-full rounded-control bg-raised text-sm text-fg ring-1 ring-inset ring-line-strong placeholder:text-subtle ' +
  'transition-[box-shadow,background-color] duration-200 hover:ring-muted/60 focus:outline-none focus:ring-2 focus:ring-focus ' +
  'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted';

interface Base {
  label?: string;
  hint?: ReactNode;
  error?: string;
  /** unidade colada no fim do campo: kW, kVA, m² */
  suffix?: string;
}

function Shell({ id, label, hint, error, children }: Base & { id: string; children: ReactNode }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg-2">
          {label}
        </label>
      )}
      <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.36 }}>
        {children}
      </motion.div>
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="erro"
            id={`${id}-msg`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-xs font-medium text-danger-fg"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="dica" id={`${id}-msg`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-muted">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const TextField = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, hint, error, suffix, id, className = '', ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Shell id={fid} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${fid}-msg` : undefined}
          className={`${BOX} h-11 px-4 ${suffix ? 'pr-14' : ''} ${error ? 'ring-2 ring-danger' : ''} ${className}`}
          {...rest}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted">{suffix}</span>}
      </div>
    </Shell>
  );
});

export function TextArea({ label, hint, error, id, className = '', ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Shell id={fid} label={label} hint={hint} error={error}>
      <textarea id={fid} aria-invalid={!!error} className={`${BOX} min-h-[104px] resize-y px-4 py-3 ${error ? 'ring-2 ring-danger' : ''} ${className}`} {...rest} />
    </Shell>
  );
}

/** Busca em pílula (refs 7, 10, 12): lupa à esquerda, X que aparece quando tem texto. */
export function SearchField({
  value,
  onChange,
  placeholder = 'Buscar',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${BOX} h-11 rounded-full pl-11 pr-10 [&::-webkit-search-cancel-button]:hidden`}
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            aria-label="Limpar busca"
            onClick={() => onChange('')}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={spring.snappy}
            style={{ y: '-50%' }}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-fg-2 hover:text-fg"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
