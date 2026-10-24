import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { spring } from './motion';

/*
 * Stepper do assistente de 6 passos. Passos em pílula ligados por um trilho que enche até o atual;
 * o passo feito vira ✓ com um pulo, o atual fica em azul cheio.
 */

export function Stepper({ steps, current, onStep }: { steps: string[]; current: number; onStep?: (i: number) => void }) {
  const pct = steps.length > 1 ? current / (steps.length - 1) : 0;
  return (
    <div className="relative">
      <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-surface-3" />
      <motion.div
        className="absolute left-5 top-5 h-1 origin-left rounded-full bg-primary"
        style={{ right: 20 }}
        initial={false}
        animate={{ scaleX: pct }}
        transition={spring.soft}
      />
      <ol className="relative flex justify-between">
        {steps.map((s, i) => {
          const done = i < current;
          const on = i === current;
          return (
            <li key={s} className="flex w-20 flex-col items-center gap-2 text-center">
              <motion.button
                type="button"
                onClick={() => onStep?.(i)}
                disabled={!onStep}
                aria-current={on ? 'step' : undefined}
                aria-label={`Passo ${i + 1}: ${s}`}
                animate={{ scale: on ? 1.08 : 1 }}
                whileHover={onStep ? { scale: on ? 1.12 : 1.06 } : undefined}
                whileTap={onStep ? { scale: 0.94 } : undefined}
                transition={spring.snappy}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                  on ? 'bg-primary text-on-primary shadow-glow' : done ? 'bg-accent-soft text-accent-fg' : 'bg-raised text-muted ring-1 ring-inset ring-line-strong'
                }`}
              >
                {done ? (
                  <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </motion.span>
                ) : (
                  i + 1
                )}
              </motion.button>
              <span className={`hidden text-xs sm:block ${on ? 'font-semibold text-fg' : 'text-muted'}`}>{s}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
