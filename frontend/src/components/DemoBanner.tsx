import { useState } from 'react';
import { Button, ConfirmDialog } from '@/ds';
import { restaurarDadosDemo } from '@/services/mock/backend';

/**
 * Aviso fixo do modo demonstração (build com VITE_MOCK=1).
 * Montado no App só nesse modo, então não entra no bundle normal.
 */
export function DemoBanner() {
  const [confirmar, setConfirmar] = useState(false);
  const restaurar = () => {
    restaurarDadosDemo();
    window.location.reload();
  };

  return (
    <>
      <div
        role="status"
        className="fixed bottom-3 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-xl items-center justify-between gap-3 rounded-full bg-surface py-1.5 pl-5 pr-1.5 text-xs text-muted shadow-pop ring-1 ring-line"
        style={{ transform: 'translateX(-50%)' }}
      >
        <span>
          <strong className="font-semibold text-fg">Demonstração:</strong> os dados ficam só neste navegador
        </span>
        <Button size="sm" variant="secondary" onClick={() => setConfirmar(true)}>
          Restaurar dados
        </Button>
      </div>
      <ConfirmDialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        onConfirm={restaurar}
        title="Restaurar os dados?"
        description="Tudo o que foi criado, aprovado ou reprovado nesta demonstração some, e os projetos de exemplo voltam."
        confirmLabel="Restaurar"
        danger
      />
    </>
  );
}
