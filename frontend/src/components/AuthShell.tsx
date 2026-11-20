import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo, NeoFluxoMark } from '@/ds';

/*
 * Moldura das telas de acesso (login e redefinição de senha): painel azul com a marca à esquerda
 * (só desktop) e o formulário à direita. Tirado do LoginPage pra as duas telas ficarem iguais.
 */

// o 3D (three.js) só baixa no desktop, que é onde o painel azul existe
const Logo3D = lazy(() => import('@/components/Logo3D'));

function MarcaPlana() {
  return (
    <div className="flex h-full items-center justify-center text-on-panel/90">
      <NeoFluxoMark className="h-40" />
    </div>
  );
}

/** Sem WebGL (ou se a cena quebrar), fica o N plano no lugar. */
class SemWebGL extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false };
  static getDerivedStateFromError() {
    return { erro: true };
  }
  render() {
    return this.state.erro ? <MarcaPlana /> : this.props.children;
  }
}

function Marca3D() {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  if (!desktop) return null;
  return (
    <div aria-hidden className="h-full min-h-[240px] w-full">
      <SemWebGL>
        <Suspense fallback={<MarcaPlana />}>
          <Logo3D />
        </Suspense>
      </SemWebGL>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Painel azul (só desktop), no molde do login de Camelo: marca em cima, o N 3D no centro, recado curto embaixo.
          select-none: arrastar o N pra girar não pode sair selecionando o texto do painel. */}
      <aside className="relative hidden w-1/2 select-none flex-col overflow-hidden bg-panel p-12 lg:flex">
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full" style={{ background: 'radial-gradient(circle, rgb(90 130 255 / 0.35), transparent 70%)' }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full" style={{ background: 'radial-gradient(circle, rgb(90 130 255 / 0.25), transparent 70%)' }} />
        <div className="relative z-10">
          <Logo onNav size="lg" />
        </div>
        {/* min-h-0 + bloco simples: o Canvas mede o PAI pra se dimensionar */}
        <div className="relative z-10 flex min-h-0 flex-1 justify-center py-6">
          <Marca3D />
        </div>
        <div className="relative z-10">
          <h1 className="max-w-md font-display text-[2rem] font-semibold leading-tight tracking-tight text-on-panel">
            Do memorial ao atestado, num lugar só.
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-on-panel/70">
            A demanda sai calculada pela DIS-NOR-030, o enquadramento em BT ou MT na hora e o atestado com QR de validação.
          </p>
        </div>
      </aside>

      {/* Right panel — formulário dinâmico */}
      <div className="relative flex w-full flex-col items-center bg-surface-2 px-6 pb-16 pt-16 lg:w-1/2 lg:pt-[max(5rem,12vh)]">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
