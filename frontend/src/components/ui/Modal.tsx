import type { ReactNode } from 'react';
import { Modal as DsModal } from '@/ds';

/* Ponte pro design system: modal novo (sobe e assenta, Esc e clique fora fecham, foco volta). */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

export function Modal(props: ModalProps) {
  return <DsModal {...props} />;
}
