import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    organization_name: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/10d14e92-b1df-45e1-b617-80a5071cb4d8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          organization_name: formData.organization_name,
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8 border-border">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Icon name="Zap" size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Создать аккаунт</h1>
          <p className="text-muted-foreground">
            Начните работать с TechSale CRM уже сегодня
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="organization_name" className="block text-sm font-medium mb-2">
              Название организации
            </label>
            <input
              id="organization_name"
              type="text"
              required
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ООО «Технологии будущего»"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              Ваше имя
            </label>
            <input
              id="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ivan@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Минимум 8 символов"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Подтвердите пароль
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Повторите пароль"
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary h-12 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Создаём аккаунт...
              </>
            ) : (
              <>
                <Icon name="Rocket" size={20} className="mr-2" />
                Создать аккаунт
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Регистрируясь, вы принимаете{' '}
            <a href="#" className="text-primary hover:underline">
              пользовательское соглашение
            </a>{' '}
            и{' '}
            <a href="#" className="text-primary hover:underline">
              политику конфиденциальности
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
