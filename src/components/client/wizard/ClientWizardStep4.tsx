import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ClientWizardStep4Props {
  onStartQuestionnaire: () => void;
  onSkipQuestionnaire: () => void;
  onBack: () => void;
}

const ClientWizardStep4 = ({ 
  onStartQuestionnaire, 
  onSkipQuestionnaire, 
  onBack 
}: ClientWizardStep4Props) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon name="ClipboardList" size={40} className="text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Заполним опросник сейчас?</h2>
        <p className="text-muted-foreground">
          Это поможет автоматически определить приоритет клиента по критериям матрицы
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card
          className="p-8 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 border-primary/50 bg-primary/5"
          onClick={onStartQuestionnaire}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle2" size={32} className="text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Да!</h3>
            <p className="text-muted-foreground">
              Пройти опросник и получить автоматическую оценку
            </p>
          </div>
        </Card>

        <Card
          className="p-8 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 border-border"
          onClick={onSkipQuestionnaire}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Заполню позже</h3>
            <p className="text-muted-foreground">
              Создать клиента без оценки, заполнить критерии потом
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
};

export default ClientWizardStep4;
