import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertType = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  children: ReactNode;
}

const config: Record<AlertType, { bg: string; border: string; icon: ReactNode; text: string }> = {
  success: { bg: 'bg-success-50', border: 'border-success-500', icon: <CheckCircle2 className="h-5 w-5 text-success-600" />, text: 'text-success-700' },
  warning: { bg: 'bg-warning-50', border: 'border-warning-500', icon: <AlertTriangle className="h-5 w-5 text-warning-600" />, text: 'text-warning-700' },
  error: { bg: 'bg-danger-50', border: 'border-danger-500', icon: <XCircle className="h-5 w-5 text-danger-600" />, text: 'text-danger-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-500', icon: <Info className="h-5 w-5 text-blue-600" />, text: 'text-blue-700' },
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
