
/*
 * Badge único (hoje são 6). Pílula suave com ponto, como o status das refs 7, 11 e 13.
 * Cor de status nunca sozinha: sempre com o texto do estado.
 */

export type Status = 'rascunho' | 'enviado_analise' | 'em_analise' | 'aprovado' | 'reprovado';

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  rascunho: { label: 'Rascunho', tone: 'neutral' },
  enviado_analise: { label: 'Enviado para análise', tone: 'info' },
  em_analise: { label: 'Em análise', tone: 'warning' },
  aprovado: { label: 'Aprovado', tone: 'success' },
  reprovado: { label: 'Reprovado', tone: 'danger' },
};

type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'brand';
const TONE: Record<Tone, [string, string]> = {
  neutral: ['bg-surface-3 text-fg-2', 'bg-muted'],
  info: ['bg-info-soft text-info-fg', 'bg-info'],
  warning: ['bg-warning-soft text-warning-fg', 'bg-warning'],
  success: ['bg-success-soft text-success-fg', 'bg-success'],
  danger: ['bg-danger-soft text-danger-fg', 'bg-danger'],
  brand: ['bg-accent-soft text-accent-fg', 'bg-accent'],
};

// em cima do azul (linha escolhida, card destacado): pílula branca translúcida; o ponto guarda a cor do estado
const SOBRE_AZUL: Record<Tone, string> = {
  neutral: 'bg-white/70',
  info: 'bg-white',
  warning: 'bg-[#FFC53D]',
  success: 'bg-[#5BE37D]',
  danger: 'bg-[#FF8A80]',
  brand: 'bg-white',
};

export function Badge({ tone = 'neutral', children, pulse, onColor }: { tone?: Tone; children: React.ReactNode; pulse?: boolean; onColor?: boolean }) {
  const [box0, dot0] = TONE[tone];
  const box = onColor ? 'bg-white/15 text-on-highlight ring-1 ring-inset ring-white/25' : box0;
  const dot = onColor ? SOBRE_AZUL[tone] : dot0;
  return (
    <span
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors duration-300 ${box}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={`absolute inset-0 animate-ping rounded-full opacity-60 ${dot}`} />}
        <span className={`relative h-1.5 w-1.5 rounded-full ${dot}`} />
      </span>
      {children}
    </span>
  );
}

export function StatusBadge({ status, onColor }: { status: Status; onColor?: boolean }) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} pulse={status === 'em_analise'} onColor={onColor}>
      {s.label}
    </Badge>
  );
}

/** Enquadramento: Baixa Tensão em azul da marca, Média Tensão em âmbar (hoje era roxo numa tela e âmbar na outra). */
export function TensionBadge({ media, onColor }: { media: boolean; onColor?: boolean }) {
  return (
    <Badge tone={media ? 'warning' : 'brand'} onColor={onColor}>
      {media ? 'Média Tensão' : 'Baixa Tensão'}
    </Badge>
  );
}
