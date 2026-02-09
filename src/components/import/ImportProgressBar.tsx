import Icon from '@/components/ui/icon';

interface ImportProgressBarProps {
  step: 1 | 2 | 3;
}

const ImportProgressBar = ({ step }: ImportProgressBarProps) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
          1
        </div>
        <span className="text-xs sm:text-sm font-medium">Загрузка файла</span>
      </div>
      <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
      <Icon name="ChevronDown" size={16} className="text-muted-foreground sm:hidden" />
      <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
          2
        </div>
        <span className="text-xs sm:text-sm font-medium">Маппинг колонок</span>
      </div>
      <Icon name="ChevronRight" size={16} className="text-muted-foreground hidden sm:block" />
      <Icon name="ChevronDown" size={16} className="text-muted-foreground sm:hidden" />
      <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
          3
        </div>
        <span className="text-xs sm:text-sm font-medium">Превью и импорт</span>
      </div>
    </div>
  );
};

export default ImportProgressBar;