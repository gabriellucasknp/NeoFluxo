import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from '@/ds/icons';
import { AuthShell } from '@/components/AuthShell';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/api';
import { PasswordField } from '@/ds';

// mesma política do cadastro (LoginPage e RegisterRequest no back): mínimo de 6 caracteres
const SENHA_MINIMA = 6;
const ESPERA_REDIRECIONAR_MS = 3000;

/**
 * US-02: tela aberta pelo link do e-mail (/redefinir-senha?token=...).
 * O token vale 60 minutos e é de uso único; quem decide é o back (POST /auth/reset-password).
 */
export function RedefinirSenhaPage() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmacao, setErroConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const irParaLogin = () => navigate('/', { replace: true, state: { senhaRedefinida: sucesso } });

  // depois do sucesso, leva pro login sozinho
  useEffect(() => {
    if (!sucesso) return;
    const t = window.setTimeout(() => navigate('/', { replace: true, state: { senhaRedefinida: true } }), ESPERA_REDIRECIONAR_MS);
    return () => window.clearTimeout(t);
  }, [sucesso, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const eSenha = senha.length < SENHA_MINIMA ? `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.` : '';
    const eConfirmacao = !eSenha && senha !== confirmacao ? 'As senhas digitadas não coincidem.' : '';
    setErroSenha(eSenha);
    setErroConfirmacao(eConfirmacao);
    if (eSenha || eConfirmacao) return;

    setLoading(true);
    try {
      await authService.resetPassword(token, senha);
      setSucesso(true);
    } catch (err) {
      setErro((err as Error)?.message || 'Não foi possível redefinir a senha. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">Redefinir senha</h2>
        <p className="mt-1 text-sm text-muted">Crie uma nova senha para voltar a acessar seus projetos.</p>
      </div>

      {!token ? (
        <div className="space-y-4">
          <Alert type="error">
            Link de redefinição inválido. Solicite um novo em "Esqueci minha senha", na tela de login.
          </Alert>
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} className="w-full" onClick={irParaLogin}>
            Voltar ao login
          </Button>
        </div>
      ) : sucesso ? (
        <div className="space-y-4">
          <Alert type="success" title="Senha redefinida com sucesso">
            Levando você para o login. Entre com a nova senha.
          </Alert>
          <Button size="lg" arrow className="w-full" onClick={irParaLogin}>
            Ir para o login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {erro && <Alert type="error">{erro}</Alert>}

          <PasswordField
            label="Nova senha"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErroSenha(''); }}
            placeholder={`Mínimo de ${SENHA_MINIMA} caracteres`}
            hint={`Use pelo menos ${SENHA_MINIMA} caracteres.`}
            error={erroSenha || undefined}
            autoComplete="new-password"
            autoFocus
            required
          />

          <PasswordField
            label="Confirmar nova senha"
            value={confirmacao}
            onChange={(e) => { setConfirmacao(e.target.value); setErroConfirmacao(''); }}
            placeholder="Repita a nova senha"
            error={erroConfirmacao || undefined}
            autoComplete="new-password"
            required
          />

          <Button type="submit" size="lg" loading={loading} arrow className="w-full">Redefinir senha</Button>

          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} className="w-full" onClick={irParaLogin}>
            Voltar ao login
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
