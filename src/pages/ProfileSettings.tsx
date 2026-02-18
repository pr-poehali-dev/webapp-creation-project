import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setFullName(user.full_name);
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      setError('ФИО обязательно для заполнения');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const funcUrl = await import('@/../backend/func2url.json').then(m => m.profile);

      const response = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update_profile',
          full_name: fullName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления профиля');
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.full_name = fullName;
      localStorage.setItem('user', JSON.stringify(userData));

      setSuccess('Профиль обновлён');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const funcUrl = await import('@/../backend/func2url.json').then(m => m.profile);

      const response = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'change_password',
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка смены пароля');
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.password_change_required = false;
      localStorage.setItem('user', JSON.stringify(userData));

      setSuccess('Пароль изменён');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">Настройки профиля</h1>
          </div>
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

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Личные данные</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">ФИО</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Введите ваше ФИО"
                />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Смена пароля</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Повторите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Изменение...' : 'Изменить пароль'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;