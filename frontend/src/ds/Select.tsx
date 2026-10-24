import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { pop, spring } from './motion';

/*
 * Select único (hoje são 4). Lista própria pra poder animar abrir e fechar; teclado: setas, Enter, Esc.
 * Gatilho em pílula como o "Monthly ⌄" das refs 8 e 10.
 */

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  pill,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  /** gatilho compacto em pílula, pra filtro de cabeçalho */
  pill?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const root = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
    }
    if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      pick(active);
    }
  };

  return (
    <div ref={root} className={`relative ${pill ? 'inline-block' : 'w-full'}`}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg-2">
          {label}
        </label>
      )}
      <motion.button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-lista`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        whileTap={{ scale: 0.98 }}
        transition={spring.snappy}
        className={`flex items-center justify-between gap-3 bg-raised text-sm ring-1 ring-inset transition-[box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
          open ? 'ring-2 ring-focus' : 'ring-line-strong hover:ring-muted/60'
        } ${pill ? 'h-9 rounded-full px-4 font-medium text-fg' : 'h-11 w-full rounded-control px-4 text-left'}`}
      >
        <span className={current ? 'text-fg' : 'text-subtle'}>{current?.label ?? placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy} className="text-muted">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${id}-lista`}
            role="listbox"
            variants={pop}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: 'top' }}
            className={`absolute z-30 mt-2 max-h-72 overflow-auto rounded-tile bg-raised p-1.5 shadow-pop ring-1 ring-line ${pill ? 'right-0 min-w-[180px]' : 'w-full'}`}
          >
            {options.map((o, i) => {
              const sel = o.value === value;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={sel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(i)}
                  className="relative cursor-pointer rounded-control px-3 py-2.5 text-sm"
                >
                  {active === i && (
                    <motion.span layoutId={`${id}-ativo`} transition={spring.snappy} className="absolute inset-0 rounded-control bg-surface-2" />
                  )}
                  <span className="relative flex items-center justify-between gap-3">
                    <span>
                      <span className={sel ? 'font-semibold text-fg' : 'text-fg-2'}>{o.label}</span>
                      {o.hint && <span className="block text-xs text-muted">{o.hint}</span>}
                    </span>
                    {sel && <Check className="h-4 w-4 text-accent-fg" />}
                  </span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
