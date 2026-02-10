import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizationSettingsForm from '@/components/settings/OrganizationSettingsForm';
import UserPermissionsSection from '@/components/settings/UserPermissionsSection';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsAlerts from '@/components/settings/SettingsAlerts';
import DealStatusesTab from '@/components/settings/DealStatusesTab';
import TelegramTab from '@/components/settings/TelegramTab';

interface Organization {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
}

interface DealStatus {
  id: number;
  name: string;
  sort_order: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'organization' | 'statuses' | 'permissions' | 'telegram'>('organization');
  const [telegramLinkUrl, setTelegramLinkUrl] = useState<string>('');

  const [orgForm, setOrgForm] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
  });

  const [newStatus, setNewStatus] = useState({
    name: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchSettings();
    fetchDealStatuses();
    generateTelegramLink();
  }, [navigate]);

  const generateTelegramLink = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const token = localStorage.getItem('token');
    
    const deepLink = `https://t.me/techsale_b2b_bot?start=link_${btoa(`${user.id}_${user.organization_id}_${token}`)}`;
    setTelegramLinkUrl(deepLink);
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'get_settings' }),
      });

      const data = await response.json();
      if (response.ok) {
        setOrganization(data.organization);
        setOrgForm({
          name: data.organization.name || '',
          contact_email: data.organization.contact_email || '',
          contact_phone: data.organization.contact_phone || '',
          description: data.organization.description || '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      setError('Ошибка загрузки настроек');
    }
  };

  const fetchDealStatuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list_deal_statuses' }),
      });

      const data = await response.json();
      if (response.ok) {
        setDealStatuses(data.statuses);
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов:', error);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_settings',
          ...orgForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения настроек');
      }

      setSuccess('Настройки организации обновлены');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newStatus.name.trim()) {
      setError('Название статуса обязательно');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_deal_status',
          name: newStatus.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания статуса');
      }

      setSuccess('Статус сделки создан');
      setNewStatus({ name: '' });
      await fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания статуса');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusId: number, name: string) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'update_deal_status',
          status_id: statusId,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления статуса');
      }

      setSuccess('Статус обновлён');
      setEditingStatus(null);
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса');
    }
  };

  const handleDeleteStatus = async (statusId: number) => {
    if (!confirm('Удалить этот статус? Связанные с ним клиенты не будут удалены.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'delete_deal_status',
          status_id: statusId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка удаления статуса');
      }

      setSuccess('Статус деактивирован');
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления статуса');
    }
  };

  const handleInitDefaultStatuses = async () => {
    if (!confirm('Создать 5 дефолтных статусов сделок?')) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/acdf6580-785a-4a65-963a-b46134c33f8b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'init_default_statuses' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания статусов');
      }

      setSuccess(data.message);
      fetchDealStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания статусов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={() => navigate('/dashboard')}
      />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <SettingsAlerts error={error} success={success} />

        <div className="space-y-6">
          {activeTab === 'organization' && (
            <OrganizationSettingsForm
              orgForm={orgForm}
              setOrgForm={setOrgForm}
              onSubmit={handleSaveOrganization}
              loading={loading}
            />
          )}

          {activeTab === 'statuses' && (
            <DealStatusesTab
              dealStatuses={dealStatuses}
              newStatus={newStatus}
              setNewStatus={setNewStatus}
              editingStatus={editingStatus}
              setEditingStatus={setEditingStatus}
              loading={loading}
              onCreateStatus={handleCreateStatus}
              onUpdateStatus={handleUpdateStatus}
              onDeleteStatus={handleDeleteStatus}
              onInitDefaultStatuses={handleInitDefaultStatuses}
            />
          )}

          {activeTab === 'permissions' && (
            <UserPermissionsSection
              onError={(err) => setError(err)}
              onSuccess={(msg) => setSuccess(msg)}
            />
          )}

          {activeTab === 'telegram' && (
            <TelegramTab telegramLinkUrl={telegramLinkUrl} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;