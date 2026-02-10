interface Matrix {
  id: number;
  name: string;
}

interface DealStatus {
  id: number;
  name: string;
  weight: number;
  sort_order: number;
}

interface ClientEditSelectorsProps {
  dealStatusId: string;
  matrixId: string;
  dealStatuses: DealStatus[];
  matrices: Matrix[];
  onDealStatusChange: (value: string) => void;
  onMatrixChange: (value: string) => void;
}

const ClientEditSelectors = ({
  dealStatusId,
  matrixId,
  dealStatuses,
  matrices,
  onDealStatusChange,
  onMatrixChange,
}: ClientEditSelectorsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-lg border border-border">
        <label htmlFor="deal_status_id" className="block text-sm font-medium mb-3">
          Статус сделки
        </label>
        <select
          id="deal_status_id"
          value={dealStatusId}
          onChange={(e) => onDealStatusChange(e.target.value)}
          className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Не выбран</option>
          {dealStatuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-2">
          Текущее состояние переговоров с клиентом
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <label htmlFor="matrix_id" className="block text-sm font-medium mb-3">
          Матрица оценки
        </label>
        <select
          id="matrix_id"
          value={matrixId}
          onChange={(e) => onMatrixChange(e.target.value)}
          className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Без матрицы</option>
          {matrices.map((matrix) => (
            <option key={matrix.id} value={matrix.id}>
              {matrix.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-2">
          Выберите матрицу для автоматического определения квадранта
        </p>
      </div>
    </div>
  );
};

export default ClientEditSelectors;
