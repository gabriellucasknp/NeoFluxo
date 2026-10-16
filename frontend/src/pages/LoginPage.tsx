import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User as UserIcon, ArrowRight, Info, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/api';
import type { User, UserRole } from '@/types';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      if (fbUser) {
        const loggedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Engenheiro Google',
          email: fbUser.email || '',
          role: 'projetista',
          department: 'Projetos Elétricos',
        };
        const token = await fbUser.getIdToken();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Falha ao autenticar via Google Firebase.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Register form state (US-01)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'projetista' | 'analista' | 'admin'>('projetista');
  const [regDepartment, setRegDepartment] = useState('Projetos Elétricos');

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        if (res.user.role === 'analista') {
          navigate('/app/analise');
        } else if (res.user.role === 'admin') {
          navigate('/app/admin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
      } else {
        setError(res.error || 'E-mail ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validations (US-01)
    if (!regName.trim() || regName.trim().length < 3) {
      setError('O nome completo deve conter no mínimo 3 caracteres.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      setError('Informe um endereço de e-mail corporativo válido.');
      return;
    }
    if (regPassword.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword, regRole, regDepartment);
      if (res.success && res.user) {
        if (res.user.role === 'analista') {
          navigate('/app/analise');
        } else if (res.user.role === 'admin') {
          navigate('/app/admin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
      } else {
        setError(res.error || 'Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMsg(res.message);
    } catch (err: any) {
      setForgotMsg('Link de recuperação enviado com sucesso para o e-mail informado.');
    } finally {
      setForgotLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoRole: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
              <Zap className="h-7 w-7 text-neo-600" fill="currentColor" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white">Neoenergia</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neo-200">
                Pernambuco
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            Portal de Projetos
            <br />
            Elétricos
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neo-100">
            Cálculo automatizado de demanda elétrica, enquadramento normativo entre
            DIS-NOR-030 e DIS-NOR-053, e ciclo de aprovação técnica auditável com emissão de atestados digitais.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Cálculo automático de demanda conforme DIS-NOR-030',
              'Classificação automática entre Baixa Tensão (BT) e Média Tensão (MT)',
              'Memória de cálculo auditável discriminada por carga',
              'Gestão de rascunhos em 6 etapas e retomada contínua',
              'Atestados digitais autênticos com validação pública via QR Code',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-neo-100">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neo-500/40">
                  <CheckCircle2 className="h-3.5 w-3.5 text-neo-200" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-neo-200">
          © 2026 Neoenergia Pernambuco. Sistema corporativo de uso restrito e auditado.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neo-600 shadow-md">
              <Zap className="h-7 w-7 text-white" fill="white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">Neoenergia</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pernambuco
              </div>
            </div>
          </div>

          {/* Tab selector */}
          <div className="mb-6 flex rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar no Portal
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cadastrar Usuário
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              {mode === 'login' ? 'Identificação do Usuário' : 'Novo Cadastro no Portal'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'login'
                ? 'Acesse o sistema com suas credenciais corporativas ou contas de demonstração.'
                : 'Cadastre suas credenciais para submeter e acompanhar projetos elétricos.'}
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {successMsg && (
            <div className="mb-4">
              <Alert type="success">{successMsg}</Alert>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="label-base">
                  E-mail corporativo <span className="text-danger-500">*</span>
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
                  Senha de acesso <span className="text-danger-500">*</span>
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-neo-600 focus:ring-neo-500"
                  />
                  Lembrar credenciais
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotMsg(''); }}
                  className="font-medium text-neo-600 hover:text-neo-700 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-neo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neo-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative bg-slate-50 px-3 text-xs uppercase tracking-wider text-slate-400">
                  Ou continue com
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                {googleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neo-600 border-t-transparent" />
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Entrar com Google (Firebase Auth)</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="label-base">
                  Nome Completo <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Mendes"
                    required
                    minLength={3}
                    className="input-base pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="label-base">
                  E-mail Corporativo <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="carlos.mendes@neoenergia.com"
                    required
                    className="input-base pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">
                    Perfil de Acesso <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="input-base"
                  >
                    <option value="projetista">Projetista</option>
                    <option value="analista">Analista Neoenergia</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="label-base">
                    Departamento <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Ex: Projetos Elétricos"
                    className="input-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">
                    Senha <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mín. 6 chars"
                      required
                      minLength={6}
                      className="input-base pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-base">
                    Confirmar Senha <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      minLength={6}
                      className="input-base pl-9"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-neo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neo-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Concluir Cadastro e Acessar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo accounts helper */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/80 p-4">
            <div className="flex gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold text-blue-900">Perfis de Teste Pré-Configurados:</p>
                <p className="mt-1 opacity-90">
                  Clique em um dos perfis para preencher as credenciais e testar o fluxo completo:
                </p>
                <div className="mt-2.5 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo('carlos.mendes@neoenergia.com', 'projetista')}
                    className="flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-left font-medium text-blue-950 transition-colors hover:bg-white"
                  >
                    <span><strong>Projetista:</strong> carlos.mendes@neoenergia.com</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">US-04 / US-05</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('ana.silva@neoenergia.com', 'analista')}
                    className="flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-left font-medium text-blue-950 transition-colors hover:bg-white"
                  >
                    <span><strong>Analista:</strong> ana.silva@neoenergia.com</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">US-06 Parecer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('roberto.fonseca@neoenergia.com', 'admin')}
                    className="flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-left font-medium text-blue-950 transition-colors hover:bg-white"
                  >
                    <span><strong>Administrador:</strong> roberto.fonseca@neoenergia.com</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">Gestão & Normas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Autenticação segura via JSON Web Tokens (JWT)</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (US-02) */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Recuperação de Senha"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              Fechar
            </Button>
            {!forgotMsg && (
              <Button onClick={handleForgotSubmit} disabled={forgotLoading || !forgotEmail}>
                {forgotLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Informe o e-mail corporativo cadastrado. Você receberá um link de verificação para cadastrar uma nova senha.
          </p>
          {forgotMsg ? (
            <Alert type="success">{forgotMsg}</Alert>
          ) : (
            <div>
              <label className="label-base">E-mail corporativo</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu.nome@neoenergia.com"
                className="input-base"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
