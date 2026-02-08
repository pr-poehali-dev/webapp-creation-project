import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  organization_id: number;
  organization_name: string;
}

interface UserPermissions {
  client_visibility: string;
  client_edit: string;
  matrix_access: string;
  team_access: string;
  import_export: string;
  settings_access: boolean;
}

interface Stats {
  total_clients: number;
  total_matrices: number;
  focus_clients: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [stats, setStats] = useState<Stats>({ total_clients: 0, total_matrices: 0, focus_clients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchPermissions(token);
    fetchStats();
  }, [navigate]);

  const fetchPermissions = async (token: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/b444253a-2d33-4d1d-8e79-57fde40bbc5d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get_permissions' }),
      });

      const data = await response.json();
      if (response.ok && data.permissions) {
        setPermissions(data.permissions);
        localStorage.setItem('permissions', JSON.stringify(data.permissions));
      }
    } catch (error) {
      console.error('Ошибка загрузки прав:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [clientsRes, matricesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/9347d703-acfe-4def-a4ae-a4a52329c037', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'list' }),
        }),
        fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'list' }),
        })
      ]);

      const clientsData = await clientsRes.json();
      const matricesData = await matricesRes.json();

      const totalClients = clientsData.clients?.length || 0;
      const focusClients = clientsData.clients?.filter((c: { quadrant: string }) => c.quadrant === 'focus').length || 0;
      const totalMatrices = matricesData.matrices?.length || 0;

      setStats({
        total_clients: totalClients,
        total_matrices: totalMatrices,
        focus_clients: focusClients
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Icon name="Zap" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">TechSale CRM</h1>
                <p className="text-xs text-muted-foreground">{user.organization_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate('/dashboard')}
            >
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              Дашборд
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/clients')}
            >
              <Icon name="Building2" size={16} className="mr-2" />
              Клиенты
            </Button>
            {permissions?.matrix_access !== 'none' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/matrices')}
              >
                <Icon name="Grid3x3" size={16} className="mr-2" />
                Матрицы
              </Button>
            )}
            {permissions?.team_access !== 'none' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/team')}
              >
                <Icon name="Users" size={16} className="mr-2" />
                Команда
              </Button>
            )}
            {permissions?.import_export !== 'none' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/export')}
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт
              </Button>
            )}
            {permissions?.import_export === 'both' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/import')}
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Импорт
              </Button>
            )}
            {permissions?.settings_access && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Добро пожаловать, {user.full_name}!</h2>
            <p className="text-muted-foreground">
              Вы успешно вошли в систему TechSale CRM
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card 
              className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer hover:scale-105 transition-all"
              onClick={() => navigate('/clients')}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="Building2" size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Клиенты</h3>
              <p className="text-3xl font-bold mb-1">{loading ? '...' : stats.total_clients}</p>
              <p className="text-sm text-muted-foreground">
                {stats.total_clients === 0 ? 'Добавьте первого клиента' : 'Всего клиентов'}
              </p>
            </Card>

            <Card 
              className="p-6 border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent cursor-pointer hover:scale-105 transition-all"
              onClick={() => navigate('/matrices')}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Icon name="Grid3x3" size={24} className="text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Матрицы</h3>
              <p className="text-3xl font-bold mb-1">{loading ? '...' : stats.total_matrices}</p>
              <p className="text-sm text-muted-foreground">
                {stats.total_matrices === 0 ? 'Создайте первую матрицу' : 'Всего матриц'}
              </p>
            </Card>

            <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Icon name="Target" size={24} className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">В фокусе</h3>
              <p className="text-3xl font-bold mb-1">{loading ? '...' : stats.focus_clients}</p>
              <p className="text-sm text-muted-foreground">
                {stats.focus_clients === 0 ? 'Нет клиентов в фокусе' : 'Клиентов требует внимания'}
              </p>
            </Card>
          </div>

          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon name="Lightbulb" size={32} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Следующие шаги</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 cursor-pointer hover:opacity-80" onClick={() => navigate('/matrices')}>
                    <Icon name="CheckCircle" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Создайте матрицу приоритизации</p>
                      <p className="text-sm text-muted-foreground">Настройте критерии оценки клиентов</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 cursor-pointer hover:opacity-80" onClick={() => navigate('/clients')}>
                    <Icon name="CheckCircle" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Добавьте первых клиентов</p>
                      <p className="text-sm text-muted-foreground">Начните заполнять базу контактов</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 cursor-pointer hover:opacity-80" onClick={() => navigate('/team')}>
                    <Icon name="CheckCircle" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-muted-foreground">Пригласите команду</p>
                      <p className="text-sm text-muted-foreground">Добавьте коллег для совместной работы</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;