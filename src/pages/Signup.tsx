import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Signup = () => {
  const handleTelegramBot = () => {
    window.open('https://t.me/your_bot?start=create_org', '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-4">
      <Card className="w-full max-w-md p-6 sm:p-8 border-border">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Icon name="Zap" className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Начать использовать TechSale CRM</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Регистрация доступна через Telegram бота
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3 mb-3">
              <Icon name="MessageCircle" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Создание аккаунта через бота</h3>
                <p className="text-sm text-muted-foreground">
                  Для создания аккаунта организации нажмите кнопку ниже и следуйте инструкциям в Telegram боте
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Icon name="Check" className="w-4 h-4 text-accent flex-shrink-0" />
              <span>14 дней бесплатно</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Icon name="Check" className="w-4 h-4 text-accent flex-shrink-0" />
              <span>Без привязки карты</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Icon name="Check" className="w-4 h-4 text-accent flex-shrink-0" />
              <span>До 3 пользователей</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Icon name="Check" className="w-4 h-4 text-accent flex-shrink-0" />
              <span>1 матрица квалификации</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleTelegramBot}
          className="w-full gradient-primary h-11 sm:h-12 text-sm sm:text-base font-semibold mb-4"
        >
          <Icon name="Send" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Создать аккаунт в Telegram
        </Button>

        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
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
