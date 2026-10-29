import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Power } from '@/ds/icons';
import { mockTransformers } from '@/data/mockData';
import { transformerService } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/FormFields';
import { ConfirmDialog, PageHeader } from '@/ds';
import { Alert } from '@/components/ui/Alert';
import type { TransformerModel } from '@/types';

export function TransformadoresPage() {
  const [transformers, setTransformers] = useState<TransformerModel[]>(mockTransformers);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TransformerModel | null>(null);

  const fetchTransformers = () => {
    transformerService.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTransformers(data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchTransformers();
  }, []);

  const openCreate = () => {
    setEditing({ id: '', label: '', powerKva: 0, voltage: '13.8kV / 380V', active: true });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await transformerService.update(editing.id, editing);
      } else {
        await transformerService.create(editing);
      }
      fetchTransformers();
    } catch (err) {
      console.error('Erro ao salvar transformador:', err);
    }
    setShowModal(false);
    setEditing(null);
  };

  const toggleActive = async (id: string) => {
    const item = transformers.find((t) => t.id === id);
    if (!item) return;
    const updated = { ...item, active: !item.active };
    try {
      await transformerService.update(id, updated);
      fetchTransformers();
    } catch {
      setTransformers(transformers.map((t) => (t.id === id ? updated : t)));
    }
  };

  const [excluir, setExcluir] = useState<string | null>(null);
  const [erroExcluir, setErroExcluir] = useState('');
  const deleteTransformer = (id: string) => setExcluir(id);
  const confirmarExclusao = async () => {
    if (!excluir) return;
    try {
      await transformerService.delete(excluir);
      setErroExcluir('');
      fetchTransformers();
    } catch (err: any) {
      setErroExcluir(err.message || 'Não foi possível excluir.');
    }
    setExcluir(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader greeting="Administração" title="Transformadores" description="Módulos de transformadores para dimensionamento de subestações (DIS-NOR-053)." actions={<>
<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Novo Transformador</Button>
      </>} />
      {erroExcluir && <Alert type="error">{erroExcluir}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {transformers.map((t) => (
          <Card key={t.id} className={t.active ? '' : 'opacity-50'}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-fg">{t.label}</p>
                <p className="mt-1 text-2xl font-bold text-accent-fg">{t.powerKva} <span className="text-sm font-normal text-muted">kVA</span></p>
                <p className="text-xs text-muted">{t.voltage}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.active ? 'bg-success-soft text-success-fg' : 'bg-surface-2 text-muted'}`}>
                {t.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" icon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => { setEditing({ ...t }); setShowModal(true); }}>
                Editar
              </Button>
              <Button variant="ghost" size="sm" icon={<Power className="h-3.5 w-3.5" />} onClick={() => toggleActive(t.id)}>
                {t.active ? 'Desativar' : 'Ativar'}
              </Button>
              <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => deleteTransformer(t.id)}>
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? 'Editar Transformador' : 'Novo Transformador'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Input label="Nome/Modelo" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="Ex: Transformador 6 — placeholder" />
            <Input label="Potência Nominal (kVA)" type="number" value={editing.powerKva} onChange={(e) => setEditing({ ...editing, powerKva: parseInt(e.target.value) || 0 })} />
            <Input label="Tensão" value={editing.voltage} onChange={(e) => setEditing({ ...editing, voltage: e.target.value })} />
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={!!excluir}
        onClose={() => setExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Excluir este transformador?"
        description="O módulo sai da lista usada no dimensionamento de subestações."
        confirmLabel="Excluir"
        danger
      />
    </div>
  );
}
