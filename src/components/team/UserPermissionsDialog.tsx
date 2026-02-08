import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface UserPermissions {
  client_visibility: 'own' | 'matrix' | 'all';
  client_edit: 'full' | 'no_delete';
  matrix_access: 'create' | 'view' | 'none';
  team_access: 'invite' | 'view' | 'none';
  import_export: 'both' | 'export_only' | 'none';
  settings_access: boolean;
}

interface UserPermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  role: string;
  onSave: (permissions: UserPermissions) => void;
}

const UserPermissionsDialog = ({ isOpen, onClose, userId, role, onSave }: UserPermissionsDialogProps) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    client_visibility: 'own',
    client_edit: 'no_delete',
    matrix_access: 'view',
    team_access: 'view',
    import_export: 'none',
    settings_access: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      fetchDefaultPermissions();
    }
  }, [isOpen, role]);

  const fetchDefaultPermissions = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/b444253a-2d33-4d1d-8e79-57fde40bbc5d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_default_permissions', role }),
      });

      const data = await response.json();
      if (response.ok && data.permissions) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Ошибка загрузки дефолтных прав:', error);
    }
  };

  const handleSave = () => {
    setLoading(true);
    onSave(permissions);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Настройка прав доступа</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Блок 1: Работа с клиентами */}
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">Блок 1. Работа с клиентами</h3>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Видимость клиентов:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="client_visibility"
                      value="own"
                      checked={permissions.client_visibility === 'own'}
                      onChange={(e) => setPermissions({ ...permissions, client_visibility: e.target.value as 'own' })}
                      className="w-4 h-4"
                    />
                    <span>Видит своих клиентов</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="client_visibility"
                      value="matrix"
                      checked={permissions.client_visibility === 'matrix'}
                      onChange={(e) => setPermissions({ ...permissions, client_visibility: e.target.value as 'matrix' })}
                      className="w-4 h-4"
                    />
                    <span>Клиенты привязанные к матрице</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="client_visibility"
                      value="all"
                      checked={permissions.client_visibility === 'all'}
                      onChange={(e) => setPermissions({ ...permissions, client_visibility: e.target.value as 'all' })}
                      className="w-4 h-4"
                    />
                    <span>Все клиенты</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Редактирование клиентов:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="client_edit"
                      value="full"
                      checked={permissions.client_edit === 'full'}
                      onChange={(e) => setPermissions({ ...permissions, client_edit: e.target.value as 'full' })}
                      className="w-4 h-4"
                    />
                    <span>Добавление, изменение, удаление</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="client_edit"
                      value="no_delete"
                      checked={permissions.client_edit === 'no_delete'}
                      onChange={(e) => setPermissions({ ...permissions, client_edit: e.target.value as 'no_delete' })}
                      className="w-4 h-4"
                    />
                    <span>Только добавление и изменение</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Блок 2: Работа с матрицами */}
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">Блок 2. Работа с матрицами</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matrix_access"
                    value="create"
                    checked={permissions.matrix_access === 'create'}
                    onChange={(e) => setPermissions({ ...permissions, matrix_access: e.target.value as 'create' })}
                    className="w-4 h-4"
                  />
                  <span>Может создавать матрицы</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matrix_access"
                    value="view"
                    checked={permissions.matrix_access === 'view'}
                    onChange={(e) => setPermissions({ ...permissions, matrix_access: e.target.value as 'view' })}
                    className="w-4 h-4"
                  />
                  <span>Может просматривать информацию о матрицах</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matrix_access"
                    value="none"
                    checked={permissions.matrix_access === 'none'}
                    onChange={(e) => setPermissions({ ...permissions, matrix_access: e.target.value as 'none' })}
                    className="w-4 h-4"
                  />
                  <span>Доступ к разделу запрещен</span>
                </label>
              </div>
            </div>

            {/* Блок 3: Работа с командой */}
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">Блок 3. Работа с командой</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="team_access"
                    value="invite"
                    checked={permissions.team_access === 'invite'}
                    onChange={(e) => setPermissions({ ...permissions, team_access: e.target.value as 'invite' })}
                    className="w-4 h-4"
                  />
                  <span>Может приглашать участников</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="team_access"
                    value="view"
                    checked={permissions.team_access === 'view'}
                    onChange={(e) => setPermissions({ ...permissions, team_access: e.target.value as 'view' })}
                    className="w-4 h-4"
                  />
                  <span>Может просматривать участников</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="team_access"
                    value="none"
                    checked={permissions.team_access === 'none'}
                    onChange={(e) => setPermissions({ ...permissions, team_access: e.target.value as 'none' })}
                    className="w-4 h-4"
                  />
                  <span>Доступ к разделу запрещен</span>
                </label>
              </div>
            </div>

            {/* Блок 4: Импорт и Экспорт */}
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">Блок 4. Импорт и Экспорт данных</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="import_export"
                    value="both"
                    checked={permissions.import_export === 'both'}
                    onChange={(e) => setPermissions({ ...permissions, import_export: e.target.value as 'both' })}
                    className="w-4 h-4"
                  />
                  <span>Может импортировать и экспортировать данные</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="import_export"
                    value="export_only"
                    checked={permissions.import_export === 'export_only'}
                    onChange={(e) => setPermissions({ ...permissions, import_export: e.target.value as 'export_only' })}
                    className="w-4 h-4"
                  />
                  <span>Может только экспортировать данные</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="import_export"
                    value="none"
                    checked={permissions.import_export === 'none'}
                    onChange={(e) => setPermissions({ ...permissions, import_export: e.target.value as 'none' })}
                    className="w-4 h-4"
                  />
                  <span>Доступ к разделу запрещен</span>
                </label>
              </div>
            </div>

            {/* Блок 5: Системные настройки */}
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-3">Блок 5. Доступ к системным настройкам</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="settings_access"
                    checked={permissions.settings_access === true}
                    onChange={() => setPermissions({ ...permissions, settings_access: true })}
                    className="w-4 h-4"
                  />
                  <span>Может изменять системные настройки</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="settings_access"
                    checked={permissions.settings_access === false}
                    onChange={() => setPermissions({ ...permissions, settings_access: false })}
                    className="w-4 h-4"
                  />
                  <span>Доступ запрещен</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              Сохранить права
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserPermissionsDialog;
