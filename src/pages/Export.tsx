import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Matrix {
  id: number;
  name: string;
}

const Export = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('');
  const [selectedMatrix, setSelectedMatrix] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMatrices();
  }, [navigate]);

  const fetchMatrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/574d8d38-81d5-49c7-b625-a170daa667bc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'list' }),
      });

      const data = await response.json();
      if (response.ok) {
        setMatrices(data.matrices);
      }
    } catch (error) {
      console.error('Ошибка загрузки матриц:', error);
    }
  };

  const downloadCSV = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/41fa57f2-3d91-49a2-9d09-5c174f6c3c99', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'csv',
          quadrant: selectedQuadrant || undefined,
          matrix_id: selectedMatrix ? parseInt(selectedMatrix) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка экспорта');
      }

      const csvContent = atob(data.content);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.filename;
      link.click();

      setSuccess(`Экспортировано ${data.total} клиентов`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка экспорта');
    } finally {
      setLoading(false);
    }
  };

  const exportBitrix = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/41fa57f2-3d91-49a2-9d09-5c174f6c3c99', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'bitrix',
          quadrant: selectedQuadrant || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка экспорта');
      }

      const blob = new Blob([JSON.stringify(data.leads, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `bitrix24_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      setSuccess(`Экспортировано ${data.total} лидов для Bitrix24`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка экспорта');
    } finally {
      setLoading(false);
    }
  };

  const exportAmoCRM = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://functions.poehali.dev/41fa57f2-3d91-49a2-9d09-5c174f6c3c99', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'amocrm',
          quadrant: selectedQuadrant || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка экспорта');
      }

      const blob = new Blob([JSON.stringify(data.leads, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `amocrm_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      setSuccess(`Экспортировано ${data.total} лидов для amoCRM`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка экспорта');
    } finally {
      setLoading(false);
    }
  };

  const quadrants = [
    { value: 'focus', label: '🔴 Фокус сейчас', color: 'bg-green-900 text-green-100' },
    { value: 'grow', label: '🟠 Выращивать', color: 'bg-blue-900 text-blue-100' },
    { value: 'monitor', label: '🟡 Мониторить', color: 'bg-yellow-900 text-yellow-100' },
    { value: 'archive', label: '⚪ Архив', color: 'bg-gray-700 text-gray-300' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Экспорт данных</h1>
              <p className="text-sm text-muted-foreground">
                Выгрузка клиентов в различные форматы
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent">{success}</p>
          </div>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Фильтры экспорта</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Квадрант (опционально)
              </label>
              <select
                value={selectedQuadrant}
                onChange={(e) => setSelectedQuadrant(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Все квадранты</option>
                {quadrants.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Матрица (опционально, только для CSV)
              </label>
              <select
                value={selectedMatrix}
                onChange={(e) => setSelectedMatrix(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Все матрицы</option>
                {matrices.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedQuadrant || selectedMatrix) && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Icon name="Filter" size={14} className="mr-2" />
                Активны фильтры
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedQuadrant('');
                  setSelectedMatrix('');
                }}
              >
                <Icon name="X" size={16} className="mr-2" />
                Сбросить
              </Button>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="FileSpreadsheet" size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">CSV</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Универсальный формат для Excel, Google Sheets и других таблиц
            </p>
            <Button
              className="w-full gradient-primary"
              onClick={downloadCSV}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать CSV
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="Blocks" size={32} className="text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">Bitrix24</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              JSON формат для импорта лидов в Bitrix24 CRM
            </p>
            <Button
              className="w-full"
              variant="outline"
              onClick={exportBitrix}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать JSON
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="Workflow" size={32} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">amoCRM</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              JSON формат для импорта лидов в amoCRM
            </p>
            <Button
              className="w-full"
              variant="outline"
              onClick={exportAmoCRM}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать JSON
                </>
              )}
            </Button>
          </Card>
        </div>

        <Card className="p-6 mt-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Инструкция по импорту</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>CSV:</strong> Откройте в Excel/Sheets → «Файл» → «Импорт»</li>
                <li>• <strong>Bitrix24:</strong> Раздел CRM → Импорт → Загрузить JSON файл</li>
                <li>• <strong>amoCRM:</strong> Настройки → API → Импорт сущностей</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Export;