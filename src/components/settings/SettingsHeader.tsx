import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SettingsHeaderProps {
  activeTab: 'organization' | 'statuses' | 'permissions' | 'telegram';
  setActiveTab: (tab: 'organization' | 'statuses' | 'permissions' | 'telegram') => void;
  onBack: () => void;
}

const SettingsHeader = ({ activeTab, setActiveTab, onBack }: SettingsHeaderProps) => {
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Настройки</h1>
                <p className="text-sm text-muted-foreground">Управление организацией, статусами и правами доступа</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-0 max-w-4xl">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
          <Button
            variant={activeTab === 'organization' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('organization')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="Building2" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Организация</span>
          </Button>
          <Button
            variant={activeTab === 'statuses' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('statuses')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="ListChecks" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Статусы сделок</span>
            <span className="sm:hidden">Статусы</span>
          </Button>
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('permissions')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="Shield" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Права доступа</span>
            <span className="sm:hidden">Права</span>
          </Button>
          <Button
            variant={activeTab === 'telegram' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('telegram')}
            className="rounded-b-none text-xs sm:text-sm px-2 sm:px-4"
          >
            <Icon name="Send" size={14} className="sm:mr-2" />
            <span className="hidden sm:inline">Telegram</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default SettingsHeader;
