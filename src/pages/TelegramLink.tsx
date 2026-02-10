import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import AppLayout from '@/components/layout/AppLayout';

export default function TelegramLink() {
  const navigate = useNavigate();
  const [telegramLinkUrl, setTelegramLinkUrl] = useState<string>('');
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [user, setUser] = useState<{ id: number; organization_id: number; telegram_id?: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setTelegramLinked(!!parsedUser.telegram_id);
      generateTelegramLink(parsedUser, token);
    }
  }, [navigate]);

  const generateTelegramLink = (user: { id: number; organization_id: number }, token: string) => {
    const deepLink = `https://t.me/techsale_b2b_bot?start=link_${btoa(`${user.id}_${user.organization_id}_${token}`)}`;
    setTelegramLinkUrl(deepLink);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${telegramLinked ? 'bg-green-100' : 'bg-blue-100'}`}>
                <Icon 
                  name={telegramLinked ? 'CheckCircle2' : 'MessageCircle'} 
                  size={28} 
                  className={telegramLinked ? 'text-green-600' : 'text-blue-600'} 
                />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {telegramLinked ? 'Telegram привязан' : 'Привязать Telegram'}
                </CardTitle>
                <CardDescription>
                  {telegramLinked 
                    ? 'Ваш аккаунт успешно привязан к боту' 
                    : 'Подключите бота для добавления клиентов через Telegram'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {telegramLinked ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <Icon name="CheckCircle2" size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Бот успешно подключен</p>
                    <p className="text-sm text-green-700 mt-1">
                      Теперь вы можете добавлять клиентов и управлять ими через Telegram бота.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Возможности бота:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Icon name="Plus" size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Добавление новых клиентов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Grid3x3" size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Оценка клиентов по матрице</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="MessageCircle" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Поддержка и помощь</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => window.open('https://t.me/techsale_b2b_bot', '_blank')}
                  className="w-full"
                  size="lg"
                >
                  <Icon name="MessageCircle" className="mr-2" size={20} />
                  Открыть бота
                </Button>

                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icon name="ArrowLeft" className="mr-2" size={20} />
                  Вернуться на дашборд
                </Button>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Как привязать бота:</h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold flex-shrink-0">1.</span>
                      <span>Нажмите кнопку "Привязать бота" ниже</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold flex-shrink-0">2.</span>
                      <span>Откроется Telegram бот в новой вкладке</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold flex-shrink-0">3.</span>
                      <span>Нажмите "Start" в боте для завершения привязки</span>
                    </li>
                  </ol>
                </div>

                <Button 
                  onClick={() => window.open(telegramLinkUrl, '_blank')}
                  className="w-full"
                  size="lg"
                >
                  <Icon name="Send" className="mr-2" size={20} />
                  Привязать бота
                </Button>

                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icon name="ArrowLeft" className="mr-2" size={20} />
                  Назад
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}