import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
}

const config: Record<AlertType, { bg: string; border: string; icon: ReactNode; text: string }> = {
  success: { bg: 'bg-success-soft', border: 'border-success', icon: <CheckCircle2 className="h-5 w-5 text-success-fg" />, text: 'text-success-fg' },
  warning: { bg: 'bg-warning-soft', border: 'border-warning', icon: <AlertTriangle className="h-5 w-5 text-warning-fg" />, text: 'text-warning-fg' },
  error: { bg: 'bg-danger-soft', border: 'border-danger', icon: <XCircle className="h-5 w-5 text-danger-fg" />, text: 'text-danger-fg' },
  info: { bg: 'bg-info-soft', border: 'border-info', icon: <Info className="h-5 w-5 text-info-fg" />, text: 'text-info-fg' },
};

export function Alert({ type, title, children }: AlertProps) {
  const c = config[type];
  return (
    <div className={`flex gap-3 rounded-lg border-l-4 ${c.bg} ${c.border} p-4`}>
      <div className="shrink-0">{c.icon}</div>
      <div>
        {title && <p className={`font-semibold ${c.text}`}>{title}</p>}
        <div className={`text-sm ${c.text} opacity-90`}>{children}</div>
      </div>
    </div>
  );
}
