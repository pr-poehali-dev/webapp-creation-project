import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import UserPermissionsDialog from '@/components/team/UserPermissionsDialog';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  invited_by_name: string;
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
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('manager');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [selectedUserRole, setSelectedUserRole] = useState('manager');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    fetchData(token);
  }, [navigate]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const [usersRes, invitesRes] = await Promise.all([
        fetch('https://functions.poehali.dev/369fdc8c-fb5b-4b02-bb8f-ef5d8da3de3e', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://functions.poehali.dev/81e1a6f6-951b-4c0b-b28e-5883c65d5bcf', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvitations(invitesData.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    setError('');
    setSuccess('');

    if (!inviteEmail) {
      setError('Введите email');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/81e1a6f6-951b-4c0b-b28e-5883c65d5bcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create',
          email: inviteEmail,
          role: inviteRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания приглашения');
      }

      setSuccess('Приглашение отправлено!');
      setInviteEmail('');
      setShowInviteModal(false);
      setShowPermissionsDialog(true);
      setSelectedUserRole(inviteRole);
      fetchData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    }
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
        fetchData(token);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleCancelInvite = async (invitationId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/81e1a6f6-951b-4c0b-b28e-5883c65d5bcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'cancel',
          invitation_id: invitationId
        })
      });

      if (response.ok) {
        setSuccess('Приглашение отменено');
        fetchData(token);
      }
    } catch (err) {
      console.error('Error cancelling invitation:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-primary/10 text-primary border-primary/20',
      admin: 'bg-secondary/10 text-secondary border-secondary/20',
      manager: 'bg-accent/10 text-accent border-accent/20',
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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Команда</h1>
          </div>
          {canManage && (
            <Button className="gradient-primary" onClick={() => setShowInviteModal(true)}>
              <Icon name="UserPlus" size={16} className="mr-2" />
              Пригласить
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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

        <div className="max-w-5xl mx-auto space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Пользователи ({users.length})</h2>
            </div>

            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{user.full_name}</p>
                        {getRoleBadge(user.role)}
                        {!user.is_active && <Badge variant="outline" className="text-destructive">Неактивен</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  {canManage && user.role !== 'owner' && user.id !== currentUser?.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedUserRole(user.role);
                          setShowPermissionsDialog(true);
                        }}
                      >
                        <Icon name="Settings" size={16} />
                      </Button>
                      {user.is_active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { is_active: false })}
                        >
                          <Icon name="UserX" size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateUser(user.id, { is_active: true })}
                        >
                          <Icon name="UserCheck" size={16} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {invitations.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Приглашения ({invitations.length})</h2>

              <div className="space-y-3">
                {invitations.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium">{inv.email}</p>
                        {getRoleBadge(inv.role)}
                        <Badge variant="outline" className={inv.status === 'pending' ? 'text-secondary' : 'text-muted-foreground'}>
                          {inv.status === 'pending' ? 'Ожидает' : inv.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Пригласил: {inv.invited_by_name} • {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {canManage && inv.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvite(inv.id)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Пригласить пользователя</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="colleague@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Роль</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="manager">Менеджер</option>
                  <option value="admin">Админ</option>
                  <option value="department_head">Руководитель отдела</option>
                </select>
              </div>

              <Button
                className="w-full gradient-primary"
                onClick={handleInvite}
              >
                <Icon name="Send" size={16} className="mr-2" />
                Отправить приглашение
              </Button>
            </div>
          </Card>
        </div>
      )}

      <UserPermissionsDialog
        isOpen={showPermissionsDialog}
        onClose={() => {
          setShowPermissionsDialog(false);
          setSelectedUserId(undefined);
        }}
        userId={selectedUserId}
        role={selectedUserRole}
        onSave={async (permissions) => {
          const token = localStorage.getItem('token');
          if (!token) return;

          try {
            const response = await fetch('https://functions.poehali.dev/b444253a-2d33-4d1d-8e79-57fde40bbc5d', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                action: 'update_permissions',
                user_id: selectedUserId,
                ...permissions
              })
            });

            if (response.ok) {
              setSuccess('Права пользователя обновлены');
              setShowPermissionsDialog(false);
              setSelectedUserId(undefined);
            } else {
              setError('Ошибка обновления прав');
            }
          } catch (err) {
            console.error('Error updating permissions:', err);
            setError('Ошибка обновления прав');
          }
        }}
      />
    </div>
  );
};

export default Team;