import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TelegramTabProps {
  telegramLinkUrl: string;
}

const TelegramTab = ({ telegramLinkUrl }: TelegramTabProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Icon name="Send" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Привязка Telegram бота</h2>
          <p className="text-sm text-muted-foreground">Добавляйте клиентов прямо из Telegram</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Icon name="Info" size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-600">
              <p className="font-semibold mb-1">Зачем привязывать бота?</p>
              <ul className="space-y-1 text-xs">
                <li>• Добавляйте клиентов мобильно после переговоров</li>
                <li>• Заполняйте данные через удобный диалог</li>
                <li>• Получайте уведомления о важных событиях</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Как привязать бота:</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Нажмите кнопку ниже</p>
                <p className="text-sm text-muted-foreground">Откроется Telegram с ботом</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Нажмите "Start" в боте</p>
                <p className="text-sm text-muted-foreground">Бот автоматически привяжется к вашему аккаунту</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Готово!</p>
                <p className="text-sm text-muted-foreground">Используйте кнопку "Добавить клиента" в боте</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            className="w-full gradient-primary h-12 text-base font-semibold"
            onClick={() => window.open(telegramLinkUrl, '_blank')}
          >
            <Icon name="Send" size={20} className="mr-2" />
            Привязать Telegram бота
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-3">
            Ссылка действительна только для вашего аккаунта
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="Smartphone" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Мобильный режим:</strong> На мобильных устройствах вы увидите уведомление о привязке бота прямо в интерфейсе CRM
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TelegramTab;
