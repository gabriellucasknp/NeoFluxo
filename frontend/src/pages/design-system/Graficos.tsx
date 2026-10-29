import { useState } from 'react';
import { AreaTrend, ArrowButton, Card, ChartTable, PieShare, PillBars, SectionHeader, Segmented } from '@/ds';

/*
 * Gráficos que Mateus marcou: pizza e barras do 6 ("das cores"), área com cartão flutuante e números do 9.
 * Dados de exemplo no domínio do NeoFluxo.
 */

const MESES = [
  { label: 'Mai', value: 4 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 5 },
  { label: 'Ago', value: 11 },
  { label: 'Set', value: 7 },
  { label: 'Out', value: 9 },
];

const SEMANAS = [
  { label: '01/09', value: 120, bt: 80, mt: 40 },
  { label: '08/09', value: 182, bt: 96, mt: 86 },
  { label: '15/09', value: 150, bt: 92, mt: 58 },
  { label: '22/09', value: 238, bt: 110, mt: 128 },
  { label: '29/09', value: 210, bt: 104, mt: 106 },
  { label: '06/10', value: 296, bt: 122, mt: 174 },
  { label: '13/10', value: 262, bt: 118, mt: 144 },
  { label: '20/10', value: 381, bt: 141, mt: 240 },
];

const ENQ = [
  { label: 'Baixa Tensão', value: 16 },
  { label: 'Média Tensão', value: 6 },
  { label: 'Média com subestação', value: 3 },
];

export function Graficos() {
  const [visao, setVisao] = useState('demanda');
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <SectionHeader
          title="Demanda submetida"
          subtitle="Soma das demandas calculadas, por semana"
          actions={
            <Segmented
              size="sm"
              label="Visão"
              value={visao}
              onChange={setVisao}
              items={[
                { value: 'demanda', label: 'Demanda' },
                { value: 'projetos', label: 'Projetos' },
              ]}
            />
          }
        />
        <div className="mt-5">
          <AreaTrend data={visao === 'demanda' ? SEMANAS : SEMANAS.map((s) => ({ ...s, value: Math.round(s.value / 40), bt: Math.round(s.bt / 40), mt: Math.round(s.mt / 40) }))} />
        </div>
        <ChartTable caption="Demanda submetida por semana" rows={SEMANAS} unit="kW" />
      </Card>

      <Card className="lg:col-span-2">
        <SectionHeader title="Enquadramento" subtitle="25 projetos em 2026" actions={<ArrowButton label="Abrir relatório" size="sm" />} />
        <div className="mt-6">
          <PieShare data={ENQ} size={180} />
        </div>
      </Card>

      <Card tone="highlight" className="lg:col-span-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Projetos enviados por mês</h3>
            <p className="text-sm opacity-80">Passe o mouse nas barras</p>
          </div>
          <p className="font-display text-5xl font-light leading-none tracking-tight tabular">
            42 <span className="text-base font-medium opacity-80">no semestre</span>
          </p>
        </div>
        <div className="mt-6">
          <PillBars data={MESES} onColor height={200} />
        </div>
      </Card>
    </div>
  );
}
