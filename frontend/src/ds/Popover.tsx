import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ease } from './motion';

/*
 * Caixa que abre (select, menu do usuário): uma peça só.
 * Mora num portal, então nenhum card corta nem cobre a lista; segue o gatilho na rolagem;
 * vira pra cima quando falta espaço embaixo (regra da /site); abre e fecha animada a partir do gatilho.
 */

const ABRE = 0.32;
const FECHA = 0.2;

export function Popover({
  open,
  onClose,
  anchor,
  children,
  align = 'start',
  matchWidth,
  minWidth = 200,
  className = '',
  role,
  id,
}: {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLElement>;
  children: ReactNode;
  align?: 'start' | 'end';
  /** largura igual à do gatilho (select de formulário) */
  matchWidth?: boolean;
  minWidth?: number;
  className?: string;
  role?: string;
  id?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<CSSProperties & { up?: boolean }>({});

  const place = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    if (!a) return;
    const h = box.current?.offsetHeight ?? 240;
    const below = window.innerHeight - a.bottom;
    const up = below < h + 16 && a.top > below;
    const width = matchWidth ? a.width : undefined;
    const left = align === 'end' ? undefined : Math.min(a.left, window.innerWidth - Math.max(width ?? minWidth, minWidth) - 8);
    const right = align === 'end' ? window.innerWidth - a.right : undefined;
    setPos({
      position: 'fixed',
      top: up ? undefined : a.bottom + 8,
      bottom: up ? window.innerHeight - a.top + 8 : undefined,
      left,
      right,
      width,
      minWidth,
      up,
    });
  }, [anchor, align, matchWidth, minWidth]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const r = () => place();
    // a altura real só existe depois de montar: reposiciona no quadro seguinte
    const raf = requestAnimationFrame(r);
    window.addEventListener('scroll', r, true);
    window.addEventListener('resize', r);
    const fora = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor.current?.contains(t)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', r, true);
      window.removeEventListener('resize', r);
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [open, place, onClose, anchor]);

  const { up, ...style } = pos;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={box}
          id={id}
          role={role}
          style={style}
          initial={{ y: up ? 6 : -6 }}
          animate={{ y: 0, transition: { duration: ABRE, ease } }}
          exit={{ y: up ? 4 : -4, transition: { duration: FECHA, ease } }}
          className={`z-[60] ${className}`}
        >
          {/* fundo com a sombra: cresce a partir do gatilho, sem recorte (o recorte cortava a sombra num retângulo) */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-tile bg-raised shadow-[0_16px_36px_-14px_rgb(15_20_32/0.24),0_2px_6px_-2px_rgb(15_20_32/0.08)] ring-1 ring-line"
            style={{ originY: up ? 1 : 0 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, transition: { duration: ABRE, ease } }}
            exit={{ scaleY: 0, transition: { duration: FECHA, ease } }}
          />
          {/* conteúdo: desenrola no mesmo passo do fundo, então nada de baixo aparece através da lista */}
          <motion.div
            className="relative max-h-72 overflow-auto p-1.5"
            initial={{ clipPath: up ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: ABRE, ease } }}
            exit={{ clipPath: up ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', transition: { duration: FECHA, ease } }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
