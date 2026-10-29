import { BrowserRouter, Routes, Route, Navigate, type RouteProps } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ProjectProvider } from '@/hooks/useProjects';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RedefinirSenhaPage } from '@/pages/RedefinirSenhaPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NovoProjetoPage } from '@/pages/NovoProjetoPage';
import { MeusProjetosPage } from '@/pages/MeusProjetosPage';
import { ProjetoDetailPage } from '@/pages/ProjetoDetailPage';
import { ValidarAtestadoPage } from '@/pages/ValidarAtestadoPage';
import { AnalistaDashboardPage } from '@/pages/AnalistaDashboardPage';
import { AnaliseListPage } from '@/pages/AnaliseListPage';
import { AnaliseDetailPage } from '@/pages/AnaliseDetailPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { DisNor030Page } from '@/pages/DisNor030Page';
import { DisNor053Page } from '@/pages/DisNor053Page';
import { TransformadoresPage } from '@/pages/TransformadoresPage';
import { UsuariosPage } from '@/pages/UsuariosPage';
import { LogsPage } from '@/pages/LogsPage';
import { ConfiguracoesPage } from '@/pages/ConfiguracoesPage';
import { DesignSystemPage } from '@/pages/design-system/DesignSystemPage';
import type { UserRole } from '@/types';

// Aviso do modo demonstração: só carrega no build com VITE_MOCK=1
const DemoBanner = import.meta.env.VITE_MOCK
  ? lazy(() => import('@/components/DemoBanner').then((m) => ({ default: m.DemoBanner })))
  : null;

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  if (loading) return null; // espera o useAuth restaurar a sessão antes de mandar pro login (F5)
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'analista' ? '/app/analise' : user.role === 'admin' ? '/app/admin/dashboard' : '/app/dashboard';
    return <Navigate to={fallback} replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
      <Route path="/validar" element={<ValidarAtestadoPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />
      <Route
        path="/app/dashboard"
        element={
          user?.role === 'analista' ? (
            <Navigate to="/app/analise" replace />
          ) : (
            <ProtectedRoute roles={['projetista', 'admin']}><DashboardPage /></ProtectedRoute>
          )
        }
      />
      <Route path="/app/novo-projeto" element={<ProtectedRoute roles={['projetista', 'admin']}><NovoProjetoPage /></ProtectedRoute>} />
      <Route path="/app/meus-projetos" element={<ProtectedRoute roles={['projetista', 'admin']}><MeusProjetosPage /></ProtectedRoute>} />
      <Route path="/app/projeto/:id" element={<ProtectedRoute><ProjetoDetailPage /></ProtectedRoute>} />
      <Route path="/app/analise" element={<ProtectedRoute roles={['analista', 'admin']}><AnaliseListPage /></ProtectedRoute>} />
      <Route path="/app/analise/dashboard" element={<ProtectedRoute roles={['analista', 'admin']}><AnaliseListPage /></ProtectedRoute>} />
      <Route path="/app/analise/:id" element={<ProtectedRoute roles={['analista', 'admin']}><AnaliseDetailPage /></ProtectedRoute>} />
      <Route path="/app/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/app/admin/dis-nor-030" element={<ProtectedRoute roles={['admin']}><DisNor030Page /></ProtectedRoute>} />
      <Route path="/app/admin/dis-nor-053" element={<ProtectedRoute roles={['admin']}><DisNor053Page /></ProtectedRoute>} />
      <Route path="/app/admin/transformadores" element={<ProtectedRoute roles={['admin']}><TransformadoresPage /></ProtectedRoute>} />
      <Route path="/app/admin/usuarios" element={<ProtectedRoute roles={['admin']}><UsuariosPage /></ProtectedRoute>} />
      <Route path="/app/admin/logs" element={<ProtectedRoute roles={['admin']}><LogsPage /></ProtectedRoute>} />
      <Route path="/app/admin/configuracoes" element={<ProtectedRoute roles={['admin']}><ConfiguracoesPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <BrowserRouter>
          <AppRoutes />
          {DemoBanner && <Suspense fallback={null}><DemoBanner /></Suspense>}
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
