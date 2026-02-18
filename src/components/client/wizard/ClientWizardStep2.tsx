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
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Icon name="User" size={32} className="text-primary sm:w-10 sm:h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 px-4">Контактное лицо?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">Укажите контактную информацию (необязательно)</p>
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
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 sm:pt-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
            {hasAnyData && (
              <Button
                onClick={onSkip}
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
              >
                Пропустить
              </Button>
            )}
            <Button
              onClick={hasAnyData ? onNext : onSkip}
              className="gradient-primary w-full sm:w-auto"
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