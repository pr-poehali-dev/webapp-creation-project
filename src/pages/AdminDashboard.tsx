import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import OrganizationsTable from '@/components/admin/OrganizationsTable';
import EditOrganizationDialog from '@/components/admin/EditOrganizationDialog';
import CreateOrganizationDialog from '@/components/admin/CreateOrganizationDialog';
import AdminSettingsDialog from '@/components/admin/AdminSettingsDialog';

const ADMIN_ORGS_URL = import.meta.env.VITE_ADMIN_ORGS_URL || 'https://functions.poehali.dev/27c59523-c1ea-424b-a922-e5af28d26e5e';
const ADMIN_SETTINGS_URL = import.meta.env.VITE_ADMIN_SETTINGS_URL || 'https://functions.poehali.dev/e34420aa-6eec-4e3d-9cdb-006ded09aff2';

interface Organization {
  id: number;
  name: string;
  subscription_tier: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  users_limit: number;
  matrices_limit: number;
  clients_limit: number;
  created_at: string;
  status: string;
  users_count: number;
  matrices_count: number;
  clients_count: number;
}

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    subscription_tier: '',
    subscription_start_date: '',
    subscription_end_date: '',
    users_limit: 0,
    matrices_limit: 0,
    clients_limit: 0,
  });

  const [createForm, setCreateForm] = useState({
    name: '',
    owner_username: '',
    owner_password: '',
    subscription_tier: 'free',
    subscription_start_date: new Date().toISOString().split('T')[0],
    subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    users_limit: 3,
    matrices_limit: 1,
    clients_limit: 10,
  });

  const getTierLimits = (tier: string) => {
    const limits = {
      free: { users: 3, matrices: 1, clients: 10 },
      pro: { users: 10, matrices: 3, clients: 500 },
      enterprise: { users: 100, matrices: 50, clients: 10000 },
    };
    return limits[tier as keyof typeof limits] || limits.free;
  };

  const [settingsForm, setSettingsForm] = useState({
    new_username: '',
    current_password: '',
    new_password: '',
  });

  const adminToken = localStorage.getItem('admin_token');
  const adminUsername = localStorage.getItem('admin_username');

  useEffect(() => {
    if (!adminToken) {
      navigate('/crmadminauth');
      return;
    }

    loadOrganizations();
  }, [adminToken, navigate]);

  const loadOrganizations = async () => {
    try {
      const response = await fetch(ADMIN_ORGS_URL, {
        headers: {
          'X-Authorization': `Bearer ${adminToken}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        navigate('/crmadminauth');
        return;
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки данных');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/crmadminauth');
  };

  const handleEditOrg = (org: Organization) => {
    setSelectedOrg(org);
    setEditForm({
      subscription_tier: org.subscription_tier || 'free',
      subscription_start_date: org.subscription_start_date?.split('T')[0] || '',
      subscription_end_date: org.subscription_end_date?.split('T')[0] || '',
      users_limit: org.users_limit || 3,
      matrices_limit: org.matrices_limit || 1,
      clients_limit: org.clients_limit || 10,
    });
    setEditDialogOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedOrg) return;

    try {
      const response = await fetch(`${ADMIN_ORGS_URL}/${selectedOrg.id}`, {
        method: 'PUT',
        headers: {
          'X-Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditDialogOpen(false);
        loadOrganizations();
        toast({ title: 'Тариф обновлён' });
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch(ADMIN_ORGS_URL, {
        method: 'POST',
        headers: {
          'X-Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok) {
        setCreateDialogOpen(false);
        loadOrganizations();
        setGeneratedPassword(data.password);
        toast({
          title: 'Организация создана',
          description: `Логин: ${data.username}, Пароль: ${data.password}`,
        });
        setCreateForm({
          name: '',
          owner_username: '',
          owner_password: '',
          subscription_tier: 'free',
          subscription_start_date: new Date().toISOString().split('T')[0],
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users_limit: 3,
          matrices_limit: 1,
          clients_limit: 10,
        });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Ошибка создания', variant: 'destructive' });
    }
  };

  const handleChangeStatus = async (orgId: number, newStatus: string) => {
    try {
      const response = await fetch(`${ADMIN_ORGS_URL}/${orgId}`, {
        method: 'PATCH',
        headers: {
          'X-Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadOrganizations();
        toast({ title: `Статус изменён на ${newStatus}` });
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Ошибка изменения статуса', variant: 'destructive' });
    }
  };

  const handleUpdateUsername = async () => {
    if (!settingsForm.new_username) return;

    try {
      const response = await fetch(`${ADMIN_SETTINGS_URL}?action=username`, {
        method: 'PUT',
        headers: {
          'X-Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: settingsForm.new_username }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_username', data.username);
        toast({ title: 'Логин изменён' });
        setSettingsForm({ ...settingsForm, new_username: '' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Ошибка изменения логина', variant: 'destructive' });
    }
  };

  const handleUpdatePassword = async () => {
    if (!settingsForm.current_password || !settingsForm.new_password) return;

    try {
      const response = await fetch(`${ADMIN_SETTINGS_URL}?action=password`, {
        method: 'PUT',
        headers: {
          'X-Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: settingsForm.current_password,
          new_password: settingsForm.new_password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Пароль изменён' });
        setSettingsForm({ ...settingsForm, current_password: '', new_password: '' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Ошибка изменения пароля', variant: 'destructive' });
    }
  };

  const handleCreateFormChange = (newForm: typeof createForm) => {
    if (newForm.subscription_tier !== createForm.subscription_tier) {
      const limits = getTierLimits(newForm.subscription_tier);
      setCreateForm({
        ...newForm,
        users_limit: limits.users,
        matrices_limit: limits.matrices,
        clients_limit: limits.clients,
      });
    } else {
      setCreateForm(newForm);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Админ-панель CRM</CardTitle>
                <CardDescription>
                  Управление организациями • Вход: {adminUsername}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
                  <Icon name="Settings" className="mr-2 h-4 w-4" />
                  Настройки
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <Icon name="LogOut" className="mr-2 h-4 w-4" />
                  Выход
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Добавить организацию
              </Button>
            </div>

            <OrganizationsTable
              organizations={organizations}
              onEdit={handleEditOrg}
              onChangeStatus={handleChangeStatus}
            />

            {organizations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Нет организаций
              </div>
            )}
          </CardContent>
        </Card>

        <EditOrganizationDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          selectedOrg={selectedOrg}
          editForm={editForm}
          onFormChange={setEditForm}
          onSave={handleSaveSubscription}
        />

        <CreateOrganizationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          createForm={createForm}
          onFormChange={handleCreateFormChange}
          onCreate={handleCreateOrganization}
        />

        <AdminSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          adminUsername={adminUsername}
          settingsForm={settingsForm}
          onFormChange={setSettingsForm}
          onUpdateUsername={handleUpdateUsername}
          onUpdatePassword={handleUpdatePassword}
        />
      </div>
    </div>
  );
}