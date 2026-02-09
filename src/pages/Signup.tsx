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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-4">
      <Card className="w-full max-w-md p-4 sm:p-7 border-border">
        <div className="mb-4 sm:mb-6 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Icon name="Zap" className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Создать аккаунт</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Начните работать с TechSale CRM уже сегодня
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          <div>
            <label htmlFor="organization_name" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
              Название организации
            </label>
            <input
              id="organization_name"
              type="text"
              required
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ООО «Технологии будущего»"
            />
          </div>

          <div>
            <label htmlFor="full_name" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
              Ваше имя
            </label>
            <input
              id="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ivan@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Минимум 8 символов"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
              Подтвердите пароль
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Повторите пароль"
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary h-9 sm:h-10 text-sm sm:text-base font-semibold mt-3 sm:mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                Создаём аккаунт...
              </>
            ) : (
              <>
                <Icon name="Rocket" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Создать аккаунт
              </>
            )}
          </Button>
        </form>

        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <p className="text-[10px] sm:text-xs text-center text-muted-foreground leading-relaxed px-2">
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