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
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon name="Building2" size={40} className="text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Как называется компания?</h2>
        <p className="text-muted-foreground">Введите название компании-клиента</p>
      </div>

      <div className="space-y-6">
        <input
          ref={inputRef}
          type="text"
          value={companyName}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-6 py-4 text-lg bg-input border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          placeholder="ООО «Технологии будущего»"
        />

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!companyName.trim()}
            className="gradient-primary px-8 py-6 text-lg"
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
