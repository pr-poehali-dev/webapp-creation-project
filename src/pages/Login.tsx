import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/10d14e92-b1df-45e1-b617-80a5071cb4d8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-4">
      <Card className="w-full max-w-md p-6 sm:p-8 border-border">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Icon name="Zap" className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Вход в TechSale CRM</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Добро пожаловать! Войдите в свой аккаунт
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ivan@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Введите ваш пароль"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-border" />
              <span className="text-muted-foreground">Запомнить меня</span>
            </label>
            <a href="#" className="text-primary hover:underline">
              Забыли пароль?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary h-10 sm:h-11 text-sm sm:text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                Вход...
              </>
            ) : (
              <>
                <Icon name="LogIn" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Войти
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Создать бесплатно
            </Link>
          </p>
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="Check" className="w-3 h-3 text-accent" />
              <span>14 дней бесплатно</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Check" className="w-3 h-3 text-accent" />
              <span>Без привязки карты</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;