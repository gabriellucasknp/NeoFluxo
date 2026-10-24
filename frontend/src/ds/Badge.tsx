import { motion } from 'motion/react';
import { spring } from './motion';

/*
 * Badge único (hoje são 6). Pílula suave com ponto, como o status das refs 7, 11 e 13.
 * Cor de status nunca sozinha: sempre com o texto do estado.
 */

export type Status = 'rascunho' | 'enviado_analise' | 'em_analise' | 'aprovado' | 'reprovado';

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  rascunho: { label: 'Rascunho', tone: 'neutral' },
  enviado_analise: { label: 'Aguardando análise', tone: 'info' },
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

export function Badge({ tone = 'neutral', children, pulse }: { tone?: Tone; children: React.ReactNode; pulse?: boolean }) {
  const [box, dot] = TONE[tone];
  return (
    <motion.span
      layout
      transition={spring.snappy}
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold ${box}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={`absolute inset-0 animate-ping rounded-full opacity-60 ${dot}`} />}
        <span className={`relative h-1.5 w-1.5 rounded-full ${dot}`} />
      </span>
      {children}
    </motion.span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <Badge tone={s.tone} pulse={status === 'em_analise'}>
      {s.label}
    </Badge>
  );
}

/** Enquadramento: Baixa Tensão em azul da marca, Média Tensão em âmbar (hoje era roxo numa tela e âmbar na outra). */
export function TensionBadge({ media }: { media: boolean }) {
  return <Badge tone={media ? 'warning' : 'brand'}>{media ? 'Média Tensão' : 'Baixa Tensão'}</Badge>;
}
