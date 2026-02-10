import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
    users_limit: 0,
    matrices_limit: 0,
    clients_limit: 0,
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
        // Сбросить форму
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
        body: JSON.dumps({ status: newStatus }),
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

  const getTierBadge = (tier: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800',
    };
    return colors[tier as keyof typeof colors] || colors.free;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      deleted: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Организация</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Тариф</TableHead>
                    <TableHead>Период</TableHead>
                    <TableHead>Лимиты</TableHead>
                    <TableHead>Использование</TableHead>
                    <TableHead>Создана</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-mono text-sm">
                        #{org.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {org.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(org.status)}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierBadge(org.subscription_tier)}>
                          {org.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className={isExpired(org.subscription_end_date) ? 'text-red-600' : ''}>
                          {formatDate(org.subscription_start_date)} —{' '}
                          {formatDate(org.subscription_end_date)}
                          {isExpired(org.subscription_end_date) && (
                            <span className="ml-2 text-xs">⚠️ Истёк</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <div>👥 {org.users_limit} польз.</div>
                          <div>📊 {org.matrices_limit} матр.</div>
                          <div>👔 {org.clients_limit} клиент.</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <div className={org.users_count >= org.users_limit ? 'text-red-600 font-semibold' : ''}>
                            {org.users_count} / {org.users_limit}
                          </div>
                          <div className={org.matrices_count >= org.matrices_limit ? 'text-red-600 font-semibold' : ''}>
                            {org.matrices_count} / {org.matrices_limit}
                          </div>
                          <div className={org.clients_count >= org.clients_limit ? 'text-red-600 font-semibold' : ''}>
                            {org.clients_count} / {org.clients_limit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(org.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrg(org)}
                          >
                            <Icon name="Edit" className="h-4 w-4" />
                          </Button>
                          {org.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(org.id, 'suspended')}
                            >
                              <Icon name="Pause" className="h-4 w-4" />
                            </Button>
                          ) : org.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(org.id, 'active')}
                            >
                              <Icon name="Play" className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {org.status !== 'deleted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(org.id, 'deleted')}
                            >
                              <Icon name="Trash2" className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {organizations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Нет организаций
              </div>
            )}
          </CardContent>
        </Card>

        {/* Диалог редактирования тарифа */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Редактировать тариф</DialogTitle>
              <DialogDescription>
                {selectedOrg?.name} (ID: #{selectedOrg?.id})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Тариф</Label>
                <Select
                  value={editForm.subscription_tier}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, subscription_tier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата начала</Label>
                  <Input
                    type="date"
                    value={editForm.subscription_start_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subscription_start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата окончания</Label>
                  <Input
                    type="date"
                    value={editForm.subscription_end_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subscription_end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Лимит пользователей</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.users_limit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, users_limit: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Лимит матриц</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.matrices_limit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, matrices_limit: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Лимит клиентов</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.clients_limit}
                  onChange={(e) =>
                    setEditForm({ ...editForm, clients_limit: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveSubscription} className="flex-1">
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог создания организации */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Создать организацию</DialogTitle>
              <DialogDescription>
                Будет создана организация и owner пользователь
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название организации</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="Моя компания"
                />
              </div>

              <div className="space-y-2">
                <Label>Логин owner</Label>
                <Input
                  value={createForm.owner_username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, owner_username: e.target.value })
                  }
                  placeholder="owner_username"
                />
              </div>

              <div className="space-y-2">
                <Label>Пароль (оставьте пустым для автогенерации)</Label>
                <Input
                  type="password"
                  value={createForm.owner_password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, owner_password: e.target.value })
                  }
                  placeholder="Автоматически"
                />
              </div>

              <div className="space-y-2">
                <Label>Тариф</Label>
                <Select
                  value={createForm.subscription_tier}
                  onValueChange={(value) => {
                    const limits = getTierLimits(value);
                    setCreateForm({
                      ...createForm,
                      subscription_tier: value,
                      users_limit: limits.users,
                      matrices_limit: limits.matrices,
                      clients_limit: limits.clients,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата начала</Label>
                  <Input
                    type="date"
                    value={createForm.subscription_start_date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, subscription_start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата окончания</Label>
                  <Input
                    type="date"
                    value={createForm.subscription_end_date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, subscription_end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Польз.</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.users_limit}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, users_limit: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Матр.</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.matrices_limit}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, matrices_limit: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Клиент.</Label>
                  <Input
                    type="number"
                    min="1"
                    value={createForm.clients_limit}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, clients_limit: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateOrganization} className="flex-1">
                  Создать
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог настроек админа */}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Настройки администратора</DialogTitle>
              <DialogDescription>
                Изменение логина и пароля
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Изменить логин</h3>
                <div className="space-y-2">
                  <Label>Новый логин</Label>
                  <Input
                    value={settingsForm.new_username}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, new_username: e.target.value })
                    }
                    placeholder={adminUsername || ''}
                  />
                </div>
                <Button onClick={handleUpdateUsername} size="sm">
                  Сохранить логин
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="text-sm font-semibold">Изменить пароль</h3>
                <div className="space-y-2">
                  <Label>Текущий пароль</Label>
                  <Input
                    type="password"
                    value={settingsForm.current_password}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, current_password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Новый пароль</Label>
                  <Input
                    type="password"
                    value={settingsForm.new_password}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, new_password: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleUpdatePassword} size="sm">
                  Сохранить пароль
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}