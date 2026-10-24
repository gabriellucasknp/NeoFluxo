import type { ReactNode } from 'react';
import { EmptyState as DsEmptyState, Spinner } from '@/ds';

/* Ponte pro design system: carregando e vazio. Os vazios das telas principais têm peça própria (caminho A). */
export function Loading({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex justify-center py-16">
      <Spinner label={message} />
    </div>
  );
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <DsEmptyState icon={icon} title={title} action={action}>
      {message}
    </DsEmptyState>
  );
}
