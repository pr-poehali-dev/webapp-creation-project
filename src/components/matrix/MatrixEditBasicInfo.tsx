import { Card } from '@/components/ui/card';

interface MatrixEditBasicInfoProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const MatrixEditBasicInfo = ({
  name,
  description,
  onNameChange,
  onDescriptionChange
}: MatrixEditBasicInfoProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Основная информация</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Название матрицы *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Описание</label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
          />
        </div>
      </div>
    </Card>
  );
};

export default MatrixEditBasicInfo;
