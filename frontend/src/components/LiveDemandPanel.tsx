import { useState } from 'react';
import {
  Zap,
  Activity,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Building2,
  CheckCircle2,
  Info,
} from '@/ds/icons';
import type { CalcResult, SubestacaoConfig } from '@/types';
import { EnquadramentoBadge } from '@/components/ui/Badge';

interface LiveDemandPanelProps {
  calcResult: CalcResult | null;
  isCalculating: boolean;
  hasEnoughData: boolean;
  subestacao?: SubestacaoConfig;
  onRecalculate?: () => void;
  error?: string | null;
  className?: string;
  compactOnMobile?: boolean;
}

export function LiveDemandPanel({
  calcResult,
  isCalculating,
  hasEnoughData,
  subestacao,
  onRecalculate,
  error,
  className = '',
  compactOnMobile = true,
}: LiveDemandPanelProps) {
  const [showMemory, setShowMemory] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const formatKw = (val?: number) => (val !== undefined ? `${val.toFixed(2)} kW` : '0,00 kW');
  const formatKva = (val?: number) => (val !== undefined ? `${val.toFixed(2)} kVA` : '0,00 kVA');

  // Calculate kVA fallback if not returned directly from backend
  const demandKva = calcResult?.demandKva ?? (calcResult ? Number((calcResult.calculatedDemand / 0.92).toFixed(2)) : 0);
  const installedKva = calcResult?.totalInstalledKva ?? (calcResult ? Number((calcResult.totalInstalledPower / 0.92).toFixed(2)) : 0);
  const powerFactor = calcResult?.powerFactor ?? 0.92;
  const simultaneity = calcResult?.simultaneityFactor
    ? (calcResult.simultaneityFactor * 100).toFixed(1) + '%'
    : calcResult && calcResult.totalInstalledPower > 0
    ? ((calcResult.calculatedDemand / calcResult.totalInstalledPower) * 100).toFixed(1) + '%'
    : '100%';

  // Substation adequacy check for MT
  const isMt = calcResult?.enquadramento === 'media_tensao' || calcResult?.needsSubstation;
  const selectedTrafoKva = subestacao?.potenciaNominal
    ? subestacao.potenciaNominal * (subestacao.quantidade || 1)
    : 0;
  const trafoAdequate = selectedTrafoKva > 0 && selectedTrafoKva >= demandKva;
  const trafoUnderSized = selectedTrafoKva > 0 && selectedTrafoKva < demandKva;

  return (
    <aside
      className={`rounded-2xl border border-line bg-surface shadow-sm transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Mobile Accordion Header */}
      {compactOnMobile && (
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-surface-2 border-b border-line">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isMt ? 'bg-warning-soft text-warning-fg' : 'bg-accent-soft text-accent-fg'}`}>
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-fg">
                  {calcResult ? `Demanda: ${formatKw(calcResult.calculatedDemand)}` : 'Cálculo em Tempo Real'}
                </span>
                {calcResult && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isMt ? 'bg-warning-soft text-warning-fg' : 'bg-accent-soft text-accent-fg'}`}>
                    {isMt ? 'MT' : 'BT'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted">
                {isCalculating
                  ? 'Calculando...'
                  : calcResult
                  ? `${formatKva(demandKva)} • ${calcResult.normaAplicada}`
                  : 'Aguardando dados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isCalculating && <Activity className="h-4 w-4 animate-spin text-accent-fg" />}
            <button
              type="button"
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-3 text-xs font-semibold flex items-center gap-1"
            >
              {mobileExpanded ? 'Recolher' : 'Ver painel'}
              {mobileExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Panel Content (Always visible on desktop, toggleable on mobile if compact) */}
      <div className={`${compactOnMobile && !mobileExpanded ? 'hidden lg:block' : 'block'}`}>
        {/* Panel Header */}
        <div className="p-4 bg-gradient-to-r bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/20 text-accent-fg border border-accent/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Cálculo de Demanda em Tempo Real</h3>
              <p className="text-xs text-subtle">
                DIS-NOR-030 (BT) • DIS-NOR-053 (MT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCalculating ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium text-on-primary/70 border border-accent/30">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Calculando...
              </span>
            ) : calcResult ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/20 px-2.5 py-1 text-xs font-medium text-success-fg border border-success/30">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Atualizado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-subtle">
                Pendente
              </span>
            )}

            {onRecalculate && (
              <button
                type="button"
                onClick={onRecalculate}
                title="Recalcular agora"
                className="rounded-lg p-1.5 text-subtle hover:text-on-primary hover:bg-primary transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-danger-soft border-b border-danger/30 text-danger-fg text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-danger-fg flex-shrink-0" />
              <span>{error}</span>
            </div>
            {onRecalculate && (
              <button
                type="button"
                onClick={onRecalculate}
                className="underline font-bold hover:text-danger-fg ml-2"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        {!hasEnoughData ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-subtle mb-3">
              <Calculator className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-fg-2">Preencha os dados necessários para calcular</h4>
            <p className="mt-1 text-xs text-muted max-w-xs mx-auto">
              Adicione unidades consumidoras e informe as cargas instaladas para processar automaticamente a demanda estimada.
            </p>
          </div>
        ) : calcResult ? (
          <div className="p-4 space-y-4">
            {/* Primary Highlight: Demanda Total */}
            <div className={`p-4 rounded-xl border transition-colors ${
              isMt
                ? 'bg-warning-soft/70 border-warning/30'
                : 'bg-success-soft/70 border-success/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Demanda Calculada Total
                </span>
                <EnquadramentoBadge enquadramento={calcResult.enquadramento} />
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tracking-tight ${
                  isMt ? 'text-warning-fg' : 'text-success-fg'
                }`}>
                  {formatKw(calcResult.calculatedDemand)}
                </span>
                <span className="text-sm font-semibold text-muted">
                  ({formatKva(demandKva)})
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <span>Norma: <strong>{calcResult.normaAplicada}</strong></span>
                <span>•</span>
                <span>FP: <strong>{powerFactor.toFixed(2)}</strong></span>
                <span>•</span>
                <span>Simultaneidade: <strong>{simultaneity}</strong></span>
              </div>
            </div>

            {/* Grid of Key Numerical Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-line bg-surface-2/80 p-3">
                <span className="text-[11px] font-medium text-muted block">Potência Instalada</span>
                <span className="text-sm font-bold text-fg block mt-0.5">
                  {formatKw(calcResult.totalInstalledPower)}
                </span>
                <span className="text-[10px] text-subtle block">
                  {formatKva(installedKva)}
                </span>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/80 p-3">
                <span className="text-[11px] font-medium text-muted block">Unidades Consumidoras</span>
                <span className="text-sm font-bold text-fg block mt-0.5">
                  {calcResult.unitCount} {calcResult.unitCount === 1 ? 'unidade' : 'unidades'}
                </span>
                <span className="text-[10px] text-subtle block">
                  Demanda: {formatKw(calcResult.unitDemand)}
                </span>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/80 p-3">
                <span className="text-[11px] font-medium text-muted block">Demanda Individual</span>
                <span className="text-sm font-bold text-fg block mt-0.5">
                  {formatKw(calcResult.unitDemand)}
                </span>
                <span className="text-[10px] text-subtle block">
                  Cargas residenciais / comerciais
                </span>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/80 p-3">
                <span className="text-[11px] font-medium text-muted block">Demanda Coletiva</span>
                <span className="text-sm font-bold text-fg block mt-0.5">
                  {formatKw(calcResult.serviceDemand)}
                </span>
                <span className="text-[10px] text-subtle block">
                  Cargas de serviço / condomínio
                </span>
              </div>
            </div>

            {/* Substation Section (Dynamic per BT/MT) */}
            <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className={`h-4 w-4 ${isMt ? 'text-warning-fg' : 'text-success-fg'}`} />
                <h5 className="text-xs font-bold text-fg">
                  {isMt ? 'Dimensionamento de Subestação (Obrigatório MT)' : 'Subestação Particular (BT)'}
                </h5>
              </div>

              {isMt ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-warning-soft border border-warning/30 text-warning-fg">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning-fg flex-shrink-0" />
                      Demanda superior a 75 kW (Média Tensão)
                    </p>
                    <p className="mt-1 text-[11px] text-warning-fg">
                      Conforme <strong>DIS-NOR-053</strong>, é obrigatório prever posto de transformação particular em 13,8 kV.
                    </p>
                    <p className="mt-1 text-[11px] text-warning-fg font-bold">
                      Potência comercial mínima recomendada: ≥{' '}
                      {calcResult.recommendedTransformerKva || Math.ceil(demandKva)} kVA
                    </p>
                  </div>

                  {/* Transformer Validation against Calculated Demand */}
                  {selectedTrafoKva > 0 ? (
                    <div className={`p-2.5 rounded-lg border text-[11px] ${
                      trafoUnderSized
                        ? 'bg-danger-soft border-danger/30 text-danger-fg'
                        : 'bg-success-soft border-success/30 text-success-fg'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {trafoUnderSized ? (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5 text-danger-fg flex-shrink-0" />
                            <span>Transformador Subdimensionado!</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-success-fg flex-shrink-0" />
                            <span>Transformador Adequado à Demanda</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1">
                        Transformador selecionado: <strong>{selectedTrafoKva} kVA</strong> vs Demanda:{' '}
                        <strong>{formatKva(demandKva)}</strong>.
                      </p>
                      {trafoUnderSized && (
                        <p className="mt-1 text-danger-fg font-semibold">
                          Atenção: A capacidade do transformador é insuficiente para a carga prevista. Ajuste na etapa 5.
                        </p>
                      )}
                      {trafoAdequate && (
                        <p className="mt-1 text-success-fg">
                          Margem de reserva técnica: +{(selectedTrafoKva - demandKva).toFixed(2)} kVA (
                          {(((selectedTrafoKva - demandKva) / demandKva) * 100).toFixed(0)}%).
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-surface-2 border border-line text-[11px] text-muted">
                      Transformador a ser selecionado na etapa <strong>5. Subestação</strong>.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-success-soft border border-success/30 text-xs text-success-fg">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-success-fg" />
                    <span>Subestação dispensada (DIS-NOR-030)</span>
                  </div>
                  <p className="mt-1 text-[11px] text-success-fg">
                    A demanda de <strong>{formatKw(calcResult.calculatedDemand)}</strong> é atendida diretamente pela rede de Baixa Tensão da concessionária (limite de 75 kW).
                  </p>
                </div>
              )}
            </div>

            {/* Auditable Calculation Memory Toggle */}
            {calcResult.calculationMemory && calcResult.calculationMemory.length > 0 && (
              <div className="border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setShowMemory(!showMemory)}
                  className="w-full flex items-center justify-between rounded-lg p-2 hover:bg-surface-2 text-xs font-bold text-fg-2 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-accent-fg" />
                    Memória de Cálculo Auditável ({calcResult.calculationMemory.length} itens)
                  </span>
                  {showMemory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showMemory && (
                  <div className="mt-2.5 max-h-72 overflow-y-auto rounded-lg border border-line bg-surface-2/50 p-2 text-[11px] scrollbar-thin">
                    <div className="space-y-2">
                      {calcResult.calculationMemory.map((item, idx) => (
                        <div key={idx} className="rounded-md border border-line bg-surface p-2">
                          <div className="flex items-center justify-between font-bold text-fg">
                            <span className="truncate pr-2">{item.description}</span>
                            <span className="text-accent-fg font-mono whitespace-nowrap">
                              {formatKw(item.resultDemandKw)}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-muted">
                            <span>Instalada: {formatKw(item.totalPowerKw)}</span>
                            <span>•</span>
                            <span>Fator: {(item.demandFactor * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span className="text-muted italic truncate max-w-[180px]">
                              {item.ruleReference}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Footer info note */}
        <div className="px-4 py-2.5 bg-surface-2 border-t border-line text-[10px] text-subtle flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Calculado conforme tabelas da DIS-NOR-030 e DIS-NOR-053 da Neoenergia.</span>
        </div>
      </div>
    </aside>
  );
}
