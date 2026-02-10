import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface CurrentUser {
  id: number;
  role: string;
  organization_name: string;
}

const Team = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    role: 'manager'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    fetchUsers(token);
  }, [navigate]);

  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/369fdc8c-fb5b-4b02-bb8f-ef5d8da3de3e', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setError('');
    setSuccess('');

    if (!formData.username || !formData.full_name) {
      setError('Заполните все поля');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/9f41e955-72a6-447c-aaae-4b5ea1b0c30a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
          auto_password: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания пользователя');
      }

      setCreatedCredentials({
        username: data.user.username,
        password: data.user.password
      });
      setSuccess('Пользователь создан!');
      setFormData({ username: '', full_name: '', role: 'manager' });
      fetchUsers(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;

    const text = `Логин: ${createdCredentials.username}\nПароль: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setSuccess('Данные скопированы в буфер обмена!');
    setTimeout(() => {
      setCreatedCredentials(null);
      setShowCreateModal(false);
    }, 1500);
  };

  const handleUpdateUser = async (userId: number, updates: { role?: string; is_active?: boolean }) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/369fdc8c-fb5b-4b02-bb8f-ef5d8da3de3e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update',
          user_id: userId,
          ...updates
        })
      });

      if (response.ok) {
        setSuccess('Пользователь обновлён');
        fetchUsers(token);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-primary/10 text-primary border-primary/20',
      admin: 'bg-secondary/10 text-secondary border-secondary/20',
      manager: 'bg-accent/10 text-accent border-accent/20',
      department_head: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      viewer: 'bg-muted text-muted-foreground border-border'
    };
    const labels = {
      owner: 'Владелец',
      admin: 'Админ',
      manager: 'Менеджер',
      department_head: 'Руководитель отдела',
      viewer: 'Наблюдатель'
    };
    return <Badge className={colors[role as keyof typeof colors] || colors.viewer}>{labels[role as keyof typeof labels] || role}</Badge>;
  };

  const canManage = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">Команда</h1>
          </div>
          {canManage && (
            <Button className="gradient-primary text-sm sm:text-base" onClick={() => setShowCreateModal(true)}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              <span className="hidden sm:inline">Создать пользователя</span>
              <span className="sm:hidden">Создать</span>
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-accent flex-shrink-0" />
            <p className="text-sm text-accent">{success}</p>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <Card className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Пользователи ({users.length})</h2>

            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-base sm:text-lg font-bold text-white">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">{user.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                    {getRoleBadge(user.role)}
                    {!user.is_active && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                        Отключён
                      </Badge>
                    )}
                    {canManage && user.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                      >
                        <Icon name={user.is_active ? 'UserX' : 'UserCheck'} size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Создать пользователя</h3>

            {createdCredentials ? (
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">Данные для входа:</p>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Логин:</span>
                      <p className="font-mono font-semibold">{createdCredentials.username}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Пароль:</span>
                      <p className="font-mono font-semibold">{createdCredentials.password}</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600">⚠️ Сохраните эти данные! Они больше не будут показаны.</p>
                </div>

                <Button
                  className="w-full gradient-primary"
                  onClick={handleCopyCredentials}
                >
                  <Icon name="Copy" size={16} className="mr-2" />
                  Скопировать данные
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Логин</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ivan_manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Полное имя</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Роль</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="manager">Менеджер</option>
                      <option value="department_head">Руководитель отдела</option>
                      <option value="admin">Админ</option>
                      <option value="viewer">Наблюдатель</option>
                    </select>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <Icon name="Info" size={14} className="inline mr-1" />
                      Пароль будет сгенерирован автоматически
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ username: '', full_name: '', role: 'manager' });
                      setError('');
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    className="flex-1 gradient-primary"
                    onClick={handleCreateUser}
                  >
                    Создать
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Team;
