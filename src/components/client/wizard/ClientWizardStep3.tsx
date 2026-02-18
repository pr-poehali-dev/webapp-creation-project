import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Matrix {
  id: number;
  name: string;
}

interface ClientWizardStep3Props {
  matrices: Matrix[];
  selectedMatrixId: string;
  onChange: (matrixId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ClientWizardStep3 = ({ 
  matrices, 
  selectedMatrixId, 
  onChange, 
  onNext, 
  onBack 
}: ClientWizardStep3Props) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Icon name="Grid3x3" size={32} className="text-primary sm:w-10 sm:h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 px-4">По какой матрице считаем?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">Выберите матрицу для оценки клиента</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {matrices.map((matrix) => (
          <Card
            key={matrix.id}
            className={`p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedMatrixId === matrix.id.toString()
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onChange(matrix.id.toString())}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                selectedMatrixId === matrix.id.toString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              }`}>
                <Icon name="LayoutGrid" size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{matrix.name}</h3>
              </div>
              {selectedMatrixId === matrix.id.toString() && (
                <Icon name="CheckCircle2" size={20} className="text-primary flex-shrink-0 sm:w-6 sm:h-6" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedMatrixId}
          className="gradient-primary w-full sm:w-auto"
          size="lg"
        >
          Далее
          <Icon name="ArrowRight" size={20} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ClientWizardStep3;