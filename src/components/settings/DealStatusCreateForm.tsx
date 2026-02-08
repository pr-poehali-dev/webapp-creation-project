import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DealStatusCreateFormProps {
  newStatus: {
    name: string;
  };
  setNewStatus: (status: { name: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  disabled: boolean;
}

const DealStatusCreateForm = ({ newStatus, setNewStatus, onSubmit, loading, disabled }: DealStatusCreateFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mb-6 p-4 bg-card/50 rounded-lg border border-border">
      <h3 className="text-sm font-semibold mb-3">Добавить новый статус</h3>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Название статуса"
          value={newStatus.name}
          onChange={(e) => setNewStatus({ name: e.target.value })}
          className="flex-1 px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" disabled={loading || disabled}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить
        </Button>
      </div>
    </form>
  );
};

export default DealStatusCreateForm;