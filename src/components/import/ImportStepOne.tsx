import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ImportStepOneProps {
  file: File | null;
  loading: boolean;
  parseFile: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportStepOne = ({ file, loading, parseFile, handleFileChange }: ImportStepOneProps) => {
  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Этап 1: Загрузка файла</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Выберите файл для импорта (CSV или JSON)
        </label>
        
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="Upload" size={32} className="text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">
              {file ? file.name : 'Выберите файл или перетащите сюда'}
            </p>
            <p className="text-sm text-muted-foreground">
              Поддерживаются форматы: CSV, JSON
            </p>
          </label>
        </div>
      </div>

      <Button
        className="w-full gradient-primary"
        size="lg"
        onClick={parseFile}
        disabled={!file || loading}
      >
        {loading ? (
          <>
            <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
            Обработка...
          </>
        ) : (
          <>
            <Icon name="ArrowRight" size={20} className="mr-2" />
            Далее: Настроить маппинг
          </>
        )}
      </Button>

      <Card className="mt-6 p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-2">Требования к файлу</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• CSV: первая строка должна содержать заголовки колонок</li>
              <li>• JSON: должен быть массив объектов с одинаковой структурой</li>
              <li>• Обязательное поле: название компании</li>
              <li>• Рекомендуемая кодировка: UTF-8</li>
            </ul>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default ImportStepOne;
