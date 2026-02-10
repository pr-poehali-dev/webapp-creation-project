import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import DealStatusCreateForm from '@/components/settings/DealStatusCreateForm';
import DealStatusList from '@/components/settings/DealStatusList';

interface DealStatus {
  id: number;
  name: string;
  sort_order: number;
}

interface DealStatusesTabProps {
  dealStatuses: DealStatus[];
  newStatus: { name: string };
  setNewStatus: (status: { name: string }) => void;
  editingStatus: number | null;
  setEditingStatus: (id: number | null) => void;
  loading: boolean;
  onCreateStatus: (e: React.FormEvent) => Promise<void>;
  onUpdateStatus: (statusId: number, name: string) => Promise<void>;
  onDeleteStatus: (statusId: number) => Promise<void>;
  onInitDefaultStatuses: () => Promise<void>;
}

const DealStatusesTab = ({
  dealStatuses,
  newStatus,
  setNewStatus,
  editingStatus,
  setEditingStatus,
  loading,
  onCreateStatus,
  onUpdateStatus,
  onDeleteStatus,
  onInitDefaultStatuses
}: DealStatusesTabProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Icon name="ListChecks" size={24} />
          Статусы сделок
        </h2>
        {dealStatuses.length === 0 && (
          <Button variant="outline" size="sm" onClick={onInitDefaultStatuses}>
            <Icon name="Sparkles" size={16} className="mr-2" />
            Создать дефолтные
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Управляйте статусами сделок. Каждый статус имеет вес от 0 до 10 для ранжирования клиентов. Максимум 15 статусов.
      </p>

      <DealStatusCreateForm
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        onSubmit={onCreateStatus}
        loading={loading}
        disabled={dealStatuses.length >= 15}
      />

      <DealStatusList
        statuses={dealStatuses}
        editingStatus={editingStatus}
        setEditingStatus={setEditingStatus}
        onUpdate={onUpdateStatus}
        onDelete={onDeleteStatus}
      />
    </Card>
  );
};

export default DealStatusesTab;
