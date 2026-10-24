import { restaurarDadosDemo } from '@/services/mock/backend';

/**
 * Aviso fixo do modo demonstração (build com VITE_MOCK=1).
 * Montado no App só nesse modo, então não entra no bundle normal.
 */
export function DemoBanner() {
  const restaurar = () => {
    if (!window.confirm('Apagar o que foi feito nesta demonstração e voltar aos dados iniciais?')) return;
    restaurarDadosDemo();
    window.location.reload();
  };

  return (
    <div
      role="status"
      className="fixed bottom-3 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-3 rounded-full bg-surface px-4 py-2 text-xs text-muted shadow-card ring-1 ring-line"
    >
      <span>
        <strong className="font-semibold text-fg">Modo demonstração:</strong> os dados ficam só neste navegador
      </span>
      <button
        type="button"
        onClick={restaurar}
        className="shrink-0 rounded-full bg-primary px-3 py-1 font-medium text-on-primary transition-colors hover:bg-primary-hover"
      >
        Restaurar dados
      </button>
    </div>
  );
}
