import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface UserPermissions {
  client_visibility: 'own' | 'matrix' | 'all';
  client_edit: 'full' | 'no_delete';
  matrix_access: 'create' | 'view' | 'none';
  team_access: 'invite' | 'view' | 'none';
  import_export: 'both' | 'export_only' | 'none';
  settings_access: boolean;
}

interface UserPermissionsSectionProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const UserPermissionsSection = ({ onError, onSuccess }: UserPermissionsSectionProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Record<number, UserPermissions>>({});
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [editForms, setEditForms] = useState<Record<number, UserPermissions>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };
    loadUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/369fdc8c-fb5b-4b02-bb8f-ef5d8da3de3e', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const filteredUsers = (data.users || []).filter((u: User) => u.role !== 'owner');
        setUsers(filteredUsers);
        
        filteredUsers.forEach((user: User) => {
          fetchUserPermissions(user.id);
        });
      }
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
    }
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/b444253a-2d33-4d1d-8e79-57fde40bbc5d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get_permissions', user_id: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.permissions) {
          setPermissions(prev => ({ ...prev, [userId]: data.permissions }));
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки прав:', err);
    }
  };

  const handleUpdatePermissions = async (userId: number, newPermissions: UserPermissions) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/b444253a-2d33-4d1d-8e79-57fde40bbc5d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_permissions',
          user_id: userId,
          ...newPermissions,
        }),
      });

      if (response.ok) {
        setPermissions(prev => ({ ...prev, [userId]: newPermissions }));
        onSuccess('Права доступа обновлены');
        setExpandedUser(null);
      } else {
        onError('Ошибка обновления прав');
      }
    } catch (err) {
      onError('Ошибка обновления прав');
    } finally {
      setLoading(false);
    }
  };

  const renderPermissionBadges = (perms: UserPermissions) => {
    const badges = [];
    
    if (perms.client_visibility === 'all') badges.push('Все клиенты');
    else if (perms.client_visibility === 'matrix') badges.push('Клиенты по матрице');
    else badges.push('Только свои клиенты');

    if (perms.matrix_access === 'create') badges.push('Создание матриц');
    else if (perms.matrix_access === 'view') badges.push('Просмотр матриц');

    if (perms.team_access === 'invite') badges.push('Управление командой');
    else if (perms.team_access === 'view') badges.push('Просмотр команды');

    if (perms.import_export === 'both') badges.push('Импорт/Экспорт');
    else if (perms.import_export === 'export_only') badges.push('Только экспорт');

    if (perms.settings_access) badges.push('Системные настройки');

    return badges;
  };

  const renderPermissionForm = (userId: number) => {
    const formData = editForms[userId] || permissions[userId];
    const setFormData = (data: UserPermissions) => {
      setEditForms(prev => ({ ...prev, [userId]: data }));
    };

    return (
      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-6">
        <div>
          <h4 className="font-medium mb-3">Работа с клиентами</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`visibility-${userId}`}
                checked={formData.client_visibility === 'own'}
                onChange={() => setFormData({ ...formData, client_visibility: 'own' })}
                className="accent-primary"
              />
              Только свои клиенты
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`visibility-${userId}`}
                checked={formData.client_visibility === 'matrix'}
                onChange={() => setFormData({ ...formData, client_visibility: 'matrix' })}
                className="accent-primary"
              />
              Клиенты по своей матрице
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`visibility-${userId}`}
                checked={formData.client_visibility === 'all'}
                onChange={() => setFormData({ ...formData, client_visibility: 'all' })}
                className="accent-primary"
              />
              Все клиенты организации
            </label>
          </div>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`edit-${userId}`}
                checked={formData.client_edit === 'full'}
                onChange={() => setFormData({ ...formData, client_edit: 'full' })}
                className="accent-primary"
              />
              Полные права редактирования
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`edit-${userId}`}
                checked={formData.client_edit === 'no_delete'}
                onChange={() => setFormData({ ...formData, client_edit: 'no_delete' })}
                className="accent-primary"
              />
              Редактирование без удаления
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Матрицы</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`matrix-${userId}`}
                checked={formData.matrix_access === 'create'}
                onChange={() => setFormData({ ...formData, matrix_access: 'create' })}
                className="accent-primary"
              />
              Создание и редактирование
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`matrix-${userId}`}
                checked={formData.matrix_access === 'view'}
                onChange={() => setFormData({ ...formData, matrix_access: 'view' })}
                className="accent-primary"
              />
              Только просмотр
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`matrix-${userId}`}
                checked={formData.matrix_access === 'none'}
                onChange={() => setFormData({ ...formData, matrix_access: 'none' })}
                className="accent-primary"
              />
              Нет доступа
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Команда</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`team-${userId}`}
                checked={formData.team_access === 'invite'}
                onChange={() => setFormData({ ...formData, team_access: 'invite' })}
                className="accent-primary"
              />
              Приглашение пользователей
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`team-${userId}`}
                checked={formData.team_access === 'view'}
                onChange={() => setFormData({ ...formData, team_access: 'view' })}
                className="accent-primary"
              />
              Только просмотр
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`team-${userId}`}
                checked={formData.team_access === 'none'}
                onChange={() => setFormData({ ...formData, team_access: 'none' })}
                className="accent-primary"
              />
              Нет доступа
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Импорт / Экспорт</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`import-${userId}`}
                checked={formData.import_export === 'both'}
                onChange={() => setFormData({ ...formData, import_export: 'both' })}
                className="accent-primary"
              />
              Импорт и экспорт
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`import-${userId}`}
                checked={formData.import_export === 'export_only'}
                onChange={() => setFormData({ ...formData, import_export: 'export_only' })}
                className="accent-primary"
              />
              Только экспорт
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`import-${userId}`}
                checked={formData.import_export === 'none'}
                onChange={() => setFormData({ ...formData, import_export: 'none' })}
                className="accent-primary"
              />
              Нет доступа
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Системные настройки</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`settings-${userId}`}
                checked={formData.settings_access === true}
                onChange={() => setFormData({ ...formData, settings_access: true })}
                className="accent-primary"
              />
              Доступ разрешён
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`settings-${userId}`}
                checked={formData.settings_access === false}
                onChange={() => setFormData({ ...formData, settings_access: false })}
                className="accent-primary"
              />
              Доступ запрещён
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleUpdatePermissions(userId, formData)}
            disabled={loading}
            className="gradient-primary"
          >
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button
            variant="ghost"
            onClick={() => setExpandedUser(null)}
            disabled={loading}
          >
            Отмена
          </Button>
        </div>
      </div>
    );
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Админ',
      manager: 'Менеджер',
      department_head: 'Руководитель отдела',
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
          <Icon name="Shield" size={24} />
          Права доступа
        </h2>
        <p className="text-sm text-muted-foreground">
          Настройте права доступа для каждого пользователя
        </p>
      </div>

      <div className="space-y-3">
        {users.map(user => {
          const userPerms = permissions[user.id];
          const isExpanded = expandedUser === user.id;

          return (
            <div key={user.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                  </div>

                  {userPerms && !isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {renderPermissionBadges(userPerms).map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {isExpanded && userPerms && renderPermissionForm(user.id)}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
                </Button>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
            <p>Нет пользователей для настройки прав</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserPermissionsSection;