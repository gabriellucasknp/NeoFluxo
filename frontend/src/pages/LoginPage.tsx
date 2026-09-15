import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate('/app/dashboard');
      } else {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
        setLoading(false);
      }
    }, 600);
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-neo-600 p-12 lg:flex">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-neo-500/20" />
          <div className="absolute -bottom-32 -left-10 h-96 w-96 rounded-full bg-neo-700/30" />
          <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-neo-400/10" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
              <Zap className="h-7 w-7 text-neo-600" fill="currentColor" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">Neoenergia</div>
              <div className="text-xs font-medium uppercase tracking-wider text-neo-200">
                Pernambuco
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Portal de Projetos
            <br />
            Elétricos
          </h1>
          <p className="mt-4 max-w-md text-neo-100">
            Cálculo automatizado de demanda elétrica, enquadramento entre as normas
            DIS-NOR-030 e DIS-NOR-053, e gestão completa do ciclo de aprovação de projetos.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Cálculo automático de demanda conforme DIS-NOR-030',
              'Enquadramento automático entre Baixa e Média Tensão',
              'Fluxo de análise e aprovação auditável',
              'Atestados digitais com QR Code de validação pública',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-neo-100">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neo-500/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-neo-200" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-neo-200">
          © 2026 Neoenergia Pernambuco. Sistema interno de uso restrito.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neo-600">
              <Zap className="h-7 w-7 text-white" fill="white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">Neoenergia</div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Pernambuco
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Portal de Projetos Elétricos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Acesse o sistema com suas credenciais do portal Neoenergia.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">
                E-mail / Usuário <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@neoenergia.com"
                  required
                  className="input-base pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label-base">
                Senha <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base pl-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-neo-600 focus:ring-neo-500" />
                Manter conectado
              </label>
              <button type="button" className="text-sm font-medium text-neo-600 hover:text-neo-700">
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neo-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-neo-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <div className="text-xs text-blue-700">
                <p className="font-semibold">Acesso de demonstração</p>
                <p className="mt-1 opacity-90">
                  Use as credenciais abaixo para testar cada perfil:
                </p>
                <div className="mt-2 space-y-1">
                  <button onClick={() => fillDemo('carlos.mendes@neoenergia.com')} className="block text-blue-700 underline hover:text-blue-800">
                    Projetista — carlos.mendes@neoenergia.com
                  </button>
                  <button onClick={() => fillDemo('ana.silva@neoenergia.com')} className="block text-blue-700 underline hover:text-blue-800">
                    Analista — ana.silva@neoenergia.com
                  </button>
                  <button onClick={() => fillDemo('roberto.fonseca@neoenergia.com')} className="block text-blue-700 underline hover:text-blue-800">
                    Admin — roberto.fonseca@neoenergia.com
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            O acesso utiliza as credenciais do portal atual da Neoenergia Pernambuco.
          </p>
        </div>
      </div>
    </div>
  );
}
