import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  Zap,
  Building2,
  Calendar,
  FileCheck2,
  FileBadge,
} from 'lucide-react';
import type { Project, Atestado } from '@/types';
import { formatKw } from '@/services/calcEngine';

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neo-50 text-neo-700">
              <FileBadge className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Atestado Oficial — {atestado?.code || project.code}
              </p>
              <p className="text-[11px] text-slate-500">
                Documento formatado para visualização, impressão e download em PDF (A4).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              title="Copiar URL de validação pública"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neo-700 active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
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
        className="relative bg-white text-slate-900 border border-slate-300 shadow-xl rounded-xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none"
        style={{ minHeight: '297mm' }}
      >
        {/* Subtle Decorative Corporate Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-neo-700 via-neo-500 to-emerald-500 rounded-t-xl print:rounded-none" />

        {/* 1. CABEÇALHO PROFISSIONAL */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-neo-800 pb-5 gap-4 pt-2">
          {/* Logo & Concessionária */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neo-700 text-white shadow-md">
              <Zap className="h-8 w-8" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-neo-950 uppercase">
                Neoenergia Pernambuco
              </h1>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Distribuição de Energia S.A. — Grupo Neoenergia
              </p>
              <p className="text-[11px] text-slate-500">
                Superintendência de Engenharia, Operações e Acesso à Rede
              </p>
            </div>
          </div>

          {/* Numeração do Documento & Protocolo */}
          <div className="text-center sm:text-right bg-slate-50 border border-slate-200 rounded-lg p-3 min-w-[210px]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neo-700">
              Atestado Técnico Oficial
            </span>
            <span className="font-mono text-base font-extrabold text-slate-900 block">
              {atestado?.code || 'AT-2026-PENDENTE'}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Protocolo: <strong className="font-mono text-slate-700">{project.code}</strong>
            </span>
          </div>
        </div>

        {/* 2. TÍTULO CENTRALIZADO */}
        <div className="my-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 border-b-2 border-slate-200 pb-2 inline-block px-8">
            ATESTADO
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neo-800">
            Atestado Técnico de Conformidade, Enquadramento e Viabilidade de Demanda
          </p>
          <p className="text-[11px] text-slate-500 italic mt-0.5">
            Emitido conforme as Normas Regulamentares DIS-NOR-030 e DIS-NOR-053
          </p>
        </div>

        {/* 3. TEXTO FORMAL E CLARO */}
        <div className="text-justify text-sm leading-relaxed text-slate-800 mb-6 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
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
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1 mb-3">
            <Building2 className="h-4 w-4 text-neo-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1. Identificação do Beneficiário e da Instalação
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="block text-slate-500 text-[11px] uppercase font-semibold">
                Beneficiário / Nome do Empreendimento
              </span>
              <strong className="block text-slate-900 text-sm mt-0.5">
                {project.data?.name || 'Não informado'}
              </strong>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="block text-slate-500 text-[11px] uppercase font-semibold">
                CNPJ / CPF do Titular
              </span>
              <strong className="block text-slate-900 font-mono text-sm mt-0.5">
                {project.data?.document || 'Documento não informado'}
              </strong>
            </div>

            <div className="sm:col-span-2 rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="block text-slate-500 text-[11px] uppercase font-semibold">
                Endereço da Instalação / Local da Obra
              </span>
              <strong className="block text-slate-900 text-xs mt-0.5">
                {fullAddress}
              </strong>
            </div>
          </div>
        </div>

        {/* 5. PARÂMETROS TÉCNICOS E MEMÓRIA DE CÁLCULO HOMOLOGADA */}
        <div className="mb-6">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1 mb-3">
            <FileCheck2 className="h-4 w-4 text-neo-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              2. Parâmetros Técnicos de Dimensionamento e Enquadramento
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-lg border border-slate-200 p-2.5 bg-white">
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                Potência Instalada
              </span>
              <span className="block font-bold text-slate-900 text-sm mt-0.5">
                {formatKw(project.calcResult?.totalInstalledPower || 0)}
              </span>
            </div>

            <div className="rounded-lg border border-neo-300 p-2.5 bg-neo-50/50">
              <span className="block text-neo-700 text-[10px] uppercase font-bold">
                Demanda Calculada
              </span>
              <span className="block font-black text-neo-900 text-sm mt-0.5">
                {formatKw(project.calcResult?.calculatedDemand || 0)}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 p-2.5 bg-white">
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                Enquadramento
              </span>
              <span className="block font-bold text-slate-900 text-xs mt-0.5">
                {isMediaTensao ? 'Média Tensão (MT)' : 'Baixa Tensão (BT)'}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 p-2.5 bg-white">
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                Norma Aplicada
              </span>
              <span className="block font-bold text-slate-900 text-xs mt-0.5">
                {project.calcResult?.normaAplicada || 'DIS-NOR-030'} ({project.normaVersion || 'V1.0'})
              </span>
            </div>

            <div className="sm:col-span-2 rounded-lg border border-slate-200 p-2.5 bg-white">
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                Subestação / Transformador
              </span>
              <span className="block font-medium text-slate-900 text-xs mt-0.5">
                {isMediaTensao
                  ? project.subestacao?.transformadorLabel ||
                    `Transformador Dedicado MT — ${project.calcResult?.recommendedTransformerKva || 150} kVA`
                  : 'Dispensada — Atendimento direto pela rede de distribuição em Baixa Tensão'}
              </span>
            </div>

            <div className="sm:col-span-2 rounded-lg border border-slate-200 p-2.5 bg-white">
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                Agrupamento / Unidades
              </span>
              <span className="block font-medium text-slate-900 text-xs mt-0.5">
                {project.units?.length || 1} agrupamento(s) cadastrado(s)
              </span>
            </div>
          </div>
        </div>

        {/* 6. DATA DE EMISSÃO */}
        <div className="my-6 text-right text-xs text-slate-700">
          <p className="font-medium">
            {city} - PE, {issueDateFormatted}.
          </p>
        </div>

        {/* 7. ESPAÇO PARA ASSINATURA DO PROFISSIONAL RESPONSÁVEL */}
        <div className="my-8 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
            {/* Responsável Técnico pelo Projeto */}
            <div className="flex flex-col items-center justify-end">
              <div className="w-64 border-b-2 border-slate-900 mb-2" />
              <strong className="block text-slate-900 text-sm">
                {project.data?.technicalResponsible || project.projetistaName || 'Engenheiro Responsável Técnico'}
              </strong>
              <span className="text-slate-600 text-[11px] block">
                {project.data?.artNumber ? `ART/TRT: ${project.data.artNumber}` : 'Registro Profissional Habilitado (CREA/CFT)'}
              </span>
              <span className="text-slate-500 text-[10px] block mt-0.5">
                Responsável Técnico pelo Dimensionamento
              </span>
            </div>

            {/* Homologação Concessionária / Conformidade */}
            <div className="flex flex-col items-center justify-end">
              <div className="w-64 border-b-2 border-neo-800 mb-2" />
              <strong className="block text-neo-950 text-sm">
                {atestado?.analystName || 'Engenharia de Acesso — Neoenergia Pernambuco'}
              </strong>
              <span className="text-slate-600 text-[11px] block">
                Parecer de Viabilidade Técnica e Enquadramento
              </span>
              <span className="text-slate-500 text-[10px] block mt-0.5">
                Conformidade DIS-NOR-030 / DIS-NOR-053
              </span>
            </div>
          </div>
        </div>

        {/* 8. AUTENTICIDADE DIGITAL & QR CODE */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-neo-700">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Chave de Autenticidade Digital
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-slate-800 break-all">
                {atestado?.uniqueIdentifier || `NEO-AT-2026-${project.code}`}
              </p>
              <p className="text-[11px] text-slate-500">
                A validade jurídica deste documento pode ser confirmada publicamente pelo QR Code ou no endereço:
              </p>
              <p className="font-mono text-[11px] text-neo-700 underline break-all">
                {validationUrl}
              </p>
            </div>

            {qrUrl && (
              <div className="flex flex-col items-center shrink-0">
                <img
                  src={qrUrl}
                  alt="QR Code de Validação"
                  className="h-24 w-24 rounded border border-slate-300 bg-white p-1 shadow-sm"
                />
                <span className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                  Validar via Smartphone
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Documento gerado eletronicamente pelo Portal de Projetos Elétricos da Neoenergia Pernambuco.
          Emissão em conformidade com as resoluções da ANEEL e normas técnicas DIS-NOR-030 e DIS-NOR-053.
        </div>
      </div>
    </div>
  );
}
