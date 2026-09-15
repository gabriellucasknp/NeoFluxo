import { useState } from 'react';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import { mockTransformers } from '@/data/mockData';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/FormFields';
import type { TransformerModel } from '@/types';

export function TransformadoresPage() {
  const [transformers, setTransformers] = useState<TransformerModel[]>(mockTransformers);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TransformerModel | null>(null);

  const openCreate = () => {
    setEditing({ id: '', label: '', powerKva: 0, voltage: '13.8kV / 380V', active: true });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setTransformers(transformers.map((t) => (t.id === editing.id ? editing : t)));
    } else {
      setTransformers([...transformers, { ...editing, id: `t-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const toggleActive = (id: string) => {
    setTransformers(transformers.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  const deleteTransformer = (id: string) => {
    setTransformers(transformers.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transformadores</h1>
          <p className="text-sm text-slate-500">Módulos de transformadores para dimensionamento de subestações (DIS-NOR-053).</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Novo Transformador</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {transformers.map((t) => (
          <Card key={t.id} className={t.active ? '' : 'opacity-50'}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{t.label}</p>
                <p className="mt-1 text-2xl font-bold text-neo-700">{t.powerKva} <span className="text-sm font-normal text-slate-500">kVA</span></p>
                <p className="text-xs text-slate-500">{t.voltage}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.active ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
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
    </div>
  );
}
