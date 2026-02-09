import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MatrixParamsStepProps {
  matrixName: string;
  matrixDescription: string;
  axisXName: string;
  axisYName: string;
  onMatrixNameChange: (value: string) => void;
  onMatrixDescriptionChange: (value: string) => void;
  onAxisXNameChange: (value: string) => void;
  onAxisYNameChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const MatrixParamsStep = ({
  matrixName,
  matrixDescription,
  axisXName,
  axisYName,
  onMatrixNameChange,
  onMatrixDescriptionChange,
  onAxisXNameChange,
  onAxisYNameChange,
  onBack,
  onNext
}: MatrixParamsStepProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Параметры матрицы</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Название матрицы <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={matrixName}
              onChange={(e) => onMatrixNameChange(e.target.value)}
              placeholder="Например: B2B продажи Q1 2024"
              className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={matrixDescription}
              onChange={(e) => onMatrixDescriptionChange(e.target.value)}
              placeholder="Краткое описание цели использования матрицы"
              rows={3}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Название оси X
              </label>
              <input
                type="text"
                value={axisXName}
                onChange={(e) => onAxisXNameChange(e.target.value)}
                placeholder="Ось X"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Название оси Y
              </label>
              <input
                type="text"
                value={axisYName}
                onChange={(e) => onAxisYNameChange(e.target.value)}
                placeholder="Ось Y"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        <Button 
          onClick={onNext}
          className="gradient-primary"
        >
          Далее
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MatrixParamsStep;
