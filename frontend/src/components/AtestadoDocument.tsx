import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck2,
  FileBadge,
} from 'lucide-react';
import type { Project, Atestado } from '@/types';
import { formatKw } from '@/services/calcEngine';
import { Logo } from '@/ds';

interface AtestadoDocumentProps {
  project: Project;
  atestado?: Atestado | null;
  onClose?: () => void;
  showModalControls?: boolean;
}

export function AtestadoDocument({
  project,
  atestado: propAtestado,
  onClose,
  showModalControls = true,
}: AtestadoDocumentProps) {
  const atestado = propAtestado || project.atestado;
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const validationUrl = atestado?.uniqueIdentifier
    ? `${window.location.origin}/validar?codigo=${encodeURIComponent(atestado.uniqueIdentifier)}`
    : `${window.location.origin}/validar?codigo=${encodeURIComponent(project.code)}`;

  useEffect(() => {
    QRCode.toDataURL(validationUrl, {
      width: 256,
      margin: 1,
      color: { dark: '#00263e', light: '#ffffff' },
    })
      .then(setQrUrl)
      .catch((err) => console.error('Erro gerando QR Code:', err));
  }, [validationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(validationUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const issueDateFormatted = atestado?.issueDate
    ? new Date(atestado.issueDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const city = project.data?.city || 'Recife';
  const fullAddress = `${project.data?.address || 'Logradouro não informado'}, ${project.data?.number || 'S/N'}${
    project.data?.neighborhood ? ` — ${project.data.neighborhood}` : ''
  }, ${city} - PE, CEP: ${project.data?.cep || '50000-000'}`;

  const isMediaTensao =
    project.calcResult?.enquadramento === 'media_tensao' ||
    (project.calcResult?.calculatedDemand || 0) > 75;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Action Bar (hidden in print) */}
      {showModalControls && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-fg">
              <FileBadge className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-fg">
                Atestado Oficial — {atestado?.code || project.code}
              </p>
              <p className="text-[11px] text-muted">
                Documento formatado para visualização, impressão e download em PDF (A4).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg-2 transition hover:bg-surface-2 active:scale-95"
              title="Copiar URL de validação pública"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success-fg" />
                  <span className="text-success-fg">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-subtle hover:bg-surface-2 hover:text-muted transition"
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official Atestado Sheet (Paper Document layout) */}
      <div
        ref={printRef}
        className="relative bg-surface text-fg border border-line-strong shadow-xl rounded-xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none"
        style={{ minHeight: '297mm' }}
      >
        {/* Subtle Decorative Corporate Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-success rounded-t-xl print:rounded-none" />

        {/* 1. CABEÇALHO PROFISSIONAL */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-primary pb-5 gap-4 pt-2">
          {/* Logo & Concessionária */}
          <div className="text-center sm:text-left">
            <Logo size="lg" />
            <div>
              <p className="mt-2 text-xs font-semibold text-muted uppercase tracking-wider">
                Distribuição de Energia S.A. — Grupo Neoenergia
              </p>
              <p className="text-[11px] text-muted">
                Superintendência de Engenharia, Operações e Acesso à Rede
              </p>
            </div>
          </div>

          {/* Numeração do Documento & Protocolo */}
          <div className="text-center sm:text-right bg-surface-2 border border-line rounded-lg p-3 min-w-[210px]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-accent-fg">
              Atestado Técnico Oficial
            </span>
            <span className="font-mono text-base font-extrabold text-fg block">
              {atestado?.code || 'AT-2026-PENDENTE'}
            </span>
            <span className="block text-[11px] text-muted mt-0.5">
              Protocolo: <strong className="font-mono text-fg-2">{project.code}</strong>
            </span>
          </div>
        </div>

        {/* 2. TÍTULO CENTRALIZADO */}
        <div className="my-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-fg border-b-2 border-line pb-2 inline-block px-8">
            ATESTADO
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-accent-fg">
            Atestado Técnico de Conformidade, Enquadramento e Viabilidade de Demanda
          </p>
          <p className="text-[11px] text-muted italic mt-0.5">
            Emitido conforme as Normas Regulamentares DIS-NOR-030 e DIS-NOR-053
          </p>
        </div>

        {/* 3. TEXTO FORMAL E CLARO */}
        <div className="text-justify text-sm leading-relaxed text-fg mb-6 bg-surface-2/50 p-4 rounded-lg border border-line">
          <p>
            Atestamos, para os devidos fins de comprovação técnica, regularidade perante a
            concessionária distribuidora e órgãos competentes, que o dimensionamento elétrico,
            levantamento de cargas e cálculo de demanda do empreendimento abaixo identificado foram
            elaborados e validados em estrita conformidade com os critérios técnicos normativos da{' '}
            <strong>Neoenergia Pernambuco</strong>, sob a responsabilidade do profissional técnico
            habilitado signatário.
          </p>
        </div>

        {/* 4. IDENTIFICAÇÃO DO BENEFICIÁRIO E DO EMPREENDIMENTO */}
        <div className="mb-6">
          <div className="flex items-center gap-2 border-b border-line-strong pb-1 mb-3">
            <Building2 className="h-4 w-4 text-accent-fg" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg">
              1. Identificação do Beneficiário e da Instalação
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-surface-2 p-3 border border-line">
              <span className="block text-muted text-[11px] uppercase font-semibold">
                Beneficiário / Nome do Empreendimento
              </span>
              <strong className="block text-fg text-sm mt-0.5">
                {project.data?.name || 'Não informado'}
              </strong>
            </div>

            <div className="rounded-lg bg-surface-2 p-3 border border-line">
              <span className="block text-muted text-[11px] uppercase font-semibold">
                CNPJ / CPF do Titular
              </span>
              <strong className="block text-fg font-mono text-sm mt-0.5">
                {project.data?.document || 'Documento não informado'}
              </strong>
            </div>

            <div className="sm:col-span-2 rounded-lg bg-surface-2 p-3 border border-line">
              <span className="block text-muted text-[11px] uppercase font-semibold">
                Endereço da Instalação / Local da Obra
              </span>
              <strong className="block text-fg text-xs mt-0.5">
                {fullAddress}
              </strong>
            </div>
          </div>
        </div>

        {/* 5. PARÂMETROS TÉCNICOS E MEMÓRIA DE CÁLCULO HOMOLOGADA */}
        <div className="mb-6">
          <div className="flex items-center gap-2 border-b border-line-strong pb-1 mb-3">
            <FileCheck2 className="h-4 w-4 text-accent-fg" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-fg">
              2. Parâmetros Técnicos de Dimensionamento e Enquadramento
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-lg border border-line p-2.5 bg-surface">
              <span className="block text-muted text-[10px] uppercase font-semibold">
                Potência Instalada
              </span>
              <span className="block font-bold text-fg text-sm mt-0.5">
                {formatKw(project.calcResult?.totalInstalledPower || 0)}
              </span>
            </div>

            <div className="rounded-lg border border-accent/40 p-2.5 bg-accent-soft/50">
              <span className="block text-accent-fg text-[10px] uppercase font-bold">
                Demanda Calculada
              </span>
              <span className="block font-black text-accent-fg text-sm mt-0.5">
                {formatKw(project.calcResult?.calculatedDemand || 0)}
              </span>
            </div>

            <div className="rounded-lg border border-line p-2.5 bg-surface">
              <span className="block text-muted text-[10px] uppercase font-semibold">
                Enquadramento
              </span>
              <span className="block font-bold text-fg text-xs mt-0.5">
                {isMediaTensao ? 'Média Tensão (MT)' : 'Baixa Tensão (BT)'}
              </span>
            </div>

            <div className="rounded-lg border border-line p-2.5 bg-surface">
              <span className="block text-muted text-[10px] uppercase font-semibold">
                Norma Aplicada
              </span>
              <span className="block font-bold text-fg text-xs mt-0.5">
                {project.calcResult?.normaAplicada || 'DIS-NOR-030'} ({project.normaVersion || 'V1.0'})
              </span>
            </div>

            <div className="sm:col-span-2 rounded-lg border border-line p-2.5 bg-surface">
              <span className="block text-muted text-[10px] uppercase font-semibold">
                Subestação / Transformador
              </span>
              <span className="block font-medium text-fg text-xs mt-0.5">
                {isMediaTensao
                  ? project.subestacao?.transformadorLabel ||
                    `Transformador Dedicado MT — ${project.calcResult?.recommendedTransformerKva || 150} kVA`
                  : 'Dispensada — Atendimento direto pela rede de distribuição em Baixa Tensão'}
              </span>
            </div>

            <div className="sm:col-span-2 rounded-lg border border-line p-2.5 bg-surface">
              <span className="block text-muted text-[10px] uppercase font-semibold">
                Agrupamento / Unidades
              </span>
              <span className="block font-medium text-fg text-xs mt-0.5">
                {project.units?.length || 1} agrupamento(s) cadastrado(s)
              </span>
            </div>
          </div>
        </div>

        {/* 6. DATA DE EMISSÃO */}
        <div className="my-6 text-right text-xs text-fg-2">
          <p className="font-medium">
            {city} - PE, {issueDateFormatted}.
          </p>
        </div>

        {/* 7. ESPAÇO PARA ASSINATURA DO PROFISSIONAL RESPONSÁVEL */}
        <div className="my-8 pt-4 border-t border-line">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
            {/* Responsável Técnico pelo Projeto */}
            <div className="flex flex-col items-center justify-end">
              <div className="w-64 border-b-2 border-fg mb-2" />
              <strong className="block text-fg text-sm">
                {project.data?.technicalResponsible || project.projetistaName || 'Engenheiro Responsável Técnico'}
              </strong>
              <span className="text-muted text-[11px] block">
                {project.data?.artNumber ? `ART/TRT: ${project.data.artNumber}` : 'Registro Profissional Habilitado (CREA/CFT)'}
              </span>
              <span className="text-muted text-[10px] block mt-0.5">
                Responsável Técnico pelo Dimensionamento
              </span>
            </div>

            {/* Homologação Concessionária / Conformidade */}
            <div className="flex flex-col items-center justify-end">
              <div className="w-64 border-b-2 border-primary mb-2" />
              <strong className="block text-accent-fg text-sm">
                {atestado?.analystName || 'Engenharia de Acesso — Neoenergia Pernambuco'}
              </strong>
              <span className="text-muted text-[11px] block">
                Parecer de Viabilidade Técnica e Enquadramento
              </span>
              <span className="text-muted text-[10px] block mt-0.5">
                Conformidade DIS-NOR-030 / DIS-NOR-053
              </span>
            </div>
          </div>
        </div>

        {/* 8. AUTENTICIDADE DIGITAL & QR CODE */}
        <div className="mt-8 rounded-xl border border-line bg-surface-2/80 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-accent-fg">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Chave de Autenticidade Digital
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-fg break-all">
                {atestado?.uniqueIdentifier || `NEO-AT-2026-${project.code}`}
              </p>
              <p className="text-[11px] text-muted">
                A validade jurídica deste documento pode ser confirmada publicamente pelo QR Code ou no endereço:
              </p>
              <p className="font-mono text-[11px] text-accent-fg underline break-all">
                {validationUrl}
              </p>
            </div>

            {qrUrl && (
              <div className="flex flex-col items-center shrink-0">
                <img
                  src={qrUrl}
                  alt="QR Code de Validação"
                  className="h-24 w-24 rounded border border-line-strong bg-surface p-1 shadow-sm"
                />
                <span className="text-[9px] text-subtle mt-1 uppercase font-semibold">
                  Validar via Smartphone
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="mt-6 pt-3 border-t border-line text-center text-[10px] text-subtle">
          Documento gerado eletronicamente pelo Portal de Projetos Elétricos da Neoenergia Pernambuco.
          Emissão em conformidade com as resoluções da ANEEL e normas técnicas DIS-NOR-030 e DIS-NOR-053.
        </div>
      </div>
    </div>
  );
}
