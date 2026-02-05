import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Matrix {
  id: number;
  name: string;
}

interface Criterion {
  id: number;
  name: string;
  description: string;
  axis: string;
  weight: number;
  min_value: number;
  max_value: number;
}

interface Score {
  criterion_id: number;
  score: number;
  comment: string;
}

interface ClientMatrixScoringProps {
  matrices: Matrix[];
  criteria: Criterion[];
  scores: Score[];
  matrixId: string;
  onMatrixChange: (matrixId: string) => void;
  onScoreChange: (criterionId: number, value: number) => void;
}

const ClientMatrixScoring = ({
  matrices,
  criteria,
  scores,
  matrixId,
  onMatrixChange,
  onScoreChange,
}: ClientMatrixScoringProps) => {
  const xCriteria = criteria.filter(c => c.axis === 'x');
  const yCriteria = criteria.filter(c => c.axis === 'y');

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Оценка по критериям</h2>
      
      <div className="mb-6">
        <label htmlFor="matrix_id" className="block text-sm font-medium mb-2">
          Матрица для оценки
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
      </div>

      {criteria.length > 0 && (
        <div className="space-y-6">
          {xCriteria.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" size={20} className="text-primary" />
                Ось X: Стратегическое влияние
              </h3>
              <div className="space-y-4">
                {xCriteria.map((criterion) => {
                  const score = scores.find(s => s.criterion_id === criterion.id);
                  return (
                    <div key={criterion.id} className="p-4 bg-card/50 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{criterion.name}</p>
                          <p className="text-sm text-muted-foreground">{criterion.description}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary ml-4">
                          {score?.score || 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={criterion.min_value}
                        max={criterion.max_value}
                        value={score?.score || 0}
                        onChange={(e) => onScoreChange(criterion.id, parseFloat(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{criterion.min_value}</span>
                        <span>{criterion.max_value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {yCriteria.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Target" size={20} className="text-secondary" />
                Ось Y: Зрелость потребности
              </h3>
              <div className="space-y-4">
                {yCriteria.map((criterion) => {
                  const score = scores.find(s => s.criterion_id === criterion.id);
                  return (
                    <div key={criterion.id} className="p-4 bg-card/50 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{criterion.name}</p>
                          <p className="text-sm text-muted-foreground">{criterion.description}</p>
                        </div>
                        <span className="text-2xl font-bold text-secondary ml-4">
                          {score?.score || 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={criterion.min_value}
                        max={criterion.max_value}
                        value={score?.score || 0}
                        onChange={(e) => onScoreChange(criterion.id, parseFloat(e.target.value))}
                        className="w-full accent-secondary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{criterion.min_value}</span>
                        <span>{criterion.max_value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ClientMatrixScoring;
