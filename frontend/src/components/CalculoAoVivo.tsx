import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Card, CountUp, DemandGauge, TensionBadge, VazioMedidor } from '@/ds';
import { ease } from '@/ds/motion';
import { ChevronUp } from '@/ds/icons';
import { formatKw } from '@/services/calcEngine';
import type { CalcResult } from '@/types';

/*
 * Cálculo ao vivo do assistente de projeto: a demanda e o enquadramento mudam a cada carga digitada,
 * nos 6 passos (pedido do grupo, 29/10). No desktop é a coluna fixa ao lado do formulário; abaixo de xl
 * vira a barra no pé, que abre pra mostrar a conta.
 */

// o aviso de demonstração ocupa o pé da tela; a barra sobe pra não ficar embaixo dele
const PE_DA_BARRA = import.meta.env.VITE_MOCK ? 76 : 12;

function Conta({ calc }: { calc: CalcResult }) {
  const kva = calc.demandKva ?? calc.calculatedDemand / 0.92;
  const linhas: [string, string][] = [
    ['Potência instalada', formatKw(calc.totalInstalledPower)],
    ['Unidades consumidoras', String(calc.unitCount)],
    ['Demanda das unidades', formatKw(calc.unitDemand)],
    ['Demanda das áreas comuns', formatKw(calc.serviceDemand)],
    ['Demanda em kVA', `${kva.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kVA`],
  ];
  return (
    <dl className="divide-y divide-line">
      {linhas.map(([rotulo, valor]) => (
        <div key={rotulo} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <dt className="text-muted">{rotulo}</dt>
          <dd className="tabular font-semibold text-fg">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

const vazio = 'Adicione as unidades consumidoras no passo 2: a demanda e o enquadramento mudam aqui a cada carga.';

export function CalculoAoVivo({ calc }: { calc: CalcResult | null }) {
  return (
    <Card>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-fg">Cálculo ao vivo</h2>
        <span className="text-xs text-muted">DIS-NOR-030 e 053</span>
      </div>
      {calc ? (
        <>
          <DemandGauge demand={calc.calculatedDemand} norma={calc.normaAplicada} />
          <div className="mt-5">
            <Conta calc={calc} />
          </div>
        </>
      ) : (
        <VazioMedidor title="Nada calculado ainda">{vazio}</VazioMedidor>
      )}
    </Card>
  );
}

export function CalculoAoVivoBarra({ calc, className = '' }: { calc: CalcResult | null; className?: string }) {
  const [aberto, setAberto] = useState(false);
  const media = calc?.enquadramento === 'media_tensao';

  return (
    <div className={`sticky z-30 ${className}`} style={{ bottom: PE_DA_BARRA }}>
      <div className="overflow-hidden rounded-card bg-surface shadow-pop ring-1 ring-inset ring-line">
        <AnimatePresence initial={false}>
          {aberto && (
            <motion.div
              key="conta"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <div className="border-b border-line px-5 pb-2 pt-3">
                {calc ? <Conta calc={calc} /> : <p className="py-2 text-sm text-muted">{vazio}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2"
        >
          <span className="flex min-w-0 flex-col">
            <span className="text-xs text-muted">Demanda ao vivo</span>
            <span className="font-display text-2xl font-light leading-tight tracking-tight text-fg">
              <CountUp value={calc?.calculatedDemand ?? 0} decimals={1} /> <span className="text-sm font-medium text-muted">kW</span>
            </span>
          </span>
          <span className="flex items-center gap-2">
            {calc && <TensionBadge media={media} />}
            <ChevronUp className={`h-5 w-5 text-muted transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </div>
    </div>
  );
}
