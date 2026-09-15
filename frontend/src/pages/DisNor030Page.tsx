import { useState } from 'react';
import { Plus, Edit2, Trash2, Power, History } from 'lucide-react';
import { mockDemandFactors, mockNormVersions } from '@/data/mockData';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import type { DemandFactor } from '@/types';

export function DisNor030Page() {
  const [factors, setFactors] = useState<DemandFactor[]>(mockDemandFactors);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DemandFactor | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const openCreate = () => {
    setEditing({ id: '', category: 'iluminacao', label: '', minPower: 0, maxPower: 0, factor: 1.0, active: true });
    setShowModal(true);
  };

  const openEdit = (f: DemandFactor) => {
    setEditing({ ...f });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setFactors(factors.map((f) => (f.id === editing.id ? editing : f)));
    } else {
      setFactors([...factors, { ...editing, id: `df-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const toggleActive = (id: string) => {
    setFactors(factors.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  };

  const deleteFactor = (id: string) => {
    setFactors(factors.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão da DIS-NOR-030</h1>
          <p className="text-sm text-slate-500">Tabelas de fatores de demanda e regras de cálculo.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<History className="h-4 w-4" />} onClick={() => setShowHistory(true)}>
            Histórico de Versões
          </Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Novo Fator
          </Button>
        </div>
      </div>

      {/* Version info */}
      <Card className="bg-neo-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neo-600">Versão atual</p>
            <p className="text-lg font-bold text-neo-700">
              {mockNormVersions.find((v) => v.norma === 'DIS-NOR-030')?.version || 'V1.0'}
            </p>
          </div>
          <div className="text-right text-xs text-neo-600">
            <p>Vigente desde: {mockNormVersions.find((v) => v.norma === 'DIS-NOR-030')?.startDate}</p>
            <p>Responsável: {mockNormVersions.find((v) => v.norma === 'DIS-NOR-030')?.responsible}</p>
          </div>
        </div>
      </Card>

      {/* Factors table */}
      <Card padding="none">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-3 font-semibold text-slate-600">Categoria</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Descrição</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Pot. Mín (W)</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Pot. Máx (W)</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Fator</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factors.map((f) => (
                <tr key={f.id} className={f.active ? '' : 'opacity-50'}>
                  <td className="px-5 py-3 capitalize text-slate-600">{f.category.replace('_', ' ')}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">{f.label}</td>
                  <td className="px-5 py-3 text-slate-600">{f.minPower}</td>
                  <td className="px-5 py-3 text-slate-600">{f.maxPower === 0 ? '∞' : f.maxPower}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{(f.factor * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${f.active ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                      {f.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(f)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggleActive(f.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600" title="Ativar/Desativar">
                        <Power className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteFactor(f.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-600" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit/Create modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? 'Editar Fator' : 'Novo Fator de Demanda'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Select
              label="Categoria"
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            >
              <option value="iluminacao">Iluminação</option>
              <option value="tug">TUG</option>
              <option value="tue">TUE</option>
              <option value="elevador">Elevador</option>
              <option value="bomba">Bomba</option>
              <option value="motor">Motor</option>
              <option value="seguranca">Segurança</option>
              <option value="iluminacao_comum">Iluminação Comum</option>
              <option value="outros">Outros</option>
            </Select>
            <Input
              label="Descrição"
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Potência Mínima (W)"
                type="number"
                value={editing.minPower}
                onChange={(e) => setEditing({ ...editing, minPower: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Potência Máxima (W) (0 = sem limite)"
                type="number"
                value={editing.maxPower}
                onChange={(e) => setEditing({ ...editing, maxPower: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Input
              label="Fator de Demanda (0 a 1)"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={editing.factor}
              onChange={(e) => setEditing({ ...editing, factor: parseFloat(e.target.value) || 1 })}
            />
          </div>
        )}
      </Modal>

      {/* History modal */}
      <Modal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="Histórico de Versões — DIS-NOR-030"
        footer={<Button variant="outline" onClick={() => setShowHistory(false)}>Fechar</Button>}
      >
        <div className="space-y-3">
          {mockNormVersions.filter((v) => v.norma === 'DIS-NOR-030').map((v) => (
            <div key={v.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{v.version}</p>
                  <p className="text-xs text-slate-500">Início: {v.startDate} · Atualizada: {v.updatedAt}</p>
                  <p className="text-xs text-slate-500">Responsável: {v.responsible}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${v.active ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                  {v.active ? 'Vigente' : 'Histórica'}
                </span>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
            <Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>Criar Nova Versão</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
