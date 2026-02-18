import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ClientWizardStep1Props {
  companyName: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

const ClientWizardStep1 = ({ companyName, onChange, onNext }: ClientWizardStep1Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && companyName.trim()) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Icon name="Building2" size={32} className="text-primary sm:w-10 sm:h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 px-4">Как называется компания?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">Введите название компании-клиента</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <input
          ref={inputRef}
          type="text"
          value={companyName}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg bg-input border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          placeholder="ООО «Технологии будущего»"
        />

        <div className="flex justify-end pt-2 sm:pt-4">
          <Button
            onClick={onNext}
            disabled={!companyName.trim()}
            className="gradient-primary w-full sm:w-auto sm:px-8"
            size="lg"
          >
            Далее
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientWizardStep1;