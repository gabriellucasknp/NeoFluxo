import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/FormFields';
import type { User, UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  projetista: 'Projetista',
  analista: 'Analista Neoenergia',
  admin: 'Administrador / Engenheiro',
};

export function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const openCreate = () => {
    setEditing({ id: '', name: '', email: '', role: 'projetista', department: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setUsers(users.map((u) => (u.id === editing.id ? editing : u)));
    } else {
      setUsers([...users, { ...editing, id: `u-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuários</h1>
          <p className="text-sm text-slate-500">Gestão de usuários e permissões do sistema.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Novo Usuário</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-5 py-3 font-semibold text-slate-600">Nome</th>
                <th className="px-5 py-3 font-semibold text-slate-600">E-mail</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Perfil</th>
                <th className="px-5 py-3 font-semibold text-slate-600">Departamento</th>
                <th className="px-5 py-3 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neo-600 text-xs font-semibold text-white">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-slate-700">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'analista' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.department || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing({ ...u }); setShowModal(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger-600">
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
        title={editing?.id ? 'Editar Usuário' : 'Novo Usuário'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Input label="Nome" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input label="E-mail" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            <Select label="Perfil" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })}>
              <option value="projetista">Projetista</option>
              <option value="analista">Analista Neoenergia</option>
              <option value="admin">Administrador / Engenheiro</option>
            </Select>
            <Input label="Departamento" value={editing.department || ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
