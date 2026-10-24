// Aponta campo, select, tabela, botão e modal feitos na mão fora de src/ds.
// Uso: npm run check:ds   (sai com erro se achar algum; --relatorio só lista)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = new URL('../src', import.meta.url).pathname;
const LIVRES = ['ds/', 'pages/design-system/', 'components/ThemeToggle.tsx'];
const REGRAS = [
  [/<input\b/, 'campo na mão → TextField / SearchField'],
  [/<select\b/, 'select nativo → Select'],
  [/<textarea\b/, 'textarea na mão → TextArea'],
  [/<table\b/, 'tabela na mão → DataTable'],
  [/<button\b/, 'botão na mão → Button / IconButton'],
  [/\bwindow\.confirm\(/, 'confirmação do navegador → ConfirmDialog'],
  [/fixed inset-0/, 'modal na mão → Modal'],
];

const arquivos = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? arquivos(p) : /\.tsx$/.test(f) ? [p] : [];
  });

const achados = [];
for (const f of arquivos(SRC)) {
  const rel = relative(SRC, f);
  if (LIVRES.some((l) => rel.startsWith(l))) continue;
  readFileSync(f, 'utf8')
    .split('\n')
    .forEach((linha, i) => {
      for (const [re, msg] of REGRAS) if (re.test(linha)) achados.push(`${rel}:${i + 1}  ${msg}`);
    });
}

if (!achados.length) {
  console.log('check:ds ok — tudo pelos componentes de src/ds');
} else {
  console.log(achados.join('\n'));
  console.log(`\n${achados.length} pontos fora do design system`);
  if (!process.argv.includes('--relatorio')) process.exit(1);
}
