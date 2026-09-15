import type {
  ConsumerUnitGroup,
  ServiceLoad,
  Project,
  CalcResult,
  DemandFactor,
  Enquadramento,
  NormaAplicada,
} from '@/types';
import { mockDemandFactors } from '@/data/mockData';

export const DEMAND_LIMIT_KW = 75;

function findFactor(category: string, powerW: number, factors: DemandFactor[]): number {
  const matching = factors.filter(
    (f) =>
      f.category === category &&
      f.active &&
      powerW >= f.minPower &&
      (f.maxPower === 0 || powerW <= f.maxPower),
  );
  if (matching.length === 0) return 1.0;
  return matching[0].factor;
}

export function calculateUnitDemand(
  unit: ConsumerUnitGroup,
  factors: DemandFactor[] = mockDemandFactors,
): { installedPower: number; demand: number } {
  let installedPowerW = 0;
  let demandW = 0;

  for (const load of unit.loads) {
    const loadPowerW = load.quantity * load.powerPerUnit;
    installedPowerW += loadPowerW;
    const factor = findFactor(load.type, loadPowerW, factors);
    demandW += loadPowerW * factor;
  }

  // Apply per-unit demand, then multiply by unit count
  const perUnitDemandW = demandW;
  const totalDemandW = perUnitDemandW * unit.unitCount;
  const totalInstalledW = installedPowerW * unit.unitCount;

  return {
    installedPower: totalInstalledW / 1000,
    demand: totalDemandW / 1000,
  };
}

export function calculateServiceLoads(
  loads: ServiceLoad[],
  factors: DemandFactor[] = mockDemandFactors,
): { installedPower: number; demand: number } {
  let installedPowerW = 0;
  let demandW = 0;

  for (const load of loads) {
    const loadPowerW = load.quantity * load.power;
    installedPowerW += loadPowerW;
    const factor = findFactor(load.category, loadPowerW, factors);
    demandW += loadPowerW * factor;
  }

  return {
    installedPower: installedPowerW / 1000,
    demand: demandW / 1000,
  };
}

export function determineProjectClassification(demandKw: number): {
  enquadramento: Enquadramento;
  normaAplicada: NormaAplicada;
  needsSubstation: boolean;
} {
  if (demandKw <= DEMAND_LIMIT_KW) {
    return {
      enquadramento: 'baixa_tensao',
      normaAplicada: 'DIS-NOR-030',
      needsSubstation: false,
    };
  }
  return {
    enquadramento: 'media_tensao',
    normaAplicada: 'DIS-NOR-053',
    needsSubstation: true,
  };
}

export function calculateProjectDemand(
  units: ConsumerUnitGroup[],
  serviceLoads: ServiceLoad[],
  factors: DemandFactor[] = mockDemandFactors,
): CalcResult {
  let totalInstalledKw = 0;
  let unitDemandKw = 0;
  let unitCount = 0;

  for (const unit of units) {
    const result = calculateUnitDemand(unit, factors);
    totalInstalledKw += result.installedPower;
    unitDemandKw += result.demand;
    unitCount += unit.unitCount;
  }

  const serviceResult = calculateServiceLoads(serviceLoads, factors);
  totalInstalledKw += serviceResult.installedPower;
  const serviceDemandKw = serviceResult.demand;

  const calculatedDemand = +(unitDemandKw + serviceDemandKw).toFixed(2);
  const { enquadramento, normaAplicada, needsSubstation } =
    determineProjectClassification(calculatedDemand);

  return {
    totalInstalledPower: +totalInstalledKw.toFixed(2),
    calculatedDemand,
    unitCount,
    unitDemand: +unitDemandKw.toFixed(2),
    serviceDemand: +serviceDemandKw.toFixed(2),
    enquadramento,
    normaAplicada,
    needsSubstation,
  };
}

export function formatKw(kw: number): string {
  return `${kw.toFixed(1).replace('.', ',')} kW`;
}

export function getEnquadramentoLabel(e: Enquadramento): string {
  return e === 'baixa_tensao' ? 'Baixa Tensão' : 'Média Tensão';
}

export function getNormaLabel(n: NormaAplicada): string {
  return n;
}

export function projectSummary(project: Project): string {
  const r = project.calcResult;
  return `${formatKw(r.calculatedDemand)} — ${getEnquadramentoLabel(r.enquadramento)} — ${r.normaAplicada}`;
}
