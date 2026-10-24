import { useNavigate } from 'react-router-dom';
import { FolderPlus, FolderOpen, Clock, CheckCircle2, XCircle } from '@/ds/icons';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader, SectionHeader, StatCard, VazioMedidor } from '@/ds';
import { ProjetosTabela } from '@/components/ProjetosTabela';

export function DashboardPage() {
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const myProjects = projects.filter((p) => p.projetistaId === user?.id);

  const counts = {
    andamento: myProjects.filter((p) => p.status === 'rascunho' || p.status === 'enviado_analise' || p.status === 'em_analise').length,
    aguardando: myProjects.filter((p) => p.status === 'enviado_analise').length,
    aprovados: myProjects.filter((p) => p.status === 'aprovado').length,
    reprovados: myProjects.filter((p) => p.status === 'reprovado').length,
  };

  const recentProjects = [...myProjects].slice(0, 5);

  const primeiroNome = user?.name.split(' ')[0];

  return (
    <div className="space-y-8">
      <PageHeader
        greeting={`Olá, ${primeiroNome}`}
        title="Seus projetos"
        actions={
          <Button icon={<FolderPlus className="h-4 w-4" />} arrow onClick={() => navigate('/app/novo-projeto')}>
            Novo projeto
          </Button>
        }
      />

      {/* cards de número (refs 3, 8, 10): o primeiro destacado; o ↗ abre a lista já filtrada */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Em andamento" value={counts.andamento} highlight icon={<FolderOpen className="h-5 w-5" />} onOpen={() => navigate('/app/meus-projetos')} />
        <StatCard label="Aguardando análise" value={counts.aguardando} icon={<Clock className="h-5 w-5" />} onOpen={() => navigate('/app/meus-projetos?status=enviado_analise')} />
        <StatCard label="Aprovados" value={counts.aprovados} icon={<CheckCircle2 className="h-5 w-5" />} onOpen={() => navigate('/app/meus-projetos?status=aprovado')} />
        <StatCard label="Reprovados" value={counts.reprovados} icon={<XCircle className="h-5 w-5" />} onOpen={() => navigate('/app/meus-projetos?status=reprovado')} />
      </div>

      <Card padding="lg">
        <SectionHeader
          title="Projetos recentes"
          subtitle="Os cinco últimos que você criou"
          actions={
            recentProjects.length > 0 && (
              <Button variant="ghost" size="sm" arrow onClick={() => navigate('/app/meus-projetos')}>
                Ver todos
              </Button>
            )
          }
        />
        <div className="mt-5">
          {recentProjects.length === 0 ? (
            <VazioMedidor
              title="Seu primeiro memorial começa aqui"
              action={
                <Button arrow onClick={() => navigate('/app/novo-projeto')}>
                  Começar memorial
                </Button>
              }
            >
              Monte as cargas, e a demanda e o enquadramento saem sozinhos, na hora.
            </VazioMedidor>
          ) : (
            <ProjetosTabela projetos={recentProjects} compacta />
          )}
        </div>
      </Card>
    </div>
  );
}
