import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { spring, ease } from './motion';

/*
 * Tabela única (hoje são 3). Cada linha é uma faixa arredondada (ref 7); a linha escolhida
 * salta pra fora em azul com sombra (ref 13, sem anotação = direção). Ordena clicando no cabeçalho.
 * No celular vira lista de cartões, sem rolagem lateral.
 */

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T, selected: boolean) => ReactNode;
  /** valor pra ordenar; sem ele a coluna não ordena */
  sort?: (row: T) => string | number;
  align?: 'left' | 'right';
  /** some no celular */
  hideOnMobile?: boolean;
  /** no celular ocupa a linha inteira (o nome do item) */
  mobileFull?: boolean;
  width?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  onSelect,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onSelect?: (row: T) => void;
  empty?: ReactNode;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = useMemo(() => {
    if (!sortBy) return rows;
    const col = columns.find((c) => c.key === sortBy.key);
    if (!col?.sort) return rows;
    return [...rows].sort((a, b) => {
      const x = col.sort!(a);
      const y = col.sort!(b);
      return (x < y ? -1 : x > y ? 1 : 0) * sortBy.dir;
    });
  }, [rows, columns, sortBy]);

  const grid = columns.map((c) => c.width ?? 'minmax(0,1fr)').join(' ');
  const toggleSort = (k: string) => setSortBy((s) => (s?.key === k ? { key: k, dir: s.dir === 1 ? -1 : 1 } : { key: k, dir: 1 }));
  const pick = (r: T) => {
    const k = rowKey(r);
    setSel((s) => (s === k ? null : k));
    onSelect?.(r);
  };

  if (!rows.length) return <>{empty}</>;

  return (
    <div role="table" className="w-full">
      <div role="row" className="mb-2 hidden gap-4 rounded-full bg-surface-2 px-5 py-2.5 md:grid" style={{ gridTemplateColumns: grid }}>
        {columns.map((c) => (
          <div key={c.key} role="columnheader" className={c.align === 'right' ? 'text-right' : ''}>
            {c.sort ? (
              <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-fg">
                {c.header}
                <motion.span
                  animate={{ rotate: sortBy?.key === c.key && sortBy.dir === -1 ? 180 : 0, opacity: sortBy?.key === c.key ? 1 : 0.35 }}
                  transition={spring.snappy}
                >
                  <ArrowDown className="h-3 w-3" />
                </motion.span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-muted">{c.header}</span>
            )}
          </div>
        ))}
      </div>

      <motion.div layout className="space-y-2">
        <AnimatePresence initial={false}>
          {sorted.map((r, i) => {
            const k = rowKey(r);
            const on = sel === k;
            return (
              <motion.div
                key={k}
                role="row"
                layout
                tabIndex={0}
                aria-selected={on}
                onClick={() => pick(r)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(r))}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, scale: on ? 1.015 : 1, transition: { ...spring.soft, delay: i * 0.03 } }}
                exit={{ opacity: 0, x: -12, transition: { duration: 0.18, ease } }}
                className={`relative grid cursor-pointer grid-cols-2 items-center gap-x-4 gap-y-2 rounded-tile px-5 py-4 outline-none transition-[background-color,box-shadow,color] duration-300 focus-visible:ring-2 focus-visible:ring-focus md:gap-y-0 ${
                  on ? 'z-10 bg-highlight text-on-highlight shadow-glow md:-mx-2.5 md:px-7' : 'bg-surface text-fg-2 ring-1 ring-inset ring-line hover:bg-surface-2'
                } md:[grid-template-columns:var(--cols)]`}
                style={{ ['--cols' as string]: grid }}
              >
                {columns.map((c) => (
                  <div
                    key={c.key}
                    role="cell"
                    className={`min-w-0 text-sm ${c.align === 'right' ? 'text-right' : ''} ${c.hideOnMobile ? 'hidden md:block' : ''} ${c.mobileFull ? 'col-span-2 md:col-span-1' : ''}`}
                  >
                    {c.cell(r, on)}
                  </div>
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
