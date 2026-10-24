import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ease } from './motion';

/*
 * Caixa que abre (select, menu do usuário): uma peça só.
 * Mora num portal, então nenhum card corta nem cobre a lista; segue o gatilho na rolagem;
 * vira pra cima quando falta espaço embaixo (regra da /site); abre e fecha animada a partir do gatilho.
 */

const ABERTA = 'inset(-25% -12% -25% -12% round 20px)';
const FECHADA_BAIXO = 'inset(-25% -12% 100% -12% round 20px)';
const FECHADA_CIMA = 'inset(100% -12% -25% -12% round 20px)';

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
          style={{ ...style, transformOrigin: `${align === 'end' ? 'right' : 'left'} ${up ? 'bottom' : 'top'}` }}
          // desenrola a partir do gatilho já opaca: nada de baixo aparece através da lista no meio da abertura
          // recorte final com folga negativa pra sombra não ficar cortada
          initial={{ clipPath: up ? FECHADA_CIMA : FECHADA_BAIXO, y: up ? 6 : -6 }}
          animate={{ clipPath: ABERTA, y: 0, transition: { duration: 0.32, ease } }}
          exit={{ clipPath: up ? FECHADA_CIMA : FECHADA_BAIXO, y: up ? 4 : -4, transition: { duration: 0.2, ease } }}
          className={`z-[60] max-h-72 overflow-auto rounded-tile bg-raised p-1.5 shadow-pop ring-1 ring-line ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
