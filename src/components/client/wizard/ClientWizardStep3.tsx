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
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon name="Grid3x3" size={40} className="text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">По какой матрице считаем?</h2>
        <p className="text-muted-foreground">Выберите матрицу для оценки клиента</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {matrices.map((matrix) => (
          <Card
            key={matrix.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedMatrixId === matrix.id.toString()
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onChange(matrix.id.toString())}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedMatrixId === matrix.id.toString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              }`}>
                <Icon name="LayoutGrid" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{matrix.name}</h3>
              </div>
              {selectedMatrixId === matrix.id.toString() && (
                <Icon name="CheckCircle2" size={24} className="text-primary" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedMatrixId}
          className="gradient-primary"
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
