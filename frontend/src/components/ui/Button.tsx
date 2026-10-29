import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as DsButton } from '@/ds';

/* Ponte pro design system: as telas seguem com a mesma interface e passam a desenhar o botão novo (src/ds/Button). */
type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  /** seta ↗ que atravessa no hover (refs 3, 8, 10) */
  arrow?: boolean;
  children: ReactNode;
}

const VARIANTE = { primary: 'primary', secondary: 'secondary', outline: 'secondary', success: 'success', danger: 'danger', ghost: 'ghost' } as const;

export function Button({ variant = 'primary', size = 'md', ...rest }: ButtonProps) {
  return <DsButton variant={VARIANTE[variant]} size={size} {...rest} />;
}
