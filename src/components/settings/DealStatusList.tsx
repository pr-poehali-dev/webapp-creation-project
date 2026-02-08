import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DealStatus {
  id: number;
  name: string;
  sort_order: number;
}

interface DealStatusListProps {
  statuses: DealStatus[];
  editingStatus: number | null;
  setEditingStatus: (id: number | null) => void;
  onUpdate: (statusId: number, name: string) => void;
  onDelete: (statusId: number) => void;
}

const DealStatusList = ({ statuses, editingStatus, setEditingStatus, onUpdate, onDelete }: DealStatusListProps) => {
  return (
    <div className="space-y-3">
      {statuses.map((status) => (
        <div
          key={status.id}
          className="p-4 bg-card/50 rounded-lg border border-border flex items-center gap-4"
        >
          {editingStatus === status.id ? (
            <>
              <input
                type="text"
                defaultValue={status.name}
                id={`edit-name-${status.id}`}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={() => {
                  const nameInput = document.getElementById(`edit-name-${status.id}`) as HTMLInputElement;
                  onUpdate(status.id, nameInput.value);
                }}
              >
                <Icon name="Check" size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingStatus(null)}
              >
                <Icon name="X" size={16} />
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="font-medium">{status.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingStatus(status.id)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(status.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {statuses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="ListX" size={48} className="mx-auto mb-3 opacity-50" />
          <p>Нет статусов сделок</p>
          <p className="text-sm">Создайте дефолтные статусы или добавьте свои</p>
        </div>
      )}
    </div>
  );
};

export default DealStatusList;