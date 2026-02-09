import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ClientWizardStep2Props {
  contactPerson: string;
  email: string;
  phone: string;
  onChange: (field: 'contactPerson' | 'email' | 'phone', value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const ClientWizardStep2 = ({ 
  contactPerson, 
  email, 
  phone, 
  onChange, 
  onNext, 
  onSkip,
  onBack 
}: ClientWizardStep2Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasAnyData = contactPerson.trim() || email.trim() || phone.trim();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon name="User" size={40} className="text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Контактное лицо?</h2>
        <p className="text-muted-foreground">Укажите контактную информацию (необязательно)</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="contact_person" className="block text-sm font-medium mb-2">
            Контактное лицо
          </label>
          <input
            ref={inputRef}
            id="contact_person"
            type="text"
            value={contactPerson}
            onChange={(e) => onChange('contactPerson', e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Иван Петров"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="ivan@company.ru"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Телефон
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>

          <div className="flex gap-3">
            {hasAnyData && (
              <Button
                onClick={onSkip}
                variant="ghost"
                size="lg"
              >
                Пропустить
              </Button>
            )}
            <Button
              onClick={hasAnyData ? onNext : onSkip}
              className="gradient-primary"
              size="lg"
            >
              {hasAnyData ? 'Далее' : 'Пропустить'}
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWizardStep2;