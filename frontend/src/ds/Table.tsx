import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown } from './icons';
import { spring, ease } from './motion';

/*
 * Tabela única (hoje são 3). Cada linha é uma faixa arredondada (ref 7); a escolhida ganha um destaque azul
 * que sai um pouco pra fora da linha, com sombra (ref 13, sem anotação = direção).
 * O destaque é UMA faixa da tabela inteira, que desliza até a linha escolhida medindo offsetTop (a linha pode
 * estar entrando animada). Camadas: fundo das linhas < faixa < texto de todas as linhas, então ela passa por trás
 * das letras no caminho. O conteúdo nunca muda de lugar, só de cor. Ordena clicando no cabeçalho. No celular vira lista de cartões, sem rolagem lateral.
 */

export interface Column<T> {
  key: string;
  header: string;
  /** selected = a linha está destacada (fundo azul): use as versões onColor de badge */
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
  const lista = useRef<HTMLDivElement>(null);
  const linhas = useRef(new Map<string, HTMLDivElement>());
  const [faixa, setFaixa] = useState<{ top: number; height: number; veio: boolean } | null>(null);
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

  // mede a linha escolhida; "veio" diz se a faixa já estava visível (só então ela desliza, senão aparece no lugar)
  useLayoutEffect(() => {
    const medir = () => {
      const el = sel ? linhas.current.get(sel) : null;
      setFaixa((f) => (el ? { top: el.offsetTop, height: el.offsetHeight, veio: !!f } : null));
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (lista.current) ro.observe(lista.current);
    return () => ro.disconnect();
  }, [sel, sorted]);

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

      <div ref={lista} className="relative flex flex-col gap-2">
        <AnimatePresence>
          {faixa && (
            <motion.div
              key="faixa"
              aria-hidden
              className="pointer-events-none absolute -left-2 -right-2 top-0 z-[5] rounded-[22px] bg-highlight shadow-[0_12px_28px_-14px_rgb(var(--highlight)/0.7)]"
              initial={{ opacity: 0, scale: 0.97, y: faixa.top - 2, height: faixa.height + 4 }}
              animate={{ opacity: 1, scale: 1, y: faixa.top - 2, height: faixa.height + 4 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18, ease } }}
              transition={{
                y: faixa.veio ? { type: 'spring', stiffness: 380, damping: 34 } : { duration: 0 },
                height: faixa.veio ? { type: 'spring', stiffness: 380, damping: 34 } : { duration: 0 },
                default: spring.snappy,
              }}
            />
          )}
        </AnimatePresence>
          <AnimatePresence initial={false}>
            {sorted.map((r, i) => {
              const k = rowKey(r);
              const on = sel === k;
              return (
                <motion.div
                  key={k}
                  ref={(el: HTMLDivElement | null) => (el ? linhas.current.set(k, el) : linhas.current.delete(k))}
                  role="row"
                  layout="position"
                  tabIndex={0}
                  aria-selected={on}
                  onClick={() => pick(r)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(r))}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { ...spring.soft, delay: i * 0.03 } }}
                  exit={{ opacity: 0, x: -12, transition: { duration: 0.18, ease } }}
                  transition={spring.layout}
                  className="group relative cursor-pointer rounded-tile outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {/* fundo parado da linha */}
                  <span aria-hidden className="absolute inset-0 z-0 rounded-tile bg-surface ring-1 ring-inset ring-line transition-colors duration-200 group-hover:bg-surface-2" />
                  <div
                    className={`relative z-10 grid grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-4 text-sm transition-colors duration-300 md:gap-y-0 md:[grid-template-columns:var(--cols)] ${
                      on ? 'text-on-highlight' : 'text-fg-2'
                    }`}
                    style={{ ['--cols' as string]: grid }}
                  >
                    {columns.map((c) => (
                      <div
                        key={c.key}
                        role="cell"
                        className={`min-w-0 ${c.align === 'right' ? 'text-right' : ''} ${c.hideOnMobile ? 'hidden md:block' : ''} ${c.mobileFull ? 'col-span-2 md:col-span-1' : ''}`}
                      >
                        {c.cell(r, on)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
      </div>
    </div>
  );
}
