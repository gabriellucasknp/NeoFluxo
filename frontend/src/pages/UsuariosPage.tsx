import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from '@/ds/icons';
import { mockUsers } from '@/data/mockData';
import { userService } from '@/services/api';
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

  const fetchUsers = () => {
    userService.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditing({ id: '', name: '', email: '', role: 'projetista', department: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await userService.update(editing.id, editing);
      } else {
        await userService.create(editing);
      }
      fetchUsers();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
    setShowModal(false);
    setEditing(null);
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja desativar/excluir este usuário?')) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg">Usuários</h1>
          <p className="text-sm text-muted">Gestão de usuários e permissões do sistema.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Novo Usuário</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2/50">
                <th className="px-5 py-3 font-semibold text-muted">Nome</th>
                <th className="px-5 py-3 font-semibold text-muted">E-mail</th>
                <th className="px-5 py-3 font-semibold text-muted">Perfil</th>
                <th className="px-5 py-3 font-semibold text-muted">Departamento</th>
                <th className="px-5 py-3 font-semibold text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-medium text-fg-2">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.role === 'admin' ? 'bg-accent-soft text-accent-fg' :
                      u.role === 'analista' ? 'bg-info-soft text-info-fg' :
                      'bg-surface-2 text-muted'
                    }`}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{u.department || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing({ ...u }); setShowModal(true); }} className="rounded-lg p-1.5 text-subtle hover:bg-surface-2 hover:text-muted">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="rounded-lg p-1.5 text-subtle hover:bg-danger-soft hover:text-danger-fg">
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
