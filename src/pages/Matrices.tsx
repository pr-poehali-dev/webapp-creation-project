import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Matrix {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by_name: string;
  criteria_count: number;
}

const Matrices = () => {
  const navigate = useNavigate();
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMatrices(token);
  }, [navigate]);

  const fetchMatrices = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/FUNCTION_URL', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMatrices(data.matrices || []);
      }
    } catch (err) {
      console.error('Error fetching matrices:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold">Матрицы приоритизации</h1>
          </div>
          <Button className="gradient-primary" onClick={() => navigate('/matrix/new')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать матрицу
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {matrices.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                <Icon name="Grid3x3" size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Создайте первую матрицу</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Матрица приоритизации поможет объективно оценивать клиентов по критериям влияния и зрелости
              </p>
              <Button className="gradient-primary" onClick={() => navigate('/matrix/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать матрицу
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {matrices.map(matrix => (
                <Card
                  key={matrix.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/matrix/${matrix.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{matrix.name}</h3>
                        {matrix.is_active ? (
                          <Badge className="bg-accent/10 text-accent border-accent/20">Активна</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Неактивна</Badge>
                        )}
                      </div>
                      
                      {matrix.description && (
                        <p className="text-muted-foreground mb-3">{matrix.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Icon name="ListChecks" size={16} />
                          <span>{matrix.criteria_count} критериев</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={16} />
                          <span>{matrix.created_by_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={16} />
                          <span>{new Date(matrix.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Icon name="ChevronRight" size={24} className="text-muted-foreground flex-shrink-0 ml-4" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Matrices;
