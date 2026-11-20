import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FolderPlus } from '@/ds/icons';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader, SearchField, Segmented, VazioFiltro, VazioMedidor } from '@/ds';
import { ProjetosTabela } from '@/components/ProjetosTabela';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'rascunho', label: 'Rascunhos' },
  { value: 'enviado_analise', label: 'Enviado para análise' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'reprovado', label: 'Reprovados' },
];

export function MeusProjetosPage() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('status') || 'all';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const myProjects = useMemo(
    () => projects.filter((p) => user?.role === 'admin' || p.projetistaId === user?.id || p.projetistaEmail === user?.email),
    [projects, user],
  );

  const filtered = useMemo(() => {
    return myProjects.filter((p) => {
      const matchesSearch =
        !search ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.data.name.toLowerCase().includes(search.toLowerCase()) ||
        p.data.address.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [myProjects, search, filter]);

  const contagem = (v: string) => (v === 'all' ? myProjects.length : myProjects.filter((p) => p.status === v).length);
  const filtroAtivo = filter !== 'all' ? statusFilters.find((f) => f.value === filter)?.label : search ? `Busca: ${search}` : null;
  const limpar = () => {
    setFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        greeting={`${myProjects.length} ${myProjects.length === 1 ? 'projeto' : 'projetos'}`}
        title="Meus projetos"
        actions={
          <Button icon={<FolderPlus className="h-4 w-4" />} arrow onClick={() => navigate('/app/novo-projeto')}>
            Novo projeto
          </Button>
        }
      />

      <Card padding="lg">
        <div className="mb-5 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <SearchField value={search} onChange={setSearch} placeholder="Buscar por código, nome ou endereço" className="w-full max-w-md 2xl:max-w-sm" />
          <Segmented label="Filtrar por status" size="sm" value={filter} onChange={setFilter} items={statusFilters.map((f) => ({ value: f.value, label: f.label, count: contagem(f.value) }))} />
        </div>

        {myProjects.length === 0 ? (
          <VazioMedidor
            title="Nenhum projeto ainda"
            action={
              <Button arrow onClick={() => navigate('/app/novo-projeto')}>
                Começar memorial
              </Button>
            }
          >
            O primeiro memorial de cargas que você montar aparece aqui, com a demanda já calculada.
          </VazioMedidor>
        ) : filtered.length === 0 && filtroAtivo ? (
          <VazioFiltro
            filtro={filtroAtivo}
            onLimpar={limpar}
            title={filter === 'reprovado' ? 'Nenhum projeto reprovado' : 'Nada com esse filtro'}
            action={
              <Button variant="secondary" size="sm" onClick={limpar}>
                Limpar filtro
              </Button>
            }
          >
            {filter === 'reprovado' ? 'Bom sinal. ' : ''}
            {`Os seus ${myProjects.length} projetos estão nos outros filtros.`}
          </VazioFiltro>
        ) : (
          <ProjetosTabela projetos={filtered} />
        )}
      </Card>
    </div>
  );
}
