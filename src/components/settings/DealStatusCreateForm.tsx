import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DealStatusCreateFormProps {
  newStatus: {
    name: string;
    weight: number;
  };
  setNewStatus: (status: { name: string; weight: number }) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  disabled: boolean;
}

const DealStatusCreateForm = ({ newStatus, setNewStatus, onSubmit, loading, disabled }: DealStatusCreateFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mb-6 p-4 bg-card/50 rounded-lg border border-border">
      <h3 className="text-sm font-semibold mb-3">Добавить новый статус</h3>
      <div className="grid md:grid-cols-[1fr_150px_auto] gap-3">
        <input
          type="text"
          placeholder="Название статуса"
          value={newStatus.name}
          onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
          className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div>
          <select
            value={newStatus.weight}
            onChange={(e) => setNewStatus({ ...newStatus, weight: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
              <option key={w} value={w}>
                Вес: {w}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={loading || disabled}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить
        </Button>
      </div>
    </form>
  );
};

export default DealStatusCreateForm;
