import type { Transition, Variants } from 'motion/react';

/*
 * Movimento do design system. Tudo anima (Mateus, ref 14): hover, clique, abrir, fechar, mas a caixa clicável fica parada no hover.
 * Só transform e opacity, pra não travar; quem pede menos movimento no sistema recebe a versão curta (MotionConfig "user").
 */

export const spring = {
  /** botão, chip, ícone: rápido e firme */
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 } as Transition,
  /** card, modal, painel: assenta sem quicar demais */
  soft: { type: 'spring', stiffness: 260, damping: 30 } as Transition,
  /** reorganização de layout (ref 14) */
  layout: { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 } as Transition,
};

export const ease = [0.22, 1, 0.36, 1] as const;

// Hover nunca move nem cresce a caixa (regra da /site): o hover de botão é o fluxo do Button.tsx.

/** entrada em cascata de listas e grades */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease } },
};

/** popover, menu e select: cresce a partir de onde foi aberto */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.14, ease } },
};
