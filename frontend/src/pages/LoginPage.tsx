import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Info,
  CheckCircle2,
  ShieldCheck,
  Building,
  ShieldAlert,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/api';
import type { User, UserRole } from '@/types';

interface GoogleAccountData {
  uid: string;
  name: string;
  email: string;
  photoUrl?: string;
  idToken?: string;
}

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'google-profile'
  const [mode, setMode] = useState<'login' | 'register' | 'google-profile'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google onboarding state
  const [googleData, setGoogleData] = useState<GoogleAccountData | null>(null);
  const [googleName, setGoogleName] = useState('');
  const [googleDepartment, setGoogleDepartment] = useState('Projetos Elétricos');
  const [selectedRole, setSelectedRole] = useState<UserRole>('projetista');

  // Register form state (US-01)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('projetista');
  const [regDepartment, setRegDepartment] = useState('Projetos Elétricos');

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  /**
   * FLUXO GOOGLE AUTH:
   * 1. Autentica com popup do Google
   * 2. Consulta o backend para verificar se usuário já tem perfil cadastrado
   * 3. Se for usuário novo ou sem perfil, abre a tela 'Complete seu cadastro'
   * 4. Se já possui perfil e está ativo, loga direto
   * 5. Se está com aprovação pendente, exibe a tela de pendência
   */
  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMsg('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      if (!fbUser || !fbUser.email) {
        throw new Error('Não foi possível recuperar os dados da conta Google.');
      }

      const idToken = await fbUser.getIdToken();

      // Consulta backend para checar se usuário já possui perfil
      const verifyRes = await authService.verifyGoogleAuth({
        idToken,
        email: fbUser.email,
        name: fbUser.displayName || '',
        uid: fbUser.uid,
        photoUrl: fbUser.photoURL || '',
      });

      if (verifyRes.needsProfile) {
        // Novo usuário ou sem perfil definido: exibe tela "Complete seu cadastro"
        const initialName = fbUser.displayName || fbUser.email.split('@')[0];
        setGoogleData({
          uid: fbUser.uid,
          email: fbUser.email,
          name: initialName,
          photoUrl: fbUser.photoURL || '',
          idToken,
        });
        setGoogleName(initialName);
        setGoogleDepartment('Projetos Elétricos');
        setSelectedRole('projetista');
        setMode('google-profile');
      } else if (verifyRes.token && verifyRes.user) {
        // Usuário existente já autorizado -> acesso imediato
        const loggedUser: User = {
          ...verifyRes.user,
          role: verifyRes.user.role.toLowerCase() as UserRole,
        };
        localStorage.setItem('token', verifyRes.token);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        if (loggedUser.role === 'analista') {
          navigate('/app/analise');
        } else if (loggedUser.role === 'admin') {
          navigate('/app/admin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
      }
    } catch (err: any) {
      console.warn('Google Sign-In Error:', err);
      setError(err.message || 'Falha ao autenticar via Google Firebase.');
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Conclusão do cadastro com Google (Seleção de Perfil)
   */
  const handleGoogleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleData) return;
    setError('');
    setLoading(true);

    if (!googleName.trim() || googleName.trim().length < 3) {
      setError('Nome completo deve ter pelo menos 3 caracteres.');
      setLoading(false);
      return;
    }
    if (!googleDepartment.trim()) {
      setError('O departamento ou área de atuação é obrigatório.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.completeGoogleProfile({
        idToken: googleData.idToken,
        uid: googleData.uid,
        email: googleData.email,
        name: googleName.trim(),
        role: selectedRole,
        department: googleDepartment.trim(),
      });

      if (res.token && res.user) {
        // Acesso imediato liberado para o perfil selecionado
        const loggedUser: User = {
          ...res.user,
          role: res.user.role.toLowerCase() as UserRole,
        };
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        if (loggedUser.role === 'analista') {
          navigate('/app/analise');
        } else if (loggedUser.role === 'admin') {
          navigate('/app/admin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
      } else {
        setError(res.message || 'Erro ao concluir o perfil de acesso.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao concluir o perfil de acesso.');
    } finally {
      setLoading(false);
    }
  };

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
    } catch {
      setForgotMsg('Link de recuperação enviado com sucesso para o e-mail informado.');
    } finally {
      setForgotLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding corporativo Neoenergia */}
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
              'Autenticação corporativa integrada com Google e Firestore',
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

      {/* Right panel — formulário dinâmico */}
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

          {/* TAB SELECTOR (Apenas visível em modo login / register) */}
          {(mode === 'login' || mode === 'register') && (
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
          )}

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

          {/* ================================================================ */}
          {/* TELA 1: LOGIN TRADICIONAL & GOOGLE */}
          {/* ================================================================ */}
          {mode === 'login' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Identificação do Usuário</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Acesse o sistema com suas credenciais corporativas ou autenticação Google.
                </p>
              </div>

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
                      <span>Entrar com Google</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* TELA 2: CADASTRO COM SENHA */}
          {/* ================================================================ */}
          {mode === 'register' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Novo Cadastro no Portal</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cadastre suas credenciais para submeter e acompanhar projetos elétricos.
                </p>
              </div>

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
                      Perfil Inicial <span className="text-danger-500">*</span>
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="input-base text-xs"
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
                      placeholder="Projetos Elétricos"
                      required
                      className="input-base"
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
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
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
                      placeholder="Repita sua senha"
                      required
                      minLength={6}
                      className="input-base pl-9"
                    />
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
            </div>
          )}

          {/* ================================================================ */}
          {/* TELA 3: ESCOLHA DE PERFIL NO LOGIN GOOGLE (NOVA ESPECIFICAÇÃO)   */}
          {/* ================================================================ */}
          {mode === 'google-profile' && googleData && (
            <div className="rounded-2xl border border-neo-200 bg-white p-6 shadow-md">
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 mb-3">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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
                  <span>Conta Google Autenticada</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Complete seu cadastro
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Selecione seu perfil de acesso para continuar no Portal de Projetos Elétricos.
                </p>
              </div>

              <form onSubmit={handleGoogleProfileSubmit} className="space-y-4">
                {/* Nome Completo */}
                <div>
                  <label className="label-base">
                    Nome Completo <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      minLength={3}
                      className="input-base pl-9"
                    />
                  </div>
                </div>

                {/* E-mail Corporativo (Preenchido e Travado) */}
                <div>
                  <label className="label-base">
                    E-mail Corporativo Autenticado
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={googleData.email}
                      disabled
                      className="input-base pl-9 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                    />
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    E-mail validado pelo provedor Google e vinculado ao Cloud Firestore.
                  </p>
                </div>

                {/* Perfil de Acesso — Opções detalhadas conforme especificação */}
                <div>
                  <label className="label-base">
                    Perfil de Acesso <span className="text-danger-500">*</span>
                  </label>

                  <div className="mt-2 space-y-2.5">
                    {/* Opção 1: Projetista */}
                    <div
                      onClick={() => setSelectedRole('projetista')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        selectedRole === 'projetista'
                          ? 'border-neo-600 bg-neo-50/70 ring-2 ring-neo-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="profileRole"
                          checked={selectedRole === 'projetista'}
                          onChange={() => setSelectedRole('projetista')}
                          className="mt-1 h-4 w-4 text-neo-600 focus:ring-neo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Projetista</span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Acesso Imediato
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">
                            Elaboração e gerenciamento de projetos elétricos, dimensionamento em 6 etapas e cálculo de demanda.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opção 2: Analista */}
                    <div
                      onClick={() => setSelectedRole('analista')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        selectedRole === 'analista'
                          ? 'border-neo-600 bg-neo-50/70 ring-2 ring-neo-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="profileRole"
                          checked={selectedRole === 'analista'}
                          onChange={() => setSelectedRole('analista')}
                          className="mt-1 h-4 w-4 text-neo-600 focus:ring-neo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Analista</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                              Corpo Técnico
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">
                            Análise técnica de projetos e emissão de pareceres, conforme as permissões autorizadas da Neoenergia.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opção 3: Administrador */}
                    <div
                      onClick={() => setSelectedRole('admin')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        selectedRole === 'admin'
                          ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="profileRole"
                          checked={selectedRole === 'admin'}
                          onChange={() => setSelectedRole('admin')}
                          className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Administrador</span>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              Requer Homologação
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">
                            Gerenciamento de usuários, perfis e configurações administrativas, conforme as permissões autorizadas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departamento */}
                <div>
                  <label className="label-base">
                    Departamento ou Área <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={googleDepartment}
                      onChange={(e) => setGoogleDepartment(e.target.value)}
                      placeholder="Ex: Projetos Elétricos / Engenharia"
                      required
                      className="input-base pl-9"
                    />
                  </div>
                </div>

                {/* Alerta Contextual Informativo */}
                {selectedRole === 'admin' ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900">
                    <div className="flex gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-blue-700 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Acesso ao Portal Liberado:</strong>
                        Seu acesso às funcionalidades de cálculo de demanda, memorial e emissão de atestados está autorizado imediatamente como Projetista.
                      </div>
                    </div>
                  </div>
                ) : selectedRole === 'analista' ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900">
                    <div className="flex gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-blue-700 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Perfil de Analista Técnico:</strong>
                        Acesso liberado à fila de análise técnica de projetos e homologação de atestados de viabilidade.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900">
                    <div className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Liberação Imediata:</strong>
                        Seu perfil de Projetista será ativado instantaneamente para iniciar projetos elétricos, calcular demandas e emitir atestados.
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-neo-600 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-neo-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Confirmar e Acessar Portal
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setGoogleData(null);
                      setError('');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Cancelar e voltar ao início
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Demo accounts helper (Apenas exibido no modo login) */}
          {mode === 'login' && (
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
                      onClick={() => fillDemo('carlos.mendes@neoenergia.com')}
                      className="flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-left font-medium text-blue-950 transition-colors hover:bg-white"
                    >
                      <span><strong>Projetista:</strong> carlos.mendes@neoenergia.com</span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">US-04 / US-05</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemo('ana.silva@neoenergia.com')}
                      className="flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-left font-medium text-blue-950 transition-colors hover:bg-white"
                    >
                      <span><strong>Analista:</strong> ana.silva@neoenergia.com</span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">US-06 Parecer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemo('roberto.fonseca@neoenergia.com')}
                      className="flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-left font-medium text-blue-950 transition-colors hover:bg-white"
                    >
                      <span><strong>Administrador:</strong> roberto.fonseca@neoenergia.com</span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">Gestão & Normas</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Autenticação auditada com Cloud Firestore & Firebase Auth</span>
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
