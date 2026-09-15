import { Zap } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'h-8 w-8', icon: 16, text: 'text-sm' },
    md: { box: 'h-10 w-10', icon: 20, text: 'text-base' },
    lg: { box: 'h-14 w-14', icon: 28, text: 'text-xl' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex ${s.box} items-center justify-center rounded-lg bg-neo-600`}>
        <Zap className="text-white" size={s.icon} fill="white" />
      </div>
      <div className="leading-tight">
        <div className={`font-bold ${s.text} text-slate-800`}>Neoenergia</div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Pernambuco
        </div>
      </div>
    </div>
  );
}
