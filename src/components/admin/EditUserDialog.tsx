import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

const EditUserDialog = ({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setFullName(user.full_name);
      setRole(user.role);
      setIsActive(user.is_active);
      setPassword('');
      setGeneratedPassword('');
    }
  }, [user]);

  const handleGeneratePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generated = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const funcUrl = await import('@/func2url.json').then(m => m['admin-organizations']);

      const body: Record<string, string | boolean> = {
        username,
        email,
        full_name: fullName,
        role,
        is_active: isActive,
      };

      if (password) {
        body.password = password;
      }

      const response = await fetch(`${funcUrl}?resource=users&id=${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Ошибка при обновлении пользователя');
        return;
      }

      const result = await response.json();
      
      if (result.generated_password) {
        setGeneratedPassword(result.generated_password);
        setShowPassword(true);
      } else {
        onUserUpdated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ошибка при обновлении пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert('Пароль скопирован в буфер обмена');
  };

  const handleClose = () => {
    if (generatedPassword) {
      onUserUpdated();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
        </DialogHeader>

        {generatedPassword ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <p className="text-sm text-muted-foreground mb-2">Пользователь обновлён. Новый пароль:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background rounded border font-mono text-sm">
                  {generatedPassword}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopyPassword}>
                  <Icon name="Copy" size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Сохраните этот пароль — он больше не будет показан
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Закрыть</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Владелец</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="viewer">Наблюдатель</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                >
                  Генерировать
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Активен</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Отмена
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
