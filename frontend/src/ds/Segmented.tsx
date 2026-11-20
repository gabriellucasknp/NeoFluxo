import { useId } from 'react';
import { motion } from 'motion/react';
import { spring } from './motion';

/*
 * Filtros e abas numa peça só (hoje são 4): trilho em pílula e a opção ativa numa pílula clara que
 * escorrega até ela (refs 3, 6, 9, 12). Contagem opcional ao lado, como o "Draft 3" do 12.
 */

export interface Segment {
  value: string;
  label: string;
  count?: number;
}

export function Segmented({
  value,
  onChange,
  items,
  label,
  size = 'md',
  full,
}: {
  value: string;
  onChange: (v: string) => void;
  items: Segment[];
  /** nome do grupo pra leitor de tela */
  label: string;
  size?: 'sm' | 'md';
  /** ocupa a largura toda, opções do mesmo tamanho (abas de formulário) */
  full?: boolean;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className={`${full ? 'flex w-full' : 'inline-flex max-w-full'} gap-1 overflow-x-auto rounded-full bg-surface-3/70 p-1`}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            className={`group relative ${full ? 'flex-1' : 'shrink-0'} rounded-full font-medium transition-colors duration-300 ${size === 'sm' ? 'h-8 px-3.5 text-xs' : 'h-9 px-4 text-sm'} ${
              on ? 'text-fg' : 'text-muted hover:text-fg'
            }`}
          >
            {/* hover: pílula translúcida acende no lugar, sem mexer em nada */}
            {!on && <span aria-hidden className="absolute inset-0 rounded-full bg-raised/0 transition-colors duration-200 group-hover:bg-raised/60" />}
            {/* a pílula desliza por baixo dos rótulos (z-0); os rótulos ficam em z-10 pra ela nunca apagar letra no caminho */}
            {on && <motion.span layoutId={`${id}-pilula`} transition={spring.snappy} className="absolute inset-0 z-0 rounded-full bg-raised shadow-card" />}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {it.label}
              {it.count !== undefined && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular transition-colors duration-300 ${
                    on ? 'bg-primary text-on-primary' : 'bg-surface text-fg-2'
                  }`}
                >
                  {it.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
