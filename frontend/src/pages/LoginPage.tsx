import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowLeft } from '@/ds/icons';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { AuthShell } from '@/components/AuthShell';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/api';
import type { User, UserRole } from '@/types';
import { Segmented, Select as DsSelect, TextField } from '@/ds';

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
  // volta da tela de redefinição (US-02) com o aviso de sucesso
  const senhaRedefinida = Boolean((useLocation().state as { senhaRedefinida?: boolean } | null)?.senhaRedefinida);

  // Mode: 'login' | 'register' | 'google-profile'
  const [mode, setMode] = useState<'login' | 'register' | 'google-profile'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(senhaRedefinida ? 'Senha redefinida com sucesso. Entre com a nova senha.' : '');
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
  const [forgotErro, setForgotErro] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  // só no modo demonstração (VITE_MOCK): não tem e-mail, então o link aparece no modal
  const [forgotDemoToken, setForgotDemoToken] = useState('');

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
    setForgotErro('');
    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMsg(res.message);
      setForgotDemoToken(res.demoToken ?? '');
    } catch (err: any) {
      setForgotErro(err.message || 'Não foi possível enviar o link agora. Tente de novo em instantes.');
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
    <>
      <AuthShell>
          {/* TAB SELECTOR (Apenas visível em modo login / register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mb-8">
              <Segmented
                full
                label="Acesso"
                value={mode}
                onChange={(v) => { setMode(v as 'login' | 'register'); setError(''); setSuccessMsg(''); }}
                items={[
                  { value: 'login', label: 'Entrar' },
                  { value: 'register', label: 'Criar conta' },
                ]}
              />
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
                <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">Bem-vindo de volta</h2>
                <p className="mt-1 text-sm text-muted">
                  Entre com o e-mail corporativo pra acompanhar seus projetos.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <TextField label="E-mail corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.nome@neoenergia.com" required />

                <TextField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

                <div className="flex justify-end text-sm">
                  <button
                    type="button"
                    onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotMsg(''); setForgotErro(''); setForgotDemoToken(''); }}
                    className="font-medium text-accent-fg underline-offset-4 transition-colors hover:text-fg hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button type="submit" size="lg" loading={loading} arrow className="w-full">Entrar</Button>

                {/* Modo demonstração (VITE_MOCK) não tem Google: some o divisor e o botão */}
                {!import.meta.env.VITE_MOCK && (<>
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line" />
                  </div>
                  <div className="relative bg-surface-2 px-3 text-xs text-subtle">
                    ou
                  </div>
                </div>

                <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogleLogin} loading={googleLoading} disabled={loading} icon={!googleLoading && (
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
                )}>
                  Entrar com Google
                </Button>
                </>)}
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* TELA 2: CADASTRO COM SENHA */}
          {/* ================================================================ */}
          {mode === 'register' && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">Criar conta</h2>
                <p className="mt-1 text-sm text-muted">
                  Cadastre suas credenciais para submeter e acompanhar projetos elétricos.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <TextField label="Nome completo" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Ex: Carlos Eduardo Mendes" required minLength={3} />

                <TextField label="E-mail corporativo" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="carlos.mendes@neoenergia.com" required />

                <div className="grid grid-cols-2 gap-3">
                  <DsSelect
                    label="Perfil inicial *"
                    value={regRole}
                    onChange={(v) => setRegRole(v as any)}
                    options={[
                      { value: 'projetista', label: 'Projetista' },
                      { value: 'analista', label: 'Analista Neoenergia' },
                      { value: 'admin', label: 'Administrador' },
                    ]}
                  />
                  <TextField label="Departamento" type="text" value={regDepartment} onChange={(e) => setRegDepartment(e.target.value)} placeholder="Projetos Elétricos" required />
                </div>

                <TextField label="Senha" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" required minLength={6} />

                <TextField label="Confirmar senha" type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Repita sua senha" required minLength={6} />

                <Button type="submit" size="lg" loading={loading} arrow className="w-full">Criar conta e entrar</Button>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* TELA 3: ESCOLHA DE PERFIL NO LOGIN GOOGLE (NOVA ESPECIFICAÇÃO)   */}
          {/* ================================================================ */}
          {mode === 'google-profile' && googleData && (
            <div className="rounded-2xl border border-accent/40 bg-surface p-6 shadow-md">
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-info-soft px-3 py-1 text-xs font-semibold text-info-fg border border-info/30 mb-3">
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
                <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">
                  Complete seu cadastro
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Selecione seu perfil de acesso para continuar no Portal de Projetos Elétricos.
                </p>
              </div>

              <form onSubmit={handleGoogleProfileSubmit} className="space-y-4">
                {/* Nome Completo */}
                <TextField label="Nome completo" type="text" value={googleName} onChange={(e) => setGoogleName(e.target.value)} placeholder="Seu nome completo" required minLength={3} />

                {/* E-mail Corporativo (Preenchido e Travado) */}
                <TextField label="E-mail autenticado" type="email" value={googleData.email} disabled hint="E-mail validado pelo provedor Google e vinculado ao Cloud Firestore." />

                {/* Perfil de Acesso — Opções detalhadas conforme especificação */}
                <div>
                  <label className="label-base">
                    Perfil de Acesso <span className="text-danger-fg">*</span>
                  </label>

                  <div className="mt-2 space-y-2.5">
                    {/* Opção 1: Projetista */}
                    <div
                      onClick={() => setSelectedRole('projetista')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        selectedRole === 'projetista'
                          ? 'border-accent bg-accent-soft/70 ring-2 ring-accent/20 shadow-sm'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="profileRole"
                          checked={selectedRole === 'projetista'}
                          onChange={() => setSelectedRole('projetista')}
                          className="mt-1 h-4 w-4 text-accent-fg focus:ring-accent"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-fg">Projetista</span>
                            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success-fg">
                              Acesso Imediato
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
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
                          ? 'border-accent bg-accent-soft/70 ring-2 ring-accent/20 shadow-sm'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="profileRole"
                          checked={selectedRole === 'analista'}
                          onChange={() => setSelectedRole('analista')}
                          className="mt-1 h-4 w-4 text-accent-fg focus:ring-accent"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-fg">Analista</span>
                            <span className="rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-bold text-info-fg">
                              Corpo Técnico
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
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
                          ? 'border-warning bg-warning-soft/70 ring-2 ring-warning/20 shadow-sm'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="profileRole"
                          checked={selectedRole === 'admin'}
                          onChange={() => setSelectedRole('admin')}
                          className="mt-1 h-4 w-4 text-warning-fg focus:ring-warning"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-fg">Administrador</span>
                            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-fg">
                              Requer Homologação
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
                            Gerenciamento de usuários, perfis e configurações administrativas, conforme as permissões autorizadas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departamento */}
                <TextField label="Departamento ou área" type="text" value={googleDepartment} onChange={(e) => setGoogleDepartment(e.target.value)} placeholder="Ex: Projetos Elétricos / Engenharia" required />

                {/* Alerta Contextual Informativo */}
                {selectedRole === 'admin' ? (
                  <div className="rounded-xl border border-info/30 bg-info-soft/80 p-3 text-xs text-info-fg">
                    <div className="flex gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-info-fg mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Acesso ao Portal Liberado:</strong>
                        Seu acesso às funcionalidades de cálculo de demanda, memorial e emissão de atestados está autorizado imediatamente como Projetista.
                      </div>
                    </div>
                  </div>
                ) : selectedRole === 'analista' ? (
                  <div className="rounded-xl border border-info/30 bg-info-soft/80 p-3 text-xs text-info-fg">
                    <div className="flex gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-info-fg mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Perfil de Analista Técnico:</strong>
                        Acesso liberado à fila de análise técnica de projetos e homologação de atestados de viabilidade.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-success/30 bg-success-soft/80 p-3 text-xs text-success-fg">
                    <div className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success-fg mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Liberação Imediata:</strong>
                        Seu perfil de Projetista será ativado instantaneamente para iniciar projetos elétricos, calcular demandas e emitir atestados.
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="pt-2 space-y-2">
                  <Button type="submit" size="lg" loading={loading} arrow className="w-full">Confirmar e entrar</Button>

                  <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} className="w-full" onClick={() => { setMode('login'); setGoogleData(null); setError(''); }}>Voltar ao início</Button>
                </div>
              </form>
            </div>
          )}

          {/* Perfis de teste: um clique preenche e-mail e senha */}
          {mode === 'login' && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-fg-2">Entrar com um perfil de teste</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { email: 'carlos.mendes@neoenergia.com', papel: 'Projetista', quem: 'Carlos Mendes' },
                  { email: 'ana.silva@neoenergia.com', papel: 'Analista', quem: 'Ana Silva' },
                  { email: 'roberto.fonseca@neoenergia.com', papel: 'Administrador', quem: 'Roberto Fonseca' },
                ].map((p) => {
                  const on = email === p.email;
                  return (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => fillDemo(p.email)}
                      className={`rounded-tile px-4 py-3 text-left ring-1 ring-inset transition-[background-color,box-shadow] duration-200 ${
                        on ? 'bg-accent-soft ring-2 ring-focus' : 'bg-raised ring-line hover:bg-surface-3/60'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-fg">{p.papel}</span>
                      <span className="block truncate text-xs text-muted">{p.quem}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

      </AuthShell>

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
          <p className="text-sm text-muted">
            Informe o e-mail corporativo cadastrado. Você receberá um link para cadastrar uma nova senha, válido por 60 minutos.
          </p>
          {forgotMsg ? (
            <>
              <Alert type="success">{forgotMsg}</Alert>
              {forgotDemoToken && (
                <Link
                  to={`/redefinir-senha?token=${encodeURIComponent(forgotDemoToken)}`}
                  className="block text-sm font-medium text-accent-fg underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  Demonstração: abrir o link de redefinição
                </Link>
              )}
            </>
          ) : (
            <TextField label="E-mail corporativo" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu.nome@neoenergia.com" error={forgotErro || undefined} />
          )}
        </div>
      </Modal>
    </>
  );
}
