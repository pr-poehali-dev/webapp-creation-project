import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import AppLayout from '@/components/layout/AppLayout';

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

interface NavTile {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  gradient: string;
  route: string;
  count?: number;
  permission?: (p: UserPermissions) => boolean;
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
      const userData = localStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      
      if (parsedUser && (parsedUser.role === 'owner' || parsedUser.role === 'admin')) {
        const adminPermissions = {
          client_visibility: 'all',
          client_edit: 'full',
          matrix_access: 'create',
          team_access: 'invite',
          import_export: 'both',
          settings_access: true
        };
        setPermissions(adminPermissions);
        localStorage.setItem('permissions', JSON.stringify(adminPermissions));
        return;
      }
      
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

  if (!user || !permissions) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const navTiles: NavTile[] = [
    {
      id: 'clients',
      title: 'Клиенты',
      description: 'Управление клиентской базой',
      icon: 'Building2',
      iconColor: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-600/30 hover:from-blue-500/30 hover:to-blue-600/40',
      route: '/clients',
      count: stats.total_clients,
    },
    {
      id: 'matrices',
      title: 'Матрицы',
      description: 'Матрицы оценки клиентов',
      icon: 'Grid3x3',
      iconColor: 'text-purple-500',
      gradient: 'from-purple-500/20 to-purple-600/30 hover:from-purple-500/30 hover:to-purple-600/40',
      route: '/matrices',
      count: stats.total_matrices,
      permission: (p) => p.matrix_access !== 'none',
    },
    {
      id: 'focus',
      title: 'В Фокусе',
      description: 'Приоритетные клиенты',
      icon: 'Zap',
      iconColor: 'text-green-500',
      gradient: 'from-green-500/20 to-green-600/30 hover:from-green-500/30 hover:to-green-600/40',
      route: '/clients?filter=focus',
      count: stats.focus_clients,
    },
    {
      id: 'team',
      title: 'Команда',
      description: 'Управление пользователями',
      icon: 'Users',
      iconColor: 'text-orange-500',
      gradient: 'from-orange-500/20 to-orange-600/30 hover:from-orange-500/30 hover:to-orange-600/40',
      route: '/team',
      permission: (p) => p.team_access !== 'none',
    },
    {
      id: 'export',
      title: 'Экспорт',
      description: 'Выгрузка данных',
      icon: 'Download',
      iconColor: 'text-cyan-500',
      gradient: 'from-cyan-500/20 to-cyan-600/30 hover:from-cyan-500/30 hover:to-cyan-600/40',
      route: '/export',
      permission: (p) => p.import_export !== 'none',
    },
    {
      id: 'import',
      title: 'Импорт',
      description: 'Загрузка данных',
      icon: 'Upload',
      iconColor: 'text-indigo-500',
      gradient: 'from-indigo-500/20 to-indigo-600/30 hover:from-indigo-500/30 hover:to-indigo-600/40',
      route: '/import',
      permission: (p) => p.import_export === 'both',
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Конфигурация системы',
      icon: 'Settings',
      iconColor: 'text-gray-500',
      gradient: 'from-gray-500/20 to-gray-600/30 hover:from-gray-500/30 hover:to-gray-600/40',
      route: '/settings',
      permission: (p) => p.settings_access === true,
    },
  ];

  const visibleTiles = navTiles.filter(tile => 
    !tile.permission || tile.permission(permissions)
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
              Добро пожаловать, {user.full_name}!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Выберите раздел для работы
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {visibleTiles.map((tile) => (
              <Card
                key={tile.id}
                className={`p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${tile.gradient} border-2 active:scale-95`}
                onClick={() => navigate(tile.route)}
              >
                <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${tile.iconColor} bg-background/50 flex items-center justify-center backdrop-blur-sm`}>
                    <Icon name={tile.icon} size={window.innerWidth < 640 ? 24 : 32} className={tile.iconColor} />
                  </div>
                  
                  {tile.count !== undefined && (
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                      {loading ? (
                        <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
                      ) : (
                        tile.count
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-1">{tile.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                      {tile.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;