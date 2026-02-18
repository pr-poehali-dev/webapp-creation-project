import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ClientWizardStep4Props {
  loading?: boolean;
  onStartQuestionnaire: () => void;
  onSkipQuestionnaire: () => void;
  onBack: () => void;
}

const ClientWizardStep4 = ({ 
  loading = false,
  onStartQuestionnaire, 
  onSkipQuestionnaire, 
  onBack 
}: ClientWizardStep4Props) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Icon name="ClipboardList" size={32} className="text-primary sm:w-10 sm:h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 px-4">Заполним опросник сейчас?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Это поможет автоматически определить приоритет клиента по критериям матрицы
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card
          className={`p-6 sm:p-8 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 border-primary/50 bg-primary/5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={onStartQuestionnaire}
        >
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {loading ? (
                <Icon name="Loader2" size={28} className="text-primary-foreground animate-spin sm:w-8 sm:h-8" />
              ) : (
                <Icon name="CheckCircle2" size={28} className="text-primary-foreground sm:w-8 sm:h-8" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Да!</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Пройти опросник и получить автоматическую оценку
            </p>
          </div>
        </Card>

        <Card
          className={`p-6 sm:p-8 cursor-pointer transition-all hover:shadow-xl hover:scale-105 border-2 border-border ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={onSkipQuestionnaire}
        >
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {loading ? (
                <Icon name="Loader2" size={28} className="text-muted-foreground animate-spin sm:w-8 sm:h-8" />
              ) : (
                <Icon name="Clock" size={28} className="text-muted-foreground sm:w-8 sm:h-8" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Заполню позже</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
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
          className="w-full sm:w-auto"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
};

export default ClientWizardStep4;