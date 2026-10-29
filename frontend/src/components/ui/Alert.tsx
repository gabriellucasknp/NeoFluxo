import type { ReactNode } from 'react';
import { Alert as DsAlert } from '@/ds';

/* Ponte pro design system: aviso em card suave com ícone redondo. */
type AlertType = 'success' | 'warning' | 'error' | 'info';
const TOM = { success: 'success', warning: 'warning', error: 'danger', info: 'info' } as const;

export function Alert({ type, title, children }: { type: AlertType; title?: string; children: ReactNode }) {
  return (
    <DsAlert tone={TOM[type]} title={title}>
      {children}
    </DsAlert>
  );
}
