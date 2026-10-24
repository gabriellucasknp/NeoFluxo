import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { lift } from './motion';

/*
 * Card: o container de tudo. Raio grande (28px, refs 1, 2, 11), sem sombra no claro (8, 10),
 * fio de 1px pra separar do fundo. "dark" é o bloco preto dentro da página clara (refs 4, 12).
 */

export function Card({
  children,
  className = '',
  hover,
  tone = 'default',
  ...rest
}: { children: ReactNode; className?: string; hover?: boolean; tone?: 'default' | 'dark' | 'highlight' } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const t = {
    default: 'bg-surface text-fg ring-1 ring-inset ring-line',
    dark: 'bg-[#0b0c10] text-white',
    highlight: 'bg-highlight text-on-highlight',
  }[tone];
  return (
    <motion.div {...(hover ? lift : {})} className={`rounded-card p-5 sm:p-6 ${t} ${className}`} {...rest}>
      {children}
    </motion.div>
  );
}
