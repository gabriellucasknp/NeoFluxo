import { useCallback, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover } from './Popover';
import { spring } from './motion';

/*
 * Select único (hoje são 4). Lista própria (nativo é proibido pela /site) num Popover; teclado: setas, Enter, Esc.
 * Gatilho em pílula como o "Monthly ⌄" das refs 8 e 10. A opção sob o mouse ou o teclado acende por cor, sem pular.
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
  const [active, setActive] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.value === value);
  const close = useCallback(() => setOpen(false), []);

  const abrir = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
    trigger.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return abrir();
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      pick(active);
    } else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <div className={pill ? 'inline-block' : 'w-full'}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg-2">
          {label}
        </label>
      )}
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-lista`}
        aria-activedescendant={open ? `${id}-op-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : abrir())}
        onKeyDown={onKey}
        className={`flex items-center justify-between gap-3 bg-raised text-sm ring-inset transition-[box-shadow,background-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
          open ? 'ring-2 ring-focus' : 'ring-1 ring-line-strong hover:bg-surface-2'
        } ${pill ? 'h-9 rounded-full px-4 font-medium text-fg' : 'h-11 w-full rounded-control px-4 text-left'}`}
      >
        <span className={current ? 'text-fg' : 'text-subtle'}>{current?.label ?? placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring.snappy} className="flex text-muted">
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <Popover open={open} onClose={close} anchor={trigger} matchWidth={!pill} minWidth={pill ? 180 : 200} align={pill ? 'end' : 'start'} role="listbox" id={`${id}-lista`}>
        {options.map((o, i) => {
          const sel = o.value === value;
          return (
            <div
              key={o.value}
              id={`${id}-op-${i}`}
              role="option"
              aria-selected={sel}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2.5 text-sm transition-colors duration-150 ${
                active === i ? 'bg-surface-2' : ''
              }`}
            >
              <span>
                <span className={sel ? 'font-semibold text-fg' : 'text-fg-2'}>{o.label}</span>
                {o.hint && <span className="block text-xs text-muted">{o.hint}</span>}
              </span>
              {sel && <Check className="h-4 w-4 shrink-0 text-accent-fg" />}
            </div>
          );
        })}
      </Popover>
    </div>
  );
}
