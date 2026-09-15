import { useState } from 'react';
import { Plus, Edit2, Trash2, History } from 'lucide-react';
import { mockNormVersions } from '@/data/mockData';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/FormFields';

interface Regra053 {
  id: string;
  label: string;
  type: string;
  value: string;
  active: boolean;
}

const initialRegras: Regra053[] = [
  { id: 'r1', label: 'Limite para enquadramento em Média Tensão', type: 'enquadramento', value: '75 kW', active: true },
  { id: 'r2', label: 'Fator de simultaneidade para subestação', type: 'simultaneidade', value: '0.9', active: true },
  { id: 'r3', label: 'Reserva de capacidade do transformador', type: 'transformador', value: '20%', active: true },
  { id: 'r4', label: 'Tensão primária padrão', type: 'tensao', value: '13.8 kV', active: true },
  { id: 'r5', label: 'Tensão secundária padrão', type: 'tensao', value: '380 V', active: true },
];

export function DisNor053Page() {
  const [regras, setRegras] = useState<Regra053[]>(initialRegras);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Regra053 | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const openCreate = () => {
    setEditing({ id: '', label: '', type: 'enquadramento', value: '', active: true });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setRegras(regras.map((r) => (r.id === editing.id ? editing : r)));
    } else {
      setRegras([...regras, { ...editing, id: `r-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const deleteRegra = (id: string) => {
    setRegras(regras.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão da DIS-NOR-053</h1>
          <p className="text-sm text-slate-500">Regras de enquadramento, módulos de transformadores e configurações de subestação.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<History className="h-4 w-4" />} onClick={() => setShowHistory(true)}>
            Histórico de Versões
          </Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Nova Regra</Button>
        </div>
      </div>

      <Card className="bg-neo-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neo-600">Versão atual</p>
            <p className="text-lg font-bold text-neo-700">
              {mockNormVersions.find((v) => v.norma === 'DIS-NOR-053')?.version || 'V1.0'}
            </p>
          </div>
          <div className="text-right text-xs text-neo-600">
            <p>Vigente desde: {mockNormVersions.find((v) => v.norma === 'DIS-NOR-053')?.startDate}</p>
            <p>Responsável: {mockNormVersions.find((v) => v.norma === 'DIS-NOR-053')?.responsible}</p>
          </div>
        </div>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-3 font-semibold text-slate-600">Regra</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Tipo</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Valor</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regras.map((r) => (
                <tr key={r.id} className={r.active ? '' : 'opacity-50'}>
                  <td className="px-5 py-3 font-medium text-slate-700">{r.label}</td>
                  <td className="px-5 py-3 capitalize text-slate-600">{r.type}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{r.value}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.active ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                      {r.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing({ ...r }); setShowModal(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteRegra(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-600">
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? 'Editar Regra' : 'Nova Regra DIS-NOR-053'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Input label="Descrição da Regra" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            <Select label="Tipo" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="enquadramento">Enquadramento</option>
              <option value="simultaneidade">Simultaneidade</option>
              <option value="transformador">Transformador</option>
              <option value="tensao">Tensão</option>
              <option value="tecnica">Regra Técnica</option>
            </Select>
            <Input label="Valor" value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
          </div>
        )}
      </Modal>

      <Modal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="Histórico de Versões — DIS-NOR-053"
        footer={<Button variant="outline" onClick={() => setShowHistory(false)}>Fechar</Button>}
      >
        <div className="space-y-3">
          {mockNormVersions.filter((v) => v.norma === 'DIS-NOR-053').map((v) => (
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
        </div>
      </Modal>
    </div>
  );
}
