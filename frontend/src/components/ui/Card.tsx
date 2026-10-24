import type { ReactNode } from 'react';

/* Ponte pro design system: card de raio grande e fio de 1 px, sem sombra (refs 1, 8, 10). */
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-7',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return <div className={`rounded-card bg-surface ring-1 ring-inset ring-line ${paddingClasses[padding]} ${className}`}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-fg">{icon}</div>}
        <div>
          <h3 className="font-display text-lg font-semibold text-fg">{title}</h3>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
