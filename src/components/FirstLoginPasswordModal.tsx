import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface FirstLoginPasswordModalProps {
  open: boolean;
  onSuccess: () => void;
}

const FirstLoginPasswordModal = ({ open, onSuccess }: FirstLoginPasswordModalProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');

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
          action: 'skip_password_change'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка');
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.password_change_required = false;
      localStorage.setItem('user', JSON.stringify(userData));

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Lock" size={20} />
            Смена пароля
          </DialogTitle>
          <DialogDescription>
            Рекомендуем сменить пароль при первом входе для безопасности вашего аккаунта.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <Icon name="AlertTriangle" size={16} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Введите новый пароль</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Смена пароля...' : 'Сменить пароль'}
            </Button>
            <Button
              onClick={handleSkip}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Нет, оставлю текущий
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstLoginPasswordModal;